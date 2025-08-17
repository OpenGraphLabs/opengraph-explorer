"""
어노테이션 라우터

어노테이션 관련 API 엔드포인트들을 정의합니다.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.annotation import AnnotationCreate, AnnotationUpdate, AnnotationRead, AnnotationUserCreate, AnnotationListResponse, AnnotationClientRead
from ..schemas.common import Pagination
from ..schemas.user_annotation_selection import (
    UserAnnotationSelectionCreate,
    UserAnnotationSelectionBatchCreate,
    UserAnnotationSelectionBatchResponse,
    UserAnnotationSelectionRead,
    UserAnnotationSelectionUpdate,
    AnnotationSelectionStats,
    AnnotationSelectionSummary
)
from ..services import AnnotationService
from ..services.user_annotation_selection_service import UserAnnotationSelectionService

router = APIRouter(
    prefix="/annotations",
    tags=["annotations"]
)


@router.get("/", response_model=AnnotationListResponse)
async def get_annotations(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search in status or source_type"),
    sort_by: Optional[str] = Query(None, description="Sort by field (created_at, updated_at, area)"),
    image_id: Optional[int] = Query(None, description="Filter by image ID"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    status: Optional[str] = Query(None, description="Filter by status (PENDING, APPROVED, REJECTED)"),
    source_type: Optional[str] = Query(None, description="Filter by source type (AUTO, USER)"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all annotations with optional filtering, searching and sorting.
    """
    annotation_service = AnnotationService(db)
    return await annotation_service.get_annotations_with_filters(
        pagination=Pagination(page=page, limit=limit),
        search=search,
        sort_by=sort_by,
        image_id=image_id,
        category_id=category_id,
        status=status,
        source_type=source_type
    )


@router.post("/", response_model=AnnotationRead, status_code=status.HTTP_201_CREATED)
async def create_annotation(
    annotation_data: AnnotationCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new annotation.
    """
    annotation_service = AnnotationService(db)
    
    try:
        return await annotation_service.create_annotation(annotation_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/approved", response_model=AnnotationListResponse)
async def get_approved_annotations(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    List all approved annotations.
    """
    annotation_service = AnnotationService(db)
    return await annotation_service.get_approved_user_annotations(
        pagination=Pagination(page=page, limit=limit)
    )


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


@router.get("/image/{image_id}", response_model=List[AnnotationClientRead])
async def get_annotations_by_image(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all annotations for a specific image with client-friendly format (polygon data, no RLE)
    """
    annotation_service = AnnotationService(db)
    annotations = await annotation_service.get_annotations_by_image_id_for_client(image_id)
    
    return annotations


@router.get("/image/{image_id}/approved", response_model=List[AnnotationClientRead])
async def get_approved_annotations_by_image(
        image_id: int,
        db: AsyncSession = Depends(get_db)
):
    """
    Get all annotations for a specific image with client-friendly format (polygon data, no RLE)
    """
    annotation_service = AnnotationService(db)
    annotations = await annotation_service.get_approved_user_annotations_by_image_id_for_client(image_id)

    return annotations


# ==================== User Annotation Selections ====================

@router.post("/selections", response_model=UserAnnotationSelectionRead, status_code=status.HTTP_201_CREATED)
async def create_annotation_selection(
    selection_data: UserAnnotationSelectionCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new annotation selection

    Records user selections that combine multiple AUTO annotations to form a meaningful entity.
    If the same selection is made by five or more users, it is automatically marked as APPROVED.
    """
    selection_service = UserAnnotationSelectionService(db)
    return await selection_service.create_selection(current_user.id, selection_data)


@router.post("/selections/batch", response_model=UserAnnotationSelectionBatchResponse, status_code=status.HTTP_201_CREATED)
async def create_annotation_selections_batch(
    batch_data: UserAnnotationSelectionBatchCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create multiple annotation selections in batch
    
    Allows creating multiple annotation selections at once for efficiency.
    Each selection in the batch is processed independently - some may succeed while others fail.
    
    Request body example:
    {
        "selections": [
            {
                "image_id": 3,
                "selected_annotation_ids": [1, 3, 4],
                "category_id": 5
            },
            {
                "image_id": 3, 
                "selected_annotation_ids": [2, 6, 7],
                "category_id": 7
            }
        ]
    }
    """
    selection_service = UserAnnotationSelectionService(db)
    return await selection_service.create_selections_batch(current_user.id, batch_data)


@router.get("/selections/me", response_model=List[UserAnnotationSelectionRead])
async def get_my_annotation_selections(
    image_id: Optional[int] = Query(None, description="특정 이미지의 선택만 조회"),
    selection_status: Optional[str] = Query(None, description="특정 상태의 선택만 조회 (PENDING|APPROVED|REJECTED)"),
    limit: int = Query(100, ge=1, le=1000, description="조회할 선택 수"),
    offset: int = Query(0, ge=0, description="건너뛸 선택 수"),
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List annotation selections for specific user
    """
    selection_service = UserAnnotationSelectionService(db)
    return await selection_service.get_user_selections(
        user_id=current_user.id,
        image_id=image_id,
        status=selection_status,
        limit=limit,
        offset=offset
    )


@router.get("/selections/{selection_id}", response_model=UserAnnotationSelectionRead)
async def get_annotation_selection(
    selection_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a annotation selection by id
    """
    selection_service = UserAnnotationSelectionService(db)
    selection = await selection_service.get_selection_by_id(selection_id)
    
    if not selection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Annotation Selection not found",
        )
    
    return selection


@router.put("/selections/{selection_id}", response_model=UserAnnotationSelectionRead)
async def update_annotation_selection(
    selection_id: int,
    update_data: UserAnnotationSelectionUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a annotation selection

    Mainly used for category update or status change by administrator
    """
    selection_service = UserAnnotationSelectionService(db)
    updated_selection = await selection_service.update_selection(selection_id, update_data)
    
    if not updated_selection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Annotation Selection not found",
        )
    
    return updated_selection


@router.delete("/selections/{selection_id}")
async def delete_annotation_selection(
    selection_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a annotation selection (only available for that annotator)
    """
    selection_service = UserAnnotationSelectionService(db)
    deleted = await selection_service.delete_selection(selection_id, current_user.id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Annotation Selection not found",
        )
    
    return {"message": "Successfully deleted"}


@router.get("/selections/image/{image_id}/stats", response_model=List[AnnotationSelectionStats])
async def get_image_selection_stats(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get annotation selection stats for a specific image

    Provides information such as the number of users who made the same selection and whether it qualifies for approval.
    """
    selection_service = UserAnnotationSelectionService(db)
    return await selection_service.get_image_selection_stats(image_id)


# ==================== Core Annotation CRUD Operations ====================

@router.put("/{annotation_id}", response_model=AnnotationRead)
async def update_annotation(
    annotation_id: int,
    annotation_data: AnnotationUpdate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing annotation.
    
    Args:
        annotation_id: ID of the annotation to update
        annotation_data: Updated annotation data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        AnnotationRead: Updated annotation
    """
    annotation_service = AnnotationService(db)
    
    updated_annotation = await annotation_service.update_annotation(annotation_id, annotation_data)
    
    if not updated_annotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found"
        )
    
    return updated_annotation


@router.delete("/{annotation_id}")
async def delete_annotation(
    annotation_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an annotation.
    
    Args:
        annotation_id: ID of the annotation to delete
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        dict: Success message
    """
    annotation_service = AnnotationService(db)
    
    deleted = await annotation_service.delete_annotation(annotation_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found"
        )
    
    return {"message": "Annotation successfully deleted"}



