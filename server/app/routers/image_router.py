"""
이미지 라우터

이미지 관련 API 엔드포인트들을 정의합니다.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.image import ImageCreate, ImageUpdate, ImageRead

router = APIRouter(
    prefix="/images",
    tags=["images"]
)


@router.post("/", response_model=ImageRead, status_code=status.HTTP_201_CREATED)
async def create_image(
    image_data: ImageCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    새로운 이미지를 생성합니다.
    """
    # TODO: ImageService 구현
    pass


@router.get("/{image_id}", response_model=ImageRead)
async def get_image(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    특정 이미지를 가져옵니다.
    """
    # TODO: ImageService 구현
    pass 