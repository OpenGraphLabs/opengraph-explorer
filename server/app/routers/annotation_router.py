"""
어노테이션 라우터

어노테이션 관련 API 엔드포인트들을 정의합니다.
"""

from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.annotation import AnnotationCreate, AnnotationUpdate, AnnotationRead, AnnotationUserCreate
from ..services import AnnotationService

router = APIRouter(
    prefix="/annotations",
    tags=["annotations"]
)


@router.post("/", response_model=AnnotationRead, status_code=status.HTTP_201_CREATED)
async def create_user_annotation(
    annotation_data: AnnotationUserCreate,
    # current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new annotation
    """
    annotation_service = AnnotationService(db)
    
    annotation_create_data = AnnotationCreate(
        **annotation_data.model_dump(),
        source_type="USER",
        status="PENDING"
    )
    
    return await annotation_service.create_annotation(annotation_create_data)


@router.get("/{annotation_id}", response_model=AnnotationRead)
async def get_annotation(
    annotation_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a annotation by id
    """
    annotation_service = AnnotationService(db)
    annotation = await annotation_service.get_annotation_by_id(annotation_id)

    if not annotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found",
        )

    return annotation


@router.get("/image/{image_id}", response_model=List[AnnotationRead])
async def get_annotations_by_image(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all annotations for a specific image with client-friendly mask information
    """
    annotation_service = AnnotationService(db)
    annotations = await annotation_service.get_annotations_by_image_id(image_id)
    
    return annotations

