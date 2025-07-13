"""
어노테이션 라우터

어노테이션 관련 API 엔드포인트들을 정의합니다.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.annotation import AnnotationCreate, AnnotationUpdate, AnnotationRead

router = APIRouter(
    prefix="/annotations",
    tags=["annotations"]
)


@router.post("/", response_model=AnnotationRead, status_code=status.HTTP_201_CREATED)
async def create_annotation(
    annotation_data: AnnotationCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    새로운 어노테이션을 생성합니다.
    """
    # TODO: AnnotationService 구현
    pass


@router.get("/{annotation_id}", response_model=AnnotationRead)
async def get_annotation(
    annotation_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    특정 어노테이션을 가져옵니다.
    """
    # TODO: AnnotationService 구현
    pass 