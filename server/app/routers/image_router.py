"""
이미지 라우터

이미지 관련 API 엔드포인트들을 정의합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.image import ImageCreate, ImageUpdate, ImageRead
from ..services import ImageService

router = APIRouter(
    prefix="/images",
    tags=["images"]
)


@router.post("/", response_model=ImageRead, status_code=status.HTTP_201_CREATED)
async def add_image(
    image_data: ImageCreate,
    request: Request,
    # current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new image to specific dataset.
    """
    image_service = ImageService(db)

    try:
        user_id = getattr(request.state, 'user_id', None)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User info is required"
            )
        return await image_service.create_image(image_data)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image data"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
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
