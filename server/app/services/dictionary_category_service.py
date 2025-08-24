"""
Dictionary Category Service

Business logic for dictionary-category association operations
"""

from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.dictionary_category import DictionaryCategory
from ..models.category import Category
from ..schemas.category import CategoryListResponse, CategoryRead
from ..schemas.common import PaginationInput
from ..schemas.dictionary_category import DictionaryCategoryCreate, DictionaryCategoryRead, DictionaryCategoryBatchCreate


class DictionaryCategoryService:
    """Dictionary-Category association service class"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_dictionary_category(self, data: DictionaryCategoryCreate) -> DictionaryCategoryRead:
        """
        Create a new dictionary-category association.

        Args:
            data: Schema containing the new dictionary-category association.

        Returns:
            DictionaryCategoryRead: Created dictionary-category association
        """
        db_dictionary_category = DictionaryCategory(
            dictionary_id=data.dictionary_id,
            category_id=data.category_id,
        )

        self.db.add(db_dictionary_category)
        await self.db.commit()
        await self.db.refresh(db_dictionary_category)

        return DictionaryCategoryRead.model_validate(db_dictionary_category)
    
    async def get_categories_by_dictionary_id(
            self,
            dictionary_id: int,
            pagination: PaginationInput,
    ) -> CategoryListResponse:
        """
        Get all categories associated with a dictionary.

        Args:
            dictionary_id: ID of the dictionary.
            pagination: PaginationInput

        Returns:
            List[DictionaryCategoryRead]: List of dictionaries category associations
        """
        # Count total items
        count_query = select(func.count(DictionaryCategory.dictionary_id))

        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination
        query = select(DictionaryCategory).where(DictionaryCategory.dictionary_id == dictionary_id)

        offset = (pagination.page - 1) * pagination.limit
        query = query.offset(offset).limit(pagination.limit)

        result = await self.db.execute(query)
        dictionary_categories = result.scalars().all()

        # Batch get categories of that page
        category_list = []
        for dictionary_category in dictionary_categories:
            category_list.append(dictionary_category.category_id)

        category_batch_get_query = select(Category).where(
            Category.id.in_(category_list)
        )
        category_batch_get_result = await self.db.execute(category_batch_get_query)
        categories = category_batch_get_result.scalars().all()

        pages = (total + pagination.limit - 1) // pagination.limit

        return CategoryListResponse(
            items=[CategoryRead.model_validate(category) for category in categories],
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            pages=pages
        )
    
    async def get_dictionaries_by_category_id(self, category_id: int) -> List[DictionaryCategoryRead]:
        """
        Get all dictionaries associated with a category.

        Args:
            category_id: ID of the category.

        Returns:
            List[DictionaryCategoryRead]: List of dictionaries category associations
        """
        result = await self.db.execute(
            select(DictionaryCategory).where(DictionaryCategory.category_id == category_id)
        )
        dictionaries = result.scalars().all()

        return [DictionaryCategoryRead.model_validate(dictionary_category) for dictionary_category in dictionaries]
    
    async def delete_dictionary_category(self, dictionary_id: int, category_id: int) -> bool:
        """
        Delete a dictionary-category association.

        Args:
            dictionary_id: ID of the dictionary.
            category_id: ID of the category.

        Returns:
            bool: Success status of deletion.
        """
        result = await self.db.execute(
            select(DictionaryCategory).where(
                DictionaryCategory.dictionary_id == dictionary_id,
                DictionaryCategory.category_id == category_id
            )
        )
        
        dictionary_category = result.scalar_one_or_none()
        
        if not dictionary_category:
            return False
        
        await self.db.delete(dictionary_category)
        await self.db.commit()
        
        return True
    
    async def create_dictionary_categories_batch(self, data: DictionaryCategoryBatchCreate) -> List[DictionaryCategoryRead]:
        """
        Create multiple dictionary-category associations for one dictionary.
        All operations succeed or all fail (atomic transaction).

        Args:
            data: Schema containing dictionary_id and list of category_ids.

        Returns:
            List[DictionaryCategoryRead]: List of created/existing associations

        Raises:
            Exception: If any category_id fails to be processed
        """
        created_associations = []

        try:
            for category_id in data.category_ids:
                # Check if association already exists
                existing_query = select(DictionaryCategory).where(
                    DictionaryCategory.dictionary_id == data.dictionary_id,
                    DictionaryCategory.category_id == category_id
                )
                existing_result = await self.db.execute(existing_query)
                existing_association = existing_result.scalar_one_or_none()
                
                if existing_association:
                    created_associations.append(DictionaryCategoryRead.model_validate(existing_association))
                    continue

                # Create new association
                db_dictionary_category = DictionaryCategory(
                    dictionary_id=data.dictionary_id,
                    category_id=category_id,
                )
                
                self.db.add(db_dictionary_category)
                await self.db.flush()
                
                created_associations.append(DictionaryCategoryRead.model_validate(db_dictionary_category))

            # Commit all operations
            await self.db.commit()
            return created_associations
            
        except Exception:
            await self.db.rollback()
            raise