"""
User Annotation Selection Service

사용자의 어노테이션 선택 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.user_annotation_selection import UserAnnotationSelection
from ..models.annotation import Annotation
from ..models.user import User
from ..models.category import Category
from ..models.image import Image
from ..schemas.user_annotation_selection import (
    UserAnnotationSelectionCreate,
    UserAnnotationSelectionUpdate,
    UserAnnotationSelectionRead,
    AnnotationSelectionStats,
    AnnotationSelectionSummary
)
from ..utils.annotation_selection import (
    normalize_annotation_ids,
    parse_annotation_ids_key,
    validate_annotation_ids
)


class UserAnnotationSelectionService:
    """사용자 어노테이션 선택 서비스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_selection(
        self, 
        user_id: int, 
        selection_data: UserAnnotationSelectionCreate
    ) -> UserAnnotationSelectionRead:
        """
        새로운 어노테이션 선택을 생성합니다.
        
        Args:
            user_id: 사용자 ID
            selection_data: 선택 생성 데이터
            
        Returns:
            생성된 선택 정보
            
        Raises:
            ValueError: 유효하지 않은 어노테이션 ID 목록
        """
        # 어노테이션 ID 유효성 검증
        if not validate_annotation_ids(selection_data.selected_annotation_ids):
            raise ValueError("유효하지 않은 어노테이션 ID 목록입니다")
        
        # 어노테이션 ID 정규화
        annotation_ids_key = normalize_annotation_ids(selection_data.selected_annotation_ids)
        
        # 중복 선택 확인
        existing_selection = await self._find_existing_selection(
            user_id=user_id,
            image_id=selection_data.image_id,
            annotation_ids_key=annotation_ids_key,
            category_id=selection_data.category_id
        )
        
        if existing_selection:
            # 이미 동일한 선택이 있으면 기존 선택 반환
            return UserAnnotationSelectionRead.from_orm(existing_selection)
        
        # 새 선택 생성
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
        
        # 승인 가능 여부 확인 및 처리
        await self._check_and_process_approval(
            image_id=selection_data.image_id,
            annotation_ids_key=annotation_ids_key,
            category_id=selection_data.category_id
        )
        
        return UserAnnotationSelectionRead.from_orm(new_selection)
    
    async def get_selection_by_id(self, selection_id: int) -> Optional[UserAnnotationSelectionRead]:
        """ID로 선택 조회"""
        stmt = select(UserAnnotationSelection).where(
            UserAnnotationSelection.id == selection_id
        )
        result = await self.db.execute(stmt)
        selection = result.scalar_one_or_none()
        
        if selection:
            return UserAnnotationSelectionRead.from_orm(selection)
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
        
        return [UserAnnotationSelectionRead.from_orm(s) for s in selections]
    
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
            selection.category_id = update_data.category_id
        
        if update_data.status is not None:
            selection.status = update_data.status
        
        selection.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(selection)
        
        return UserAnnotationSelectionRead.from_orm(selection)
    
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
        """선택들을 일괄 승인"""
        approved_count = 0
        
        for image_id, annotation_ids_key, category_id in selections_to_approve:
            # 해당 선택들을 모두 APPROVED로 변경
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
                selection.updated_at = datetime.utcnow()
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
        """기존 동일 선택 찾기"""
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
        """승인 조건 확인 및 자동 승인 처리"""
        # 동일한 선택의 개수 확인
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
        
        # 승인 임계값 도달시 자동 승인
        if selection_count >= approval_threshold:
            await self.approve_selections_batch([
                (image_id, annotation_ids_key, category_id)
            ])