"""
어노테이션 서비스

어노테이션 관련 비즈니스 로직을 처리합니다.
"""

from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.annotation import Annotation
from ..schemas.annotation import AnnotationCreate, AnnotationUpdate, AnnotationRead
from ..utils.segmentation import get_mask_info_for_client


class AnnotationService:
    """어노테이션 서비스 클래스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _create_annotation_read_with_mask_info(self, annotation: Annotation) -> AnnotationRead:
        """
        Annotation 모델을 AnnotationRead로 변환하면서 mask_info 추가
        
        Args:
            annotation: Database annotation model
            
        Returns:
            AnnotationRead: Annotation with client-friendly mask information
        """
        # 기본 AnnotationRead 생성
        annotation_read = AnnotationRead.model_validate(annotation)
        
        # 클라이언트용 마스크 정보 생성
        mask_info = get_mask_info_for_client(
            segmentation_counts=annotation.segmentation_counts,
            segmentation_size=annotation.segmentation_size,
            bbox=annotation.bbox
        )
        
        # mask_info 추가
        annotation_read.mask_info = mask_info
        
        return annotation_read
    
    async def create_annotation(self, annotation_data: AnnotationCreate) -> AnnotationRead:
        """
        새로운 어노테이션을 생성합니다.
        
        Args:
            annotation_data: Schema containing annotation creation data
            
        Returns:
            AnnotationRead: Created annotation information
        """
        # AUTO 타입의 경우 created_by를 None으로 설정
        created_by = None if annotation_data.source_type == "AUTO" else annotation_data.created_by
        
        db_annotation = Annotation(
            bbox=annotation_data.bbox,
            area=annotation_data.area,
            segmentation_size=annotation_data.segmentation_size,
            segmentation_counts=annotation_data.segmentation_counts,
            point_coords=annotation_data.point_coords,
            is_crowd=annotation_data.is_crowd,
            predicted_iou=annotation_data.predicted_iou,
            stability_score=annotation_data.stability_score,
            status=annotation_data.status,
            source_type=annotation_data.source_type,
            image_id=annotation_data.image_id,
            category_id=annotation_data.category_id,
            created_by=created_by
        )
        
        self.db.add(db_annotation)
        await self.db.commit()
        await self.db.refresh(db_annotation)
        
        return self._create_annotation_read_with_mask_info(db_annotation)
    
    async def get_annotation_by_id(self, annotation_id: int) -> Optional[AnnotationRead]:
        """
        ID로 어노테이션을 조회합니다.
        
        Args:
            annotation_id: Annotation ID
            
        Returns:
            Optional[AnnotationRead]: Annotation information or None if not found
        """
        result = await self.db.execute(
            select(Annotation).where(Annotation.id == annotation_id)
        )
        annotation = result.scalar_one_or_none()
        
        if annotation:
            return self._create_annotation_read_with_mask_info(annotation)
        return None
    
    async def get_annotations_by_image_id(self, image_id: int) -> List[AnnotationRead]:
        """
        특정 이미지에 포함된 어노테이션 목록을 조회합니다.
        
        Args:
            image_id: Image ID
            
        Returns:
            List[AnnotationRead]: List of annotations for the image
        """
        result = await self.db.execute(
            select(Annotation).where(Annotation.image_id == image_id)
        )
        annotations = result.scalars().all()
        
        return [self._create_annotation_read_with_mask_info(annotation) for annotation in annotations]
    
    async def get_annotations_by_source_type(self, source_type: str, image_id: Optional[int] = None) -> List[AnnotationRead]:
        """
        소스 타입별로 어노테이션을 조회합니다.
        
        Args:
            source_type: Source type ("AUTO" or "USER")
            image_id: Optional image ID to filter by specific image
            
        Returns:
            List[AnnotationRead]: List of annotations matching the criteria
        """
        query = select(Annotation).where(Annotation.source_type == source_type)
        
        if image_id:
            query = query.where(Annotation.image_id == image_id)
        
        result = await self.db.execute(query)
        annotations = result.scalars().all()
        
        return [self._create_annotation_read_with_mask_info(annotation) for annotation in annotations]
    
    async def get_annotations_by_user(self, user_id: int) -> List[AnnotationRead]:
        """
        특정 사용자가 생성한 어노테이션 목록을 조회합니다.
        
        Args:
            user_id: User ID
            
        Returns:
            List[AnnotationRead]: List of annotations created by the user
        """
        result = await self.db.execute(
            select(Annotation).where(Annotation.created_by == user_id)
        )
        annotations = result.scalars().all()
        
        return [self._create_annotation_read_with_mask_info(annotation) for annotation in annotations]
    
    async def update_annotation(self, annotation_id: int, annotation_data: AnnotationUpdate) -> Optional[AnnotationRead]:
        """
        어노테이션을 업데이트합니다.
        
        Args:
            annotation_id: Annotation ID
            annotation_data: Schema containing annotation update data
            
        Returns:
            Optional[AnnotationRead]: Updated annotation information or None if annotation not found
        """
        result = await self.db.execute(
            select(Annotation).where(Annotation.id == annotation_id)
        )
        annotation = result.scalar_one_or_none()
        
        if not annotation:
            return None
        
        update_data = annotation_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(annotation, field):
                setattr(annotation, field, value)
        
        await self.db.commit()
        await self.db.refresh(annotation)
        
        return self._create_annotation_read_with_mask_info(annotation)
    
    async def delete_annotation(self, annotation_id: int) -> bool:
        """
        어노테이션을 삭제합니다.
        
        Args:
            annotation_id: Annotation ID
            
        Returns:
            bool: Success status of deletion
        """
        result = await self.db.execute(
            select(Annotation).where(Annotation.id == annotation_id)
        )
        annotation = result.scalar_one_or_none()
        
        if not annotation:
            return False
        
        await self.db.delete(annotation)
        await self.db.commit()
        return True
    
    async def get_annotations_count_by_image(self, image_id: int) -> int:
        """
        특정 이미지의 어노테이션 개수를 조회합니다.
        
        Args:
            image_id: Image ID
            
        Returns:
            int: Number of annotations for the image
        """
        result = await self.db.execute(
            select(func.count(Annotation.id)).where(Annotation.image_id == image_id)
        )
        return result.scalar() or 0
    
    async def get_annotations_count_by_source_type(self, source_type: str) -> int:
        """
        소스 타입별 어노테이션 개수를 조회합니다.
        
        Args:
            source_type: Source type ("AUTO" or "USER")
            
        Returns:
            int: Number of annotations of the specified source type
        """
        result = await self.db.execute(
            select(func.count(Annotation.id)).where(Annotation.source_type == source_type)
        )
        return result.scalar() or 0 