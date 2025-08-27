"""
이미지 서비스

이미지 관련 비즈니스 로직을 처리합니다.
"""

from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.image import Image, ImageStatus
from ..schemas.common import PaginationInput
from ..schemas.image import ImageCreate, ImageUpdate, ImageRead, ImageListResponse, FirstPersonImageCreate
from ..utils.gcs_client import GCSClient


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
            dataset_id=image_data.dataset_id,
            task_id=image_data.task_id if hasattr(image_data, 'task_id') else None,
            status=image_data.status if hasattr(image_data, 'status') else ImageStatus.PENDING
        )
        
        self.db.add(db_image)
        await self.db.commit()
        await self.db.refresh(db_image)
        
        return ImageRead.model_validate(db_image)
    
    async def create_first_person_image(self, image_data: FirstPersonImageCreate, user_id: int) -> ImageRead:
        """
        Create a first-person image with GCS upload.
        
        Args:
            image_data: Schema containing first-person image creation data
            
        Returns:
            ImageRead: Created image information
        """
        from ..config import settings
        
        # For development, just store the base64 data directly 
        # In production, this should upload to GCS
        if image_data.image_url.startswith('data:image') and not settings.google_cloud_project:
            # Development mode: store base64 data directly
            image_url = image_data.image_url
            width = image_data.width
            height = image_data.height
        elif image_data.image_url.startswith('data:image'):
            # Production mode: upload to GCS
            gcs_client = GCSClient()
            blob_name, width, height = gcs_client.upload_image(
                image_data.image_url,
                file_name=image_data.file_name
            )
            image_url = blob_name
        else:
            # If it's already a URL, use as is
            image_url = image_data.image_url
            width = image_data.width
            height = image_data.height
        
        db_image = Image(
            file_name=image_data.file_name,
            image_url=image_url,
            width=width,
            height=height,
            task_id=image_data.task_id,
            status=ImageStatus.PENDING,  # Default to PENDING
            dataset_id=None,  # No dataset for first-person images
            submitted_by=user_id  # Set the submitter
        )
        
        self.db.add(db_image)
        await self.db.commit()
        await self.db.refresh(db_image)
        
        # Generate signed URL if stored in GCS and not development mode
        result = ImageRead.model_validate(db_image)
        if not result.image_url.startswith(('http', 'data:')) and settings.google_cloud_project:
            # It's a blob name, generate signed URL
            gcs_client = GCSClient()
            result.image_url = gcs_client.generate_signed_url(result.image_url)
        
        return result
    
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
            item = ImageRead.model_validate(image)
            # Generate signed URL if image is stored in GCS
            if not item.image_url.startswith('http'):
                gcs_client = GCSClient()
                item.image_url = gcs_client.generate_signed_url(item.image_url)
            return item
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
        pagination: PaginationInput,
    ) -> ImageListResponse:
        """
        Get all images list.

        Args:
            pagination: PaginationInput

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
    
    async def get_images_with_filters(
        self,
        pagination: PaginationInput,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        dataset_id: Optional[int] = None,
        task_id: Optional[int] = None,
        status: Optional[ImageStatus] = None
    ) -> ImageListResponse:
        """
        Get images with various filters
        
        Args:
            pagination: PaginationInput
            search: Search text (searches in file_name)
            sort_by: Sort field (created_at, file_name, width, height)
            dataset_id: Filter by dataset ID
            task_id: Filter by task ID
            status: Filter by image status
            
        Returns:
            ImageListResponse: List of images with pagination information
        """
        # Build filter conditions
        conditions = []
        
        if dataset_id:
            conditions.append(Image.dataset_id == dataset_id)
        if task_id:
            conditions.append(Image.task_id == task_id)
        if status:
            conditions.append(Image.status == status)
        if search:
            # Search in file_name field
            search_term = f"%{search}%"
            conditions.append(Image.file_name.ilike(search_term))
        
        # Count total items
        count_query = select(func.count(Image.id))
        if conditions:
            count_query = count_query.where(*conditions)
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Build main query
        query = select(Image)
        if conditions:
            query = query.where(*conditions)
        
        # Apply sorting
        if sort_by:
            if sort_by == "created_at":
                query = query.order_by(Image.created_at.desc())
            elif sort_by == "file_name":
                query = query.order_by(Image.file_name)
            elif sort_by == "width":
                query = query.order_by(Image.width.desc())
            elif sort_by == "height":
                query = query.order_by(Image.height.desc())
            else:
                query = query.order_by(Image.created_at.desc())  # default
        else:
            query = query.order_by(Image.created_at.desc())  # default
        
        # Apply pagination
        offset = (pagination.page - 1) * pagination.limit
        query = query.offset(offset).limit(pagination.limit)
        
        result = await self.db.execute(query)
        images = result.scalars().all()
        
        pages = (total + pagination.limit - 1) // pagination.limit
        
        # Generate signed URLs for GCS images
        gcs_client = GCSClient()
        items = []
        for image in images:
            item = ImageRead.model_validate(image)
            # Generate signed URL if image is stored in GCS (not a full URL)
            if not item.image_url.startswith('http'):
                item.image_url = gcs_client.generate_signed_url(item.image_url)
            items.append(item)
        
        return ImageListResponse(
            items=items,
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            pages=pages
        )
    
    async def update_image(self, image_id: int, image_data: ImageUpdate) -> Optional[ImageRead]:
        """
        Update an existing image.
        
        Args:
            image_id: ID of the image to update
            image_data: Schema containing updated image data
            
        Returns:
            Optional[ImageRead]: Updated image information, None if not found
        """
        result = await self.db.execute(
            select(Image).where(Image.id == image_id)
        )
        image = result.scalar_one_or_none()
        
        if not image:
            return None
        
        # Update fields if provided
        update_data = image_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(image, field, value)
        
        await self.db.commit()
        await self.db.refresh(image)
        
        return ImageRead.model_validate(image)
    
    async def delete_image(self, image_id: int) -> bool:
        """
        Delete an image.
        
        Args:
            image_id: ID of the image to delete
            
        Returns:
            bool: Success status of deletion
        """
        result = await self.db.execute(
            select(Image).where(Image.id == image_id)
        )
        image = result.scalar_one_or_none()
        
        if not image:
            return False
        
        await self.db.delete(image)
        await self.db.commit()
        return True