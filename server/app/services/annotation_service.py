"""
어노테이션 서비스

어노테이션 관련 비즈니스 로직을 처리합니다.
"""

import asyncio
import json
from typing import Optional, List, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.annotation import Annotation
from ..schemas.annotation import AnnotationCreate, AnnotationUpdate, AnnotationRead, AnnotationListResponse, AnnotationClientRead
from ..schemas.common import Pagination
from ..utils.segmentation import get_mask_info_for_client
from ..utils.annotation_validation import validate_category_for_dataset
from ..utils.mask_processing import process_mask_info_batch, process_single_mask_info
from ..utils.process_manager import get_process_pool


class AnnotationService:
    """어노테이션 서비스 클래스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    @staticmethod
    def _process_mask_info(segmentation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process mask info for a single annotation (used in thread pool)
        
        Args:
            segmentation_data: Dictionary containing segmentation_counts, segmentation_size, bbox
            
        Returns:
            Processed mask info
        """
        return get_mask_info_for_client(
            segmentation_counts=segmentation_data.get('segmentation_counts'),
            segmentation_size=segmentation_data.get('segmentation_size'),
            bbox=segmentation_data.get('bbox')
        )
    
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
        
        # polygon 필드가 있으면 사용, 없으면 실시간 변환 (하위 호환성)
        if annotation.polygon:
            # polygon은 이미 Pydantic validator에 의해 딕셔너리로 변환됨
            annotation_read.mask_info = annotation_read.polygon
        else:
            # 기존 로직: 실시간 변환 (이전 데이터 호환성을 위해)
            mask_info = get_mask_info_for_client(
                segmentation_counts=annotation.segmentation_counts,
                segmentation_size=annotation.segmentation_size,
                bbox=annotation.bbox
            )
            annotation_read.mask_info = mask_info
        
        return annotation_read
    
    async def _batch_create_annotation_read_with_mask_info(self, annotations: List[Annotation]) -> List[AnnotationRead]:
        """
        Batch convert annotations with parallel mask info processing
        
        Args:
            annotations: List of Annotation models
            
        Returns:
            List[AnnotationRead]: List of annotations with mask info
        """
        if not annotations:
            return []
        
        # Prepare data for parallel processing
        segmentation_data_list = []
        annotation_reads = []
        needs_processing = []
        
        for annotation in annotations:
            # Create AnnotationRead without mask_info first
            annotation_read = AnnotationRead.model_validate(annotation)
            annotation_reads.append(annotation_read)
            
            # polygon 필드가 있으면 직접 사용
            if annotation.polygon:
                # polygon은 이미 Pydantic validator에 의해 딕셔너리로 변환됨
                annotation_read.mask_info = annotation_read.polygon
                needs_processing.append(False)
            else:
                # polygon 필드가 없으면 병렬 처리 대상으로 추가
                segmentation_data_list.append({
                    'segmentation_counts': annotation.segmentation_counts,
                    'segmentation_size': annotation.segmentation_size,
                    'bbox': annotation.bbox
                })
                needs_processing.append(True)
        
        # polygon이 없는 annotation들만 병렬 처리
        if segmentation_data_list:
            # Process in batches to reduce process overhead
            batch_size = 50  # Process 50 annotations per process call
            loop = asyncio.get_event_loop()
            
            all_mask_infos = []
            for i in range(0, len(segmentation_data_list), batch_size):
                batch = segmentation_data_list[i:i + batch_size]
                
                # Process entire batch in one process call
                mask_infos_batch = await loop.run_in_executor(
                    get_process_pool(), 
                    process_mask_info_batch,
                    batch
                )
                all_mask_infos.extend(mask_infos_batch)
            
            # Assign mask info to annotation reads that need processing
            mask_info_idx = 0
            for i, annotation_read in enumerate(annotation_reads):
                if needs_processing[i]:
                    annotation_read.mask_info = all_mask_infos[mask_info_idx]
                    mask_info_idx += 1

        return annotation_reads
    
    def _create_annotation_client_read(self, annotation: Annotation) -> AnnotationClientRead:
        """
        Annotation 모델을 클라이언트용 AnnotationClientRead로 변환
        
        Args:
            annotation: Database annotation model
            
        Returns:
            AnnotationClientRead: 클라이언트용 annotation (RLE 제외, polygon 포함)
        """
        # 기본 AnnotationClientRead 생성 (자동으로 RLE 필드들 제외됨)
        client_annotation = AnnotationClientRead.model_validate(annotation)
        
        # polygon 필드가 있으면 사용, 없으면 mask_info 기반으로 생성
        if annotation.polygon:
            # polygon은 이미 Pydantic validator에 의해 딕셔너리로 변환됨
            client_annotation.polygon = client_annotation.polygon
        else:
            # 기존 로직: 실시간 변환 (이전 데이터 호환성을 위해)
            mask_info = get_mask_info_for_client(
                segmentation_counts=annotation.segmentation_counts,
                segmentation_size=annotation.segmentation_size,
                bbox=annotation.bbox
            )
            client_annotation.polygon = mask_info
        
        return client_annotation
    
    async def _batch_create_annotation_client_read(self, annotations: List[Annotation]) -> List[AnnotationClientRead]:
        """
        Batch convert annotations to client-friendly format
        
        Args:
            annotations: List of Annotation models
            
        Returns:
            List[AnnotationClientRead]: List of client-friendly annotations
        """
        if not annotations:
            return []
        
        # Prepare data for parallel processing
        segmentation_data_list = []
        client_annotations = []
        needs_processing = []
        
        for annotation in annotations:
            # Create AnnotationClientRead
            client_annotation = AnnotationClientRead.model_validate(annotation)
            client_annotations.append(client_annotation)
            
            # polygon 필드가 있으면 직접 사용
            if annotation.polygon:
                # polygon은 이미 Pydantic validator에 의해 딕셔너리로 변환됨
                client_annotation.polygon = client_annotation.polygon
                needs_processing.append(False)
            else:
                # polygon 필드가 없으면 병렬 처리 대상으로 추가
                segmentation_data_list.append({
                    'segmentation_counts': annotation.segmentation_counts,
                    'segmentation_size': annotation.segmentation_size,
                    'bbox': annotation.bbox
                })
                needs_processing.append(True)
        
        # polygon이 없는 annotation들만 병렬 처리
        if segmentation_data_list:
            # Process in batches to reduce process overhead
            batch_size = 50  # Process 50 annotations per process call
            loop = asyncio.get_event_loop()
            
            all_mask_infos = []
            for i in range(0, len(segmentation_data_list), batch_size):
                batch = segmentation_data_list[i:i + batch_size]
                
                # Process entire batch in one process call
                mask_infos_batch = await loop.run_in_executor(
                    get_process_pool(), 
                    process_mask_info_batch,
                    batch
                )
                all_mask_infos.extend(mask_infos_batch)
            
            # Assign mask info to client annotations that need processing
            mask_info_idx = 0
            for i, client_annotation in enumerate(client_annotations):
                if needs_processing[i]:
                    client_annotation.polygon = all_mask_infos[mask_info_idx]
                    mask_info_idx += 1

        return client_annotations
    
    async def create_annotation(self, annotation_data: AnnotationCreate) -> AnnotationRead:
        """
        새로운 어노테이션을 생성합니다.
        
        Args:
            annotation_data: Schema containing annotation creation data
            
        Returns:
            AnnotationRead: Created annotation information
            
        Raises:
            ValueError: If category is not valid for the dataset's dictionary
        """
        # Validate category against dataset's dictionary
        is_valid_category = await validate_category_for_dataset(
            category_id=annotation_data.category_id,
            image_id=annotation_data.image_id,
            db=self.db
        )
        
        if not is_valid_category:
            raise ValueError(f"Category {annotation_data.category_id} is not valid for this dataset's dictionary")
        
        # AUTO 타입의 경우 created_by를 None으로 설정
        created_by = None if annotation_data.source_type == "AUTO" else annotation_data.created_by
        
        # RLE to Polygon 변환
        polygon_data = None
        if annotation_data.segmentation_counts and annotation_data.segmentation_size:
            # 동기적으로 단일 마스크 처리 (적재 시점이므로 병렬 처리 불필요)
            segmentation_data = {
                'segmentation_counts': annotation_data.segmentation_counts,
                'segmentation_size': annotation_data.segmentation_size,
                'bbox': annotation_data.bbox
            }
            polygon_data = json.dumps(process_single_mask_info(segmentation_data))
        
        db_annotation = Annotation(
            bbox=annotation_data.bbox,
            area=annotation_data.area,
            segmentation_size=annotation_data.segmentation_size,
            segmentation_counts=annotation_data.segmentation_counts,
            polygon=polygon_data,
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
        
        # Use batch processing for better performance
        return await self._batch_create_annotation_read_with_mask_info(annotations)
    
    async def get_annotations_by_image_id_for_client(self, image_id: int) -> List[AnnotationClientRead]:
        """
        특정 이미지에 포함된 어노테이션 목록을 클라이언트용으로 조회합니다.

        Args:
            image_id: Image ID

        Returns:
            List[AnnotationClientRead]: List of client-friendly annotations for the image
        """
        result = await self.db.execute(
            select(Annotation).where(Annotation.image_id == image_id)
        )
        annotations = result.scalars().all()

        # Use batch processing for better performance
        return await self._batch_create_annotation_client_read(annotations)

    async def get_approved_user_annotations_by_image_id_for_client(self, image_id: int) -> List[AnnotationClientRead]:
        """
        Get approved user annotations for a specific image in client-friendly format.

        Args:
            image_id: Image ID

        Returns:
            List[AnnotationClientRead]: List of client-friendly annotations for the image
        """
        result = await self.db.execute(
            select(Annotation).where(
                Annotation.image_id == image_id,
                Annotation.source_type == "USER",
                Annotation.status == "APPROVED"
            )
        )
        annotations = result.scalars().all()

        # Use batch processing for better performance
        return await self._batch_create_annotation_client_read(annotations)
    
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
        
        # Use batch processing for better performance
        return await self._batch_create_annotation_read_with_mask_info(annotations)
    
    async def get_approved_user_annotations(
        self,
        pagination: Pagination,
    ) -> AnnotationListResponse:
        """
        List of approved user annotations
        
        Args:
            pagination: Pagination
            
        Returns:
            AnnotationListResponse: List of approved annotations with pagination information
        """
        # Count total items
        count_query = select(func.count(Annotation.id)).where(
            Annotation.source_type == "USER",
            Annotation.status == "APPROVED"
        )

        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination
        query = select(Annotation).where(
                Annotation.source_type == "USER",
                Annotation.status == "APPROVED"
            ).order_by(Annotation.updated_at.desc())

        offset = (pagination.page - 1) * pagination.limit
        query = query.offset(offset).limit(pagination.limit)

        result = await self.db.execute(query)
        annotations = result.scalars().all()

        pages = (total + pagination.limit - 1) // pagination.limit

        # Use batch processing
        items = await self._batch_create_annotation_read_with_mask_info(annotations)

        return AnnotationListResponse(
            items=items,
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            pages=pages
        )
    
    async def get_annotations_with_filters(
        self,
        pagination: Pagination,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        image_id: Optional[int] = None,
        category_id: Optional[int] = None,
        status: Optional[str] = None,
        source_type: Optional[str] = None
    ) -> AnnotationListResponse:
        """
        Get annotations with various filters
        
        Args:
            pagination: Pagination
            search: Search text (searches in status, source_type)
            sort_by: Sort field (created_at, updated_at, area)
            image_id: Filter by image ID
            category_id: Filter by category ID  
            status: Filter by status (PENDING, APPROVED, REJECTED)
            source_type: Filter by source type (AUTO, USER)
            
        Returns:
            AnnotationListResponse: List of annotations with pagination information
        """
        # Build filter conditions
        conditions = []
        
        if image_id:
            conditions.append(Annotation.image_id == image_id)
        if category_id:
            conditions.append(Annotation.category_id == category_id)
        if status:
            conditions.append(Annotation.status == status.upper())
        if source_type:
            conditions.append(Annotation.source_type == source_type.upper())
        if search:
            # Search in status and source_type fields
            search_term = f"%{search}%"
            conditions.append(
                Annotation.status.ilike(search_term) |
                Annotation.source_type.ilike(search_term)
            )
        
        # Count total items
        count_query = select(func.count(Annotation.id))
        if conditions:
            count_query = count_query.where(*conditions)
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Build main query
        query = select(Annotation)
        if conditions:
            query = query.where(*conditions)
        
        # Apply sorting
        if sort_by:
            if sort_by == "created_at":
                query = query.order_by(Annotation.created_at.desc())
            elif sort_by == "updated_at":
                query = query.order_by(Annotation.updated_at.desc())
            elif sort_by == "area":
                query = query.order_by(Annotation.area.desc())
            else:
                query = query.order_by(Annotation.updated_at.desc())  # default
        else:
            query = query.order_by(Annotation.updated_at.desc())  # default
        
        # Apply pagination
        offset = (pagination.page - 1) * pagination.limit
        query = query.offset(offset).limit(pagination.limit)
        
        result = await self.db.execute(query)
        annotations = result.scalars().all()
        
        pages = (total + pagination.limit - 1) // pagination.limit
        
        # Use batch processing
        items = await self._batch_create_annotation_read_with_mask_info(annotations)
        
        return AnnotationListResponse(
            items=items,
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            pages=pages
        )

    
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