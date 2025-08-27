"""
이미지 라우터

이미지 관련 API 엔드포인트들을 정의합니다.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
import base64
import io

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.common import PaginationInput
from ..schemas.image import ImageCreate, ImageUpdate, ImageRead, ImageListResponse, FirstPersonImageCreate, ImageStatus
from ..services import ImageService, DatasetService

router = APIRouter(
    prefix="/images",
    tags=["images"]
)


@router.post("/", response_model=ImageRead, status_code=status.HTTP_201_CREATED)
async def add_image(
    image_data: ImageCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new image to specific dataset.
    """
    image_service = ImageService(db)
    
    # If dataset_id is provided, check permissions
    if image_data.dataset_id:
        dataset_service = DatasetService(db)
        dataset = await dataset_service.get_dataset_by_id(image_data.dataset_id)

        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )

        if dataset.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to add images to this dataset"
            )

    try:
        return await image_service.create_image(image_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/first-person", response_model=ImageRead, status_code=status.HTTP_201_CREATED)
async def add_first_person_image(
    image_data: FirstPersonImageCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new first-person image with task association.
    """
    image_service = ImageService(db)
    
    try:
        return await image_service.create_first_person_image(image_data, current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/", response_model=ImageListResponse)
async def get_images(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search in file names"),
    sort_by: Optional[str] = Query(None, description="Sort by field (created_at, file_name, width, height)"),
    dataset_id: Optional[int] = Query(None, description="Filter by dataset ID"),
    task_id: Optional[int] = Query(None, description="Filter by task ID"),
    status: Optional[ImageStatus] = Query(None, description="Filter by image status"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all images with optional filtering, searching and sorting.
    """
    image_service = ImageService(db)
    return await image_service.get_images_with_filters(
        pagination=PaginationInput(page=page, limit=limit),
        search=search,
        sort_by=sort_by,
        dataset_id=dataset_id,
        task_id=task_id,
        status=status
    )


@router.get("/{image_id}", response_model=ImageRead)
async def get_image(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get specific image by ID.
    """
    image_service = ImageService(db)
    image = await image_service.get_image_by_id(image_id)

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    return image


@router.put("/{image_id}", response_model=ImageRead)
async def update_image(
    image_id: int,
    image_data: ImageUpdate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update image information.
    
    Args:
        image_id: ID of the image to update
        image_data: Updated image data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        ImageRead: Updated image information
    """
    image_service = ImageService(db)
    
    # Check if image exists and get current image info
    current_image = await image_service.get_image_by_id(image_id)
    if not current_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Check permission - only dataset owner can update images
    dataset_service = DatasetService(db)
    dataset = await dataset_service.get_dataset_by_id(current_image.dataset_id)
    
    if not dataset or dataset.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this image"
        )
    
    try:
        updated_image = await image_service.update_image(image_id, image_data)
        
        if not updated_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
        
        return updated_image
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{image_id}")
async def delete_image(
    image_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an image.
    
    Args:
        image_id: ID of the image to delete
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        dict: Success message
    """
    image_service = ImageService(db)
    
    # Check if image exists and get current image info
    current_image = await image_service.get_image_by_id(image_id)
    if not current_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Check permission - only dataset owner can delete images
    dataset_service = DatasetService(db)
    dataset = await dataset_service.get_dataset_by_id(current_image.dataset_id)
    
    if not dataset or dataset.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this image"
        )
    
    deleted = await image_service.delete_image(image_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return {"message": "Image successfully deleted"}
