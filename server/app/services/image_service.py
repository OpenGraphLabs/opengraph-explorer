"""
이미지 서비스

이미지 관련 비즈니스 로직을 처리합니다.
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.image import Image
from ..schemas.image import ImageCreate, ImageUpdate, ImageRead


class ImageService:
    """이미지 서비스 클래스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_image(self, image_data: ImageCreate) -> ImageRead:
        """
        새로운 이미지를 생성합니다.
        """
        # TODO: 구현 필요
        pass
    
    async def get_image_by_id(self, image_id: int) -> Optional[ImageRead]:
        """
        ID로 이미지를 조회합니다.
        """
        # TODO: 구현 필요
        pass 