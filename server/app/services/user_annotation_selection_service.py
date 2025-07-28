"""
User Annotation Selection Service

사용자의 어노테이션 선택 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
"""

from typing import List, Optional, Tuple
from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
import numpy as np
from pycocotools import mask as maskUtils

from . import AnnotationService
from ..models.user_annotation_selection import UserAnnotationSelection
from ..models.annotation import Annotation
from ..models.category import Category
from ..schemas.user_annotation_selection import (
    UserAnnotationSelectionCreate,
    UserAnnotationSelectionBatchCreate,
    UserAnnotationSelectionBatchResponse,
    UserAnnotationSelectionUpdate,
    UserAnnotationSelectionRead,
    AnnotationSelectionStats,
    AnnotationSelectionSummary
)
from ..schemas.annotation import AnnotationCreate
from ..utils.annotation_selection import (
    normalize_annotation_ids,
    parse_annotation_ids_key,
    validate_annotation_ids
)
from ..utils.annotation_validation import validate_category_for_dataset


class UserAnnotationSelectionService:
    """사용자 어노테이션 선택 서비스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.annotation_service = AnnotationService(db)
    
    async def create_selection(
        self, 
        user_id: int, 
        selection_data: UserAnnotationSelectionCreate
    ) -> UserAnnotationSelectionRead:
        """
        Create user annotation selection
        
        Args:
            user_id: User ID
            selection_data: annotation selection data
            
        Returns:
            Created user annotation selection

        Raises:
            ValueError: Invalid annotation ID list
        """

        if not validate_annotation_ids(selection_data.selected_annotation_ids):
            raise ValueError("Invalid annotation ids")
        
        # Validate category against dataset's dictionary
        if selection_data.category_id is not None:
            is_valid_category = await validate_category_for_dataset(
                category_id=selection_data.category_id,
                image_id=selection_data.image_id,
                db=self.db
            )
            if not is_valid_category:
                raise ValueError(f"Category {selection_data.category_id} is not valid for this dataset's dictionary")
        
        # normalize annotation ids for comparing other selections
        annotation_ids_key = normalize_annotation_ids(selection_data.selected_annotation_ids)

        existing_selection = await self._find_existing_selection(
            user_id=user_id,
            image_id=selection_data.image_id,
            annotation_ids_key=annotation_ids_key,
            category_id=selection_data.category_id
        )
        
        if existing_selection:
            # if exists, return the existing one
            return UserAnnotationSelectionRead.model_validate(existing_selection)

        new_selection = UserAnnotationSelection(
            user_id=user_id,
            image_id=selection_data.image_id,
            selected_annotation_ids_key=annotation_ids_key,
            category_id=selection_data.category_id,
            status="PENDING"
        )
        
        self.db.add(new_selection)
        await self.db.commit()
        await self.db.refresh(new_selection)
        
        # Check if it can be approved and if so, approve it (for single selections)
        await self._check_and_process_approval(
            image_id=selection_data.image_id,
            annotation_ids_key=annotation_ids_key,
            category_id=selection_data.category_id
        )
        
        return UserAnnotationSelectionRead.model_validate(new_selection)
    
    async def create_selections_batch(
        self,
        user_id: int,
        batch_data: UserAnnotationSelectionBatchCreate
    ) -> UserAnnotationSelectionBatchResponse:
        """
        Create multiple annotation selections atomically
        
        All selections are created in a single transaction.
        If any validation fails, the entire batch fails.
        After all selections are created, check for auto-approval in batch.
        
        Args:
            user_id: User ID
            batch_data: Batch creation data containing list of selections
            
        Returns:
            Batch response with created selections and auto-approval info
            
        Raises:
            ValueError: If any selection data is invalid
            HTTPException: If any database constraint is violated
        """
        # Phase 1: Validate all selections first (before any database operations)
        validated_selections = []
        for selection_data in batch_data.selections:
            if not validate_annotation_ids(selection_data.selected_annotation_ids):
                raise ValueError(f"Invalid annotation IDs: {selection_data.selected_annotation_ids}")
            
            # Validate category against dataset's dictionary
            if selection_data.category_id is not None:
                is_valid_category = await validate_category_for_dataset(
                    category_id=selection_data.category_id,
                    image_id=selection_data.image_id,
                    db=self.db
                )
                if not is_valid_category:
                    raise ValueError(f"Category {selection_data.category_id} is not valid for this dataset's dictionary")
            
            annotation_ids_key = normalize_annotation_ids(selection_data.selected_annotation_ids)
            validated_selections.append({
                "selection_data": selection_data,
                "annotation_ids_key": annotation_ids_key
            })
        
        # Phase 2: Check for existing selections and prepare new ones
        new_selections = []
        for validated in validated_selections:
            selection_data = validated["selection_data"]
            annotation_ids_key = validated["annotation_ids_key"]
            
            # Check if selection already exists
            existing_selection = await self._find_existing_selection(
                user_id=user_id,
                image_id=selection_data.image_id,
                annotation_ids_key=annotation_ids_key,
                category_id=selection_data.category_id
            )
            
            if existing_selection:
                continue  # Skip duplicates silently
            
            # Prepare new selection
            new_selection = UserAnnotationSelection(
                user_id=user_id,
                image_id=selection_data.image_id,
                selected_annotation_ids_key=annotation_ids_key,
                category_id=selection_data.category_id,
                status="PENDING"
            )
            new_selections.append({
                "model": new_selection,
                "image_id": selection_data.image_id,
                "annotation_ids_key": annotation_ids_key,
                "category_id": selection_data.category_id
            })
        
        # Phase 3: Atomically create all new selections
        created_selections = []
        for new_selection_info in new_selections:
            self.db.add(new_selection_info["model"])
        
        await self.db.commit()
        
        # Refresh all created selections
        for new_selection_info in new_selections:
            await self.db.refresh(new_selection_info["model"])
            created_selections.append(UserAnnotationSelectionRead.model_validate(new_selection_info["model"]))
        
        # Phase 4: Batch check and process approvals
        auto_approved_count, merged_annotations_count = await self._batch_check_and_process_approvals(new_selections)
        
        return UserAnnotationSelectionBatchResponse(
            created_selections=created_selections,
            total_created=len(created_selections),
            auto_approved_count=auto_approved_count,
            merged_annotations_count=merged_annotations_count
        )
    
    async def get_selection_by_id(self, selection_id: int) -> Optional[UserAnnotationSelectionRead]:
        """ID로 선택 조회"""
        stmt = select(UserAnnotationSelection).where(
            UserAnnotationSelection.id == selection_id
        )
        result = await self.db.execute(stmt)
        selection = result.scalar_one_or_none()
        
        if selection:
            return UserAnnotationSelectionRead.model_validate(selection)
        return None
    
    async def get_user_selections(
        self, 
        user_id: int, 
        image_id: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[UserAnnotationSelectionRead]:
        """사용자의 선택 목록 조회"""
        stmt = select(UserAnnotationSelection).where(
            UserAnnotationSelection.user_id == user_id
        )
        
        if image_id:
            stmt = stmt.where(UserAnnotationSelection.image_id == image_id)
        
        if status:
            stmt = stmt.where(UserAnnotationSelection.status == status)
        
        stmt = stmt.order_by(desc(UserAnnotationSelection.created_at))
        stmt = stmt.offset(offset).limit(limit)
        
        result = await self.db.execute(stmt)
        selections = result.scalars().all()
        
        return [UserAnnotationSelectionRead.model_validate(s) for s in selections]
    
    async def get_image_selection_stats(
        self, 
        image_id: int
    ) -> List[AnnotationSelectionStats]:
        """이미지의 선택 통계 조회"""
        stmt = select(
            UserAnnotationSelection.selected_annotation_ids_key,
            UserAnnotationSelection.category_id,
            Category.name.label('category_name'),
            func.count(UserAnnotationSelection.id).label('selection_count'),
            func.min(UserAnnotationSelection.created_at).label('first_selected_at'),
            func.max(UserAnnotationSelection.created_at).label('last_selected_at'),
            UserAnnotationSelection.status
        ).select_from(
            UserAnnotationSelection
        ).outerjoin(
            Category, UserAnnotationSelection.category_id == Category.id
        ).where(
            UserAnnotationSelection.image_id == image_id
        ).group_by(
            UserAnnotationSelection.selected_annotation_ids_key,
            UserAnnotationSelection.category_id,
            Category.name,
            UserAnnotationSelection.status
        ).order_by(
            desc('selection_count'),
            UserAnnotationSelection.selected_annotation_ids_key
        )
        
        result = await self.db.execute(stmt)
        stats = []
        
        for row in result:
            stats.append(AnnotationSelectionStats(
                image_id=image_id,
                selected_annotation_ids_key=row.selected_annotation_ids_key,
                category_id=row.category_id,
                category_name=row.category_name,
                selection_count=row.selection_count,
                status=row.status,
                first_selected_at=row.first_selected_at,
                last_selected_at=row.last_selected_at,
                is_ready_for_approval=(row.selection_count >= 5 and row.status == "PENDING")
            ))
        
        return stats
    
    async def update_selection(
        self, 
        selection_id: int, 
        update_data: UserAnnotationSelectionUpdate
    ) -> Optional[UserAnnotationSelectionRead]:
        """선택 정보 업데이트"""
        stmt = select(UserAnnotationSelection).where(
            UserAnnotationSelection.id == selection_id
        )
        result = await self.db.execute(stmt)
        selection = result.scalar_one_or_none()
        
        if not selection:
            return None
        
        # 업데이트 적용
        if update_data.category_id is not None:
            # Validate category against dataset's dictionary
            is_valid_category = await validate_category_for_dataset(
                category_id=update_data.category_id,
                image_id=selection.image_id,
                db=self.db
            )
            if not is_valid_category:
                raise ValueError(f"Category {update_data.category_id} is not valid for this dataset's dictionary")
            
            selection.category_id = update_data.category_id
        
        if update_data.status is not None:
            selection.status = update_data.status
        
        selection.updated_at = func.now()
        
        await self.db.commit()
        await self.db.refresh(selection)
        
        return UserAnnotationSelectionRead.model_validate(selection)
    
    async def delete_selection(self, selection_id: int, user_id: int) -> bool:
        """선택 삭제 (본인만 삭제 가능)"""
        stmt = select(UserAnnotationSelection).where(
            and_(
                UserAnnotationSelection.id == selection_id,
                UserAnnotationSelection.user_id == user_id
            )
        )
        result = await self.db.execute(stmt)
        selection = result.scalar_one_or_none()
        
        if not selection:
            return False
        
        await self.db.delete(selection)
        await self.db.commit()
        
        return True
    
    async def get_selections_ready_for_approval(
        self,
        min_selection_count: int = 5
    ) -> List[AnnotationSelectionStats]:
        """승인 가능한 선택들 조회"""
        stmt = select(
            UserAnnotationSelection.image_id,
            UserAnnotationSelection.selected_annotation_ids_key,
            UserAnnotationSelection.category_id,
            Category.name.label('category_name'),
            func.count(UserAnnotationSelection.id).label('selection_count'),
            func.min(UserAnnotationSelection.created_at).label('first_selected_at'),
            func.max(UserAnnotationSelection.created_at).label('last_selected_at')
        ).select_from(
            UserAnnotationSelection
        ).outerjoin(
            Category, UserAnnotationSelection.category_id == Category.id
        ).where(
            UserAnnotationSelection.status == "PENDING"
        ).group_by(
            UserAnnotationSelection.image_id,
            UserAnnotationSelection.selected_annotation_ids_key,
            UserAnnotationSelection.category_id,
            Category.name
        ).having(
            func.count(UserAnnotationSelection.id) >= min_selection_count
        ).order_by(
            desc('selection_count'),
            UserAnnotationSelection.image_id
        )
        
        result = await self.db.execute(stmt)
        stats = []
        
        for row in result:
            stats.append(AnnotationSelectionStats(
                image_id=row.image_id,
                selected_annotation_ids_key=row.selected_annotation_ids_key,
                category_id=row.category_id,
                category_name=row.category_name,
                selection_count=row.selection_count,
                status="PENDING",
                first_selected_at=row.first_selected_at,
                last_selected_at=row.last_selected_at,
                is_ready_for_approval=True
            ))
        
        return stats
    
    async def approve_selections_batch(
        self,
        selections_to_approve: List[Tuple[int, str, Optional[int]]]  # (image_id, annotation_ids_key, category_id)
    ) -> int:
        """Batch approve the user selections"""
        approved_count = 0
        
        for image_id, annotation_ids_key, category_id in selections_to_approve:
            stmt = select(UserAnnotationSelection).where(
                and_(
                    UserAnnotationSelection.image_id == image_id,
                    UserAnnotationSelection.selected_annotation_ids_key == annotation_ids_key,
                    UserAnnotationSelection.category_id == category_id,
                    UserAnnotationSelection.status == "PENDING"
                )
            )
            result = await self.db.execute(stmt)
            selections = result.scalars().all()
            
            for selection in selections:
                selection.status = "APPROVED"
                selection.updated_at = func.now()
                approved_count += len(selections)
        
        await self.db.commit()
        return approved_count
    
    async def get_selection_summary(self) -> AnnotationSelectionSummary:
        """선택 통계 요약"""
        # 전체 통계
        total_stmt = select(func.count(UserAnnotationSelection.id))
        total_result = await self.db.execute(total_stmt)
        total_selections = total_result.scalar()
        
        # 상태별 통계
        status_stmt = select(
            UserAnnotationSelection.status,
            func.count(UserAnnotationSelection.id)
        ).group_by(UserAnnotationSelection.status)
        status_result = await self.db.execute(status_stmt)
        status_counts = {row[0]: row[1] for row in status_result}
        
        # 승인 가능한 선택 수
        ready_stmt = select(
            func.count().over()
        ).select_from(
            select(
                UserAnnotationSelection.image_id,
                UserAnnotationSelection.selected_annotation_ids_key,
                UserAnnotationSelection.category_id,
                func.count(UserAnnotationSelection.id).label('cnt')
            ).where(
                UserAnnotationSelection.status == "PENDING"
            ).group_by(
                UserAnnotationSelection.image_id,
                UserAnnotationSelection.selected_annotation_ids_key,
                UserAnnotationSelection.category_id
            ).having(
                func.count(UserAnnotationSelection.id) >= 5
            ).subquery()
        )
        ready_result = await self.db.execute(ready_stmt)
        ready_count = ready_result.scalar() or 0
        
        # 이미지 통계
        images_stmt = select(
            func.count(func.distinct(UserAnnotationSelection.image_id)),
            func.avg(func.count(UserAnnotationSelection.id)).over()
        ).group_by(UserAnnotationSelection.image_id)
        images_result = await self.db.execute(images_stmt)
        images_stats = images_result.fetchone()
        images_with_selections = images_stats[0] if images_stats else 0
        avg_selections_per_image = float(images_stats[1]) if images_stats and images_stats[1] else 0.0
        
        # 사용자 통계
        users_stmt = select(
            func.count(func.distinct(UserAnnotationSelection.user_id)),
            func.avg(func.count(UserAnnotationSelection.id)).over()
        ).group_by(UserAnnotationSelection.user_id)
        users_result = await self.db.execute(users_stmt)
        users_stats = users_result.fetchone()
        active_users = users_stats[0] if users_stats else 0
        avg_selections_per_user = float(users_stats[1]) if users_stats and users_stats[1] else 0.0
        
        return AnnotationSelectionSummary(
            total_selections=total_selections,
            pending_selections=status_counts.get("PENDING", 0),
            approved_selections=status_counts.get("APPROVED", 0),
            rejected_selections=status_counts.get("REJECTED", 0),
            ready_for_approval=ready_count,
            images_with_selections=images_with_selections,
            avg_selections_per_image=avg_selections_per_image,
            active_users=active_users,
            avg_selections_per_user=avg_selections_per_user
        )
    
    async def _find_existing_selection(
        self,
        user_id: int,
        image_id: int,
        annotation_ids_key: str,
        category_id: Optional[int]
    ) -> Optional[UserAnnotationSelection]:
        """Find existing selection if a user selects the same annotations_test for the same category"""
        stmt = select(UserAnnotationSelection).where(
            and_(
                UserAnnotationSelection.user_id == user_id,
                UserAnnotationSelection.image_id == image_id,
                UserAnnotationSelection.selected_annotation_ids_key == annotation_ids_key,
                UserAnnotationSelection.category_id == category_id
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def _check_and_process_approval(
        self,
        image_id: int,
        annotation_ids_key: str,
        category_id: Optional[int],
        approval_threshold: int = 5
    ) -> None:
        """ Check if it can be approved and if so, approve it """
        # Count of same selections
        stmt = select(func.count(UserAnnotationSelection.id)).where(
            and_(
                UserAnnotationSelection.image_id == image_id,
                UserAnnotationSelection.selected_annotation_ids_key == annotation_ids_key,
                UserAnnotationSelection.category_id == category_id,
                UserAnnotationSelection.status == "PENDING"
            )
        )
        result = await self.db.execute(stmt)
        selection_count = result.scalar()
        
        # If it exceeds the threshold, auto approval
        if selection_count >= approval_threshold:
            await self.approve_selections_batch([
                (image_id, annotation_ids_key, category_id)
            ])

            # Extract annotation IDs and merge their masks into a single annotation
            annotation_ids = parse_annotation_ids_key(annotation_ids_key)
            merged_annotation_id = await self._create_merged_annotation(
                image_id=image_id,
                annotation_ids=annotation_ids,
                category_id=category_id
            )
            
            if merged_annotation_id:
                print(f"Successfully created merged annotation {merged_annotation_id} for selections with key {annotation_ids_key}")

    async def _create_merged_annotation(
        self,
        image_id: int,
        annotation_ids: List[int],
        category_id: Optional[int]
    ) -> Optional[int]:
        """
        Create a single merged annotation from multiple selected annotations_test
        
        Args:
            image_id: ID of the image
            annotation_ids: List of annotation IDs to merge
            category_id: Category to assign to the merged annotation
            
        Returns:
            ID of the created merged annotation, or None if failed
        """
        # Get all annotations_test to merge
        stmt = select(Annotation).where(
            and_(
                Annotation.id.in_(annotation_ids),
                Annotation.image_id == image_id
            )
        )
        result = await self.db.execute(stmt)
        annotations = result.scalars().all()
        
        if not annotations:
            return None
        
        # Extract RLE masks and merge them
        merged_rle = self._merge_annotation_masks(list(annotations))
        if not merged_rle:
            return None
        
        # Calculate bounding box and area from merged mask
        bbox = self._calculate_bbox_from_rle(merged_rle)
        area = float(maskUtils.area(merged_rle))
        
        # Create the merged annotation
        merged_annotation_data = AnnotationCreate(
            image_id=image_id,
            category_id=category_id,
            segmentation_size=merged_rle['size'],
            segmentation_counts=merged_rle['counts'].decode('utf-8') if isinstance(merged_rle['counts'], bytes) else merged_rle['counts'],
            bbox=bbox,
            area=area,
            source_type="USER",
            status="APPROVED",
            is_crowd=False,
            point_coords=None,
            predicted_iou=None,
            stability_score=None,
            created_by=None  # This is a system-generated merged annotation
        )
        
        created_annotation = await self.annotation_service.create_annotation(merged_annotation_data)
        return created_annotation.id if created_annotation else None

    def _merge_annotation_masks(self, annotations: List[Annotation]) -> Optional[dict]:
        """
        Merge multiple annotation masks into a single RLE mask
        
        Args:
            annotations: List of annotations_test to merge
            
        Returns:
            Merged RLE mask in COCO format, or None if merging failed
        """
        try:
            valid_masks = []
            
            # Collect valid RLE masks
            for annotation in annotations:
                if annotation.segmentation_counts and annotation.segmentation_size:
                    rle = {
                        'size': annotation.segmentation_size,
                        'counts': annotation.segmentation_counts.encode('utf-8')
                    }
                    valid_masks.append(rle)
            
            if not valid_masks:
                return None
            
            if len(valid_masks) == 1:
                return valid_masks[0]
            
            # Convert RLEs to binary masks
            binary_masks = [maskUtils.decode(rle) for rle in valid_masks]
            
            # Merge by taking the union (logical OR) of all masks
            merged_mask = binary_masks[0].astype(np.uint8)
            for i in range(1, len(binary_masks)):
                merged_mask = np.logical_or(merged_mask, binary_masks[i]).astype(np.uint8)
            
            # Convert back to RLE
            merged_rle = maskUtils.encode(np.asfortranarray(merged_mask))
            
            return merged_rle
            
        except Exception as e:
            print(f"Error merging annotation masks: {e}")
            return None

    def _calculate_bbox_from_rle(self, rle: dict) -> List[float]:
        """
        Calculate bounding box from RLE mask
        
        Args:
            rle: RLE mask in COCO format
            
        Returns:
            Bounding box in [x, y, width, height] format
        """
        try:
            bbox = maskUtils.toBbox(rle)
            return [float(x) for x in bbox]
        except Exception as e:
            print(f"Error calculating bbox from RLE: {e}")
            # Return a default bbox if calculation fails
            return [0.0, 0.0, float(rle['size'][1]), float(rle['size'][0])]

    async def _batch_check_and_process_approvals(
        self,
        new_selections: List[dict],
        approval_threshold: int = 5
    ) -> tuple[int, int]:
        """
        Batch check and process approvals for newly created selections
        
        Args:
            new_selections: List of newly created selection info dicts
            approval_threshold: Minimum number of selections needed for approval
            
        Returns:
            Tuple of (auto_approved_count, merged_annotations_count)
        """
        if not new_selections:
            return 0, 0
        
        # Group selections by (image_id, annotation_ids_key, category_id)
        selection_groups = {}
        for selection_info in new_selections:
            key = (
                selection_info["image_id"],
                selection_info["annotation_ids_key"], 
                selection_info["category_id"]
            )
            if key not in selection_groups:
                selection_groups[key] = []
            selection_groups[key].append(selection_info)
        
        # Check each unique selection combination
        selections_to_approve = []
        auto_approved_count = 0
        
        for (image_id, annotation_ids_key, category_id), group in selection_groups.items():
            # Count total selections (including existing ones) for this combination
            stmt = select(func.count(UserAnnotationSelection.id)).where(
                and_(
                    UserAnnotationSelection.image_id == image_id,
                    UserAnnotationSelection.selected_annotation_ids_key == annotation_ids_key,
                    UserAnnotationSelection.category_id == category_id,
                    UserAnnotationSelection.status == "PENDING"
                )
            )
            result = await self.db.execute(stmt)
            total_count = result.scalar()
            
            # If threshold is reached, mark for approval
            if total_count >= approval_threshold:
                selections_to_approve.append((image_id, annotation_ids_key, category_id))
                auto_approved_count += total_count
        
        # Batch approve selections and create merged annotations_test
        merged_annotations_count = 0
        if selections_to_approve:
            # Approve all qualifying selections
            await self.approve_selections_batch(selections_to_approve)
            
            # Create merged annotations_test for each approved combination
            for image_id, annotation_ids_key, category_id in selections_to_approve:
                annotation_ids = parse_annotation_ids_key(annotation_ids_key)
                merged_annotation_id = await self._create_merged_annotation(
                    image_id=image_id,
                    annotation_ids=annotation_ids,
                    category_id=category_id
                )
                
                if merged_annotation_id:
                    merged_annotations_count += 1
                    print(f"Created merged annotation {merged_annotation_id} for selection key {annotation_ids_key}")
        
        return auto_approved_count, merged_annotations_count
