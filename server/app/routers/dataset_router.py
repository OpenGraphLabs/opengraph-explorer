"""
데이터셋 라우터

데이터셋 관련 API 엔드포인트들을 정의합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.common import Pagination
from ..schemas.dataset import (
    DatasetCreate,
    DatasetUpdate,
    DatasetRead,
    DatasetListResponse,
)
from ..schemas.image import ImageListResponse
from ..services import DatasetService, ImageService

router = APIRouter(
    prefix="/datasets",
    tags=["datasets"]
)


@router.post("/", response_model=DatasetRead, status_code=status.HTTP_201_CREATED)
async def create_dataset(
    dataset_data: DatasetCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new dataset.
    """
    dataset_service = DatasetService(db)

    try:
        return await dataset_service.create_dataset(dataset_data, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/", response_model=DatasetListResponse)
async def get_datasets(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    List all datasets.
    """
    dataset_service = DatasetService(db)
    return await dataset_service.get_datasets_list(
        pagination=Pagination(page=page, limit=limit),
    )


@router.get("/{dataset_id}", response_model=DatasetRead)
async def get_dataset(
    dataset_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a dataset by id.
    """
    dataset_service = DatasetService(db)
    dataset = await dataset_service.get_dataset_by_id(dataset_id)

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )

    return dataset


@router.put("/{dataset_id}", response_model=DatasetRead)
async def update_dataset(
    dataset_id: int,
    dataset_data: DatasetUpdate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    데이터셋을 업데이트합니다.
    """
    # TODO: DatasetService 구현
    pass


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(
    dataset_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    데이터셋을 삭제합니다.
    """
    # TODO: DatasetService 구현
    pass


@router.get("/{dataset_id}/images", response_model=ImageListResponse)
async def get_dataset_images(
    dataset_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all images in a dataset.
    """
    dataset_service = DatasetService(db)
    image_service = ImageService(db)
    
    # Check if dataset exists
    dataset = await dataset_service.get_dataset_by_id(dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Get images for the dataset
    images = await image_service.get_images_by_dataset_id(dataset_id)
    
    # Apply pagination
    start = (page - 1) * limit
    end = start + limit
    paginated_images = images[start:end]
    
    total = len(images)
    pages = (total + limit - 1) // limit
    
    return ImageListResponse(
        items=paginated_images,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    ) 