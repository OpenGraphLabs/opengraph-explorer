"""
이미지 서비스

이미지 관련 비즈니스 로직을 처리합니다.
"""

from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.image import Image
from ..schemas.common import Pagination
from ..schemas.image import ImageCreate, ImageUpdate, ImageRead, ImageListResponse


class ImageService:
    """이미지 서비스 클래스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_image(self, image_data: ImageCreate) -> ImageRead:
        """
        Create a new image.
        
        Args:
            image_data: Schema containing image creation data
            
        Returns:
            ImageRead: Created image information
        """
        db_image = Image(
            file_name=image_data.file_name,
            image_url=image_data.image_url,
            width=image_data.width,
            height=image_data.height,
            dataset_id=image_data.dataset_id
        )
        
        self.db.add(db_image)
        await self.db.commit()
        await self.db.refresh(db_image)
        
        return ImageRead.model_validate(db_image)
    
    async def get_image_by_id(self, image_id: int) -> Optional[ImageRead]:
        """
        Get specific image by ID.
        
        Args:
            image_id: Image ID
            
        Returns:
            Optional[ImageRead]: Image information or None if not found
        """
        result = await self.db.execute(
            select(Image).where(Image.id == image_id)
        )
        image = result.scalar_one_or_none()
        
        if image:
            return ImageRead.model_validate(image)
        return None
    
    async def get_images_by_dataset_id(self, dataset_id: int) -> List[ImageRead]:
        """
        특정 데이터셋에 포함된 이미지 목록을 조회합니다.
        
        Args:
            dataset_id: Dataset ID
            
        Returns:
            List[ImageRead]: List of images in the dataset
        """
        result = await self.db.execute(
            select(Image).where(Image.dataset_id == dataset_id)
        )
        images = result.scalars().all()
        
        return [ImageRead.model_validate(image) for image in images]

    async def get_images_list(
        self,
        pagination: Pagination,
    ) -> ImageListResponse:
        """
        Get all images list.

        Args:
            pagination: Pagination

        Returns:
            ImageListResponse: List of images with pagination information
        """
        # Count total items
        count_query = select(func.count(Image.id))

        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination
        query = select(Image).order_by(Image.created_at.desc())

        offset = (pagination.page - 1) * pagination.limit
        query = query.offset(offset).limit(pagination.limit)

        result = await self.db.execute(query)
        images = result.scalars().all()

        pages = (total + pagination.limit - 1) // pagination.limit

        return ImageListResponse(
            items=[ImageRead.model_validate(image) for image in images],
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            pages=pages
        )