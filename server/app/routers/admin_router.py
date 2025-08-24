"""
Admin Router

Admin-only endpoints for managing images and other administrative tasks
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.admin import verify_admin
from ..schemas.common import PaginationInput
from ..schemas.image import ImageRead, ImageListResponse, ImageStatus
from ..services import ImageService

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(verify_admin)]
)


@router.get("/images/pending", response_model=ImageListResponse)
async def get_pending_images(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search in file names"),
    sort_by: Optional[str] = Query("created_at", description="Sort by field (created_at, file_name, width, height)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin only: Get all pending images for review
    """
    image_service = ImageService(db)
    return await image_service.get_images_with_filters(
        pagination=PaginationInput(page=page, limit=limit),
        search=search,
        sort_by=sort_by,
        status=ImageStatus.PENDING
    )


@router.put("/images/{image_id}/approve", response_model=ImageRead)
async def approve_image(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Admin only: Approve a pending image
    """
    image_service = ImageService(db)
    
    # Check if image exists
    current_image = await image_service.get_image_by_id(image_id)
    if not current_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Check if image is in pending status
    if current_image.status != ImageStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image is already {current_image.status.value.lower()}"
        )
    
    try:
        # Update image status to approved
        from ..schemas.image import ImageUpdate
        update_data = ImageUpdate(status=ImageStatus.APPROVED)
        updated_image = await image_service.update_image(image_id, update_data)
        
        if not updated_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to update image"
            )
        
        return updated_image
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/images/{image_id}/reject", response_model=ImageRead)
async def reject_image(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Admin only: Reject a pending image
    """
    image_service = ImageService(db)
    
    # Check if image exists
    current_image = await image_service.get_image_by_id(image_id)
    if not current_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Check if image is in pending status
    if current_image.status != ImageStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image is already {current_image.status.value.lower()}"
        )
    
    try:
        # Update image status to rejected
        from ..schemas.image import ImageUpdate
        update_data = ImageUpdate(status=ImageStatus.REJECTED)
        updated_image = await image_service.update_image(image_id, update_data)
        
        if not updated_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to update image"
            )
        
        return updated_image
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/images/{image_id}", response_model=ImageRead)
async def get_image_details(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Admin only: Get detailed information about a specific image
    """
    image_service = ImageService(db)
    image = await image_service.get_image_by_id(image_id)
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return image