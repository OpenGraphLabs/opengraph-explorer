"""
데이터셋 서비스

데이터셋 관련 비즈니스 로직을 처리합니다.
"""

from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.dataset import Dataset
from ..schemas.dataset import (
    DatasetCreate,
    DatasetUpdate,
    DatasetRead,
    DatasetWithStats,
    DatasetFilter,
    DatasetListResponse
)
from ..schemas.common import Pagination


class DatasetService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_dataset(self, dataset_data: DatasetCreate, created_by: Optional[int] = None) -> DatasetRead:
        """
        Create a new dataset in the database.
        
        Args:
            dataset_data: Schema containing dataset creation data
            created_by: User ID of the dataset creator
            
        Returns:
            DatasetRead: Created dataset information
        """
        db_dataset = Dataset(
            name=dataset_data.name,
            description=dataset_data.description,
            tags=dataset_data.tags,
            dictionary_id=dataset_data.dictionary_id,
            created_by=created_by
        )
        
        self.db.add(db_dataset)
        await self.db.commit()
        await self.db.refresh(db_dataset)
        
        return DatasetRead.model_validate(db_dataset)
    
    async def get_dataset_by_id(self, dataset_id: int) -> Optional[DatasetRead]:
        """
        Get a dataset by its ID.
        
        Args:
            dataset_id: Dataset ID
            
        Returns:
            Optional[DatasetRead]: Dataset information or None if not found
        """
        result = await self.db.execute(
            select(Dataset).where(Dataset.id == dataset_id)
        )
        dataset = result.scalar_one_or_none()
        
        if dataset:
            return DatasetRead.model_validate(dataset)
        return None
    
    async def get_dataset_by_name(self, name: str) -> Optional[DatasetRead]:
        """
        Get a dataset by its name.
        
        Args:
            name: Dataset name
            
        Returns:
            Optional[DatasetRead]: Dataset information or None if not found
        """
        result = await self.db.execute(
            select(Dataset).where(Dataset.name == name)
        )
        dataset = result.scalar_one_or_none()
        
        if dataset:
            return DatasetRead.model_validate(dataset)
        return None
    
    async def update_dataset(self, dataset_id: int, dataset_data: DatasetUpdate) -> Optional[DatasetRead]:
        """
        Update an existing dataset.
        
        Args:
            dataset_id: Dataset ID
            dataset_data: Schema containing dataset update data
            
        Returns:
            Optional[DatasetRead]: Updated dataset information or None if dataset not found
        """
        result = await self.db.execute(
            select(Dataset).where(Dataset.id == dataset_id)
        )
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            return None
        
        update_data = dataset_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(dataset, field):
                setattr(dataset, field, value)
        
        await self.db.commit()
        await self.db.refresh(dataset)
        
        return DatasetRead.model_validate(dataset)
    
    async def delete_dataset(self, dataset_id: int) -> bool:
        """
        Delete a dataset by its ID.
        
        Args:
            dataset_id: Dataset ID
            
        Returns:
            bool: Success status of deletion
        """
        result = await self.db.execute(
            select(Dataset).where(Dataset.id == dataset_id)
        )
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            return False
        
        await self.db.delete(dataset)
        await self.db.commit()
        return True
    
    async def get_datasets_list(
        self,
        pagination: Pagination,
        filter_params: Optional[DatasetFilter] = None,
        created_by: Optional[int] = None
    ) -> DatasetListResponse:
        """
        List datasets with pagination and optional filters.
        
        Args:
            pagination: Pagination parameters
            filter_params: Optional filter parameters
            created_by: Optional creator filter
            
        Returns:
            DatasetListResponse: Paginated dataset list with metadata
        """
        query = select(Dataset).options(selectinload(Dataset.images))
        
        if filter_params:
            if filter_params.name:
                query = query.where(Dataset.name.contains(filter_params.name))
            if filter_params.tags:
                query = query.where(Dataset.tags.overlap(filter_params.tags))
            if filter_params.dictionary_id:
                query = query.where(Dataset.dictionary_id == filter_params.dictionary_id)
            if filter_params.created_by:
                query = query.where(Dataset.created_by == filter_params.created_by)
            if filter_params.created_after:
                query = query.where(Dataset.created_at >= filter_params.created_after)
            if filter_params.created_before:
                query = query.where(Dataset.created_at <= filter_params.created_before)
        
        if created_by:
            query = query.where(Dataset.created_by == created_by)
        
        # Count total items
        count_query = select(func.count(Dataset.id))
        if filter_params:
            if filter_params.name:
                count_query = count_query.where(Dataset.name.contains(filter_params.name))
            if filter_params.tags:
                count_query = count_query.where(Dataset.tags.overlap(filter_params.tags))
            if filter_params.dictionary_id:
                count_query = count_query.where(Dataset.dictionary_id == filter_params.dictionary_id)
            if filter_params.created_by:
                count_query = count_query.where(Dataset.created_by == filter_params.created_by)
            if filter_params.created_after:
                count_query = count_query.where(Dataset.created_at >= filter_params.created_after)
            if filter_params.created_before:
                count_query = count_query.where(Dataset.created_at <= filter_params.created_before)
        
        if created_by:
            count_query = count_query.where(Dataset.created_by == created_by)
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Apply ordering
        if pagination.order_by == "name":
            if pagination.order == "asc":
                query = query.order_by(Dataset.name.asc())
            else:
                query = query.order_by(Dataset.name.desc())
        else:  # Default to created_at
            if pagination.order == "asc":
                query = query.order_by(Dataset.created_at.asc())
            else:
                query = query.order_by(Dataset.created_at.desc())
        
        # Apply pagination
        offset = (pagination.page - 1) * pagination.limit
        query = query.offset(offset).limit(pagination.limit)
        
        result = await self.db.execute(query)
        datasets = result.scalars().all()
        
        # Build response items with image and annotation counts
        items = []
        for dataset in datasets:
            items.append(DatasetWithStats(
                id=dataset.id,
                name=dataset.name,
                description=dataset.description,
                tags=dataset.tags,
                dictionary_id=dataset.dictionary_id,
                created_by=dataset.created_by,
                created_at=dataset.created_at,
                image_count=len(dataset.images),
            ))
        
        pages = (total + pagination.limit - 1) // pagination.limit
        
        return DatasetListResponse(
            items=items,
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            pages=pages
        )
    
    async def get_datasets_count(self, created_by: Optional[int] = None) -> int:
        """
        Get the total number of datasets, optionally filtered by creator.
        
        Args:
            created_by: Optional creator filter
            
        Returns:
            int: Total number of datasets
        """
        query = select(func.count(Dataset.id))
        
        if created_by:
            query = query.where(Dataset.created_by == created_by)
        
        result = await self.db.execute(query)
        return result.scalar() or 0 