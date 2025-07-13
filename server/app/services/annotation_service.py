"""
어노테이션 서비스

어노테이션 관련 비즈니스 로직을 처리합니다.
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.annotation import Annotation
from ..schemas.annotation import AnnotationCreate, AnnotationUpdate, AnnotationRead


class AnnotationService:
    """어노테이션 서비스 클래스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_annotation(self, annotation_data: AnnotationCreate) -> AnnotationRead:
        """
        새로운 어노테이션을 생성합니다.
        """
        # TODO: 구현 필요
        pass
    
    async def get_annotation_by_id(self, annotation_id: int) -> Optional[AnnotationRead]:
        """
        ID로 어노테이션을 조회합니다.
        """
        # TODO: 구현 필요
        pass 