"""
Category Service

Business logic for category-related operations
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.category import Category
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryRead


class CategoryService:
    """Category service class"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_category(self, category_data: CategoryCreate) -> CategoryRead:
        """
        Create a new category.

        Args:
            category_data: Schema containing the new category data.

        Returns:
            CategoryRead: Created category information.
        """
        db_category = Category(
            name=category_data.name,
        )

        self.db.add(db_category)
        await self.db.commit()
        await self.db.refresh(db_category)

        return CategoryRead.model_validate(db_category)
    
    async def get_category_by_id(self, category_id: int) -> Optional[CategoryRead]:
        """
        Get a category by ID.

        Args:
            category_id: ID of the category.

        Returns:
            Optional[CategoryRead]: Category information or None if not found.
        """
        result = await self.db.execute(
            select(Category).where(Category.id == category_id)
        )
        category = result.scalar_one_or_none()

        if category:
            return CategoryRead.model_validate(category)
        return None

    async def update_category(self, category_id: int, category_data: CategoryUpdate) -> Optional[CategoryRead]:
        """
        Update an existing category.

        Args:
            category_id: ID of the category.
            category_data: Schema containing the new category data.

        Returns:
            Optional[CategoryRead]: Updated category information or None if not found.
        """
        result = await self.db.execute(
            select(Category).where(Category.id == category_id)
        )
        category = result.scalar_one_or_none()

        if not category:
            return None

        updated_category = category_data.model_dump(exclude_unset=True)

        for field, value in updated_category.items():
            if hasattr(category, field):
                setattr(category, field, value)

        await self.db.commit()
        await self.db.refresh(category)

        return CategoryRead.model_validate(category)

    async def delete_category(self, category_id: int) -> bool:
        """
        Delete a category by its ID.

        Args:
            category_id: ID of the category.

        Returns:
            bool: Success status of deletion.
        """
        result = await self.db.execute(
            select(Category).where(Category.id == category_id)
        )
        category = result.scalar_one_or_none()

        if not category:
            return False

        await self.db.delete(category)
        await self.db.commit()
        return True
