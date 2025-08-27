"""
UserReward Service

사용자 리워드 관련 비즈니스 로직을 처리하는 서비스 클래스
"""

from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from sqlalchemy.orm import selectinload

from ..models import User, UserReward, Image, Task, ImageStatus
from ..models.user_reward import RewardType
from ..schemas.user_reward import (
    UserRewardCreate, UserRewardUpdate, UserRewardListResponse,
    UserContributionStats, LeaderboardEntry, LeaderboardResponse
)
from ..schemas.common import PaginationInput


class UserRewardService:
    """사용자 리워드 서비스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_reward(self, reward_data: UserRewardCreate) -> UserReward:
        """사용자에게 리워드 부여"""
        # UserReward 생성
        reward = UserReward(
            user_id=reward_data.user_id,
            reward_type=reward_data.reward_type,
            points=reward_data.points,
            description=reward_data.description,
            image_id=reward_data.image_id,
            task_id=reward_data.task_id
        )
        
        self.db.add(reward)
        await self.db.flush()  # ID 생성
        
        # 사용자의 총 포인트 업데이트
        await self._update_user_total_points(reward_data.user_id, reward_data.points)
        
        await self.db.commit()
        await self.db.refresh(reward)
        return reward
    
    async def award_image_approval_reward(self, image_id: int) -> Optional[UserReward]:
        """이미지 승인 시 리워드 부여"""
        # 이미지 정보 조회
        result = await self.db.execute(
            select(Image)
            .options(selectinload(Image.task))
            .where(Image.id == image_id)
        )
        image = result.scalar_one_or_none()
        
        if not image or not image.submitted_by:
            return None
        
        # Task가 있는 경우 해당 Task의 리워드 포인트 사용, 없으면 기본값
        points = image.task.reward_points if image.task else 10
        
        reward_data = UserRewardCreate(
            user_id=image.submitted_by,
            reward_type=RewardType.IMAGE_APPROVED,
            points=points,
            description=f"Image '{image.file_name}' approved",
            image_id=image_id,
            task_id=image.task_id if image.task else None
        )
        
        return await self.create_reward(reward_data)
    
    async def get_user_rewards(
        self, 
        user_id: int, 
        pagination: PaginationInput,
        reward_type: Optional[RewardType] = None
    ) -> UserRewardListResponse:
        """사용자 리워드 목록 조회"""
        # 기본 쿼리 생성
        query = select(UserReward).where(UserReward.user_id == user_id)
        
        if reward_type:
            query = query.where(UserReward.reward_type == reward_type)
        
        # 총 개수 계산
        count_query = select(func.count(UserReward.id)).where(UserReward.user_id == user_id)
        if reward_type:
            count_query = count_query.where(UserReward.reward_type == reward_type)
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # 페이지네이션 적용
        query = query.order_by(desc(UserReward.created_at))
        query = query.offset((pagination.page - 1) * pagination.limit)
        query = query.limit(pagination.limit)
        
        result = await self.db.execute(query)
        rewards = result.scalars().all()
        
        return UserRewardListResponse(
            items=rewards,
            total=total,
            page=pagination.page,
            size=pagination.limit,
            pages=(total + pagination.limit - 1) // pagination.limit
        )
    
    async def get_user_contribution_stats(self, user_id: int) -> UserContributionStats:
        """사용자 기여도 통계 조회"""
        # 사용자 정보 조회
        user_result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # 이미지 제출 통계
        from sqlalchemy import case
        images_query = select(
            func.count(Image.id).label('total_submitted'),
            func.sum(
                case(
                    (Image.status == ImageStatus.APPROVED, 1),
                    else_=0
                )
            ).label('approved'),
            func.sum(
                case(
                    (Image.status == ImageStatus.REJECTED, 1),
                    else_=0
                )
            ).label('rejected'),
            func.sum(
                case(
                    (Image.status == ImageStatus.PENDING, 1),
                    else_=0
                )
            ).label('pending')
        ).where(Image.submitted_by == user_id)
        
        stats_result = await self.db.execute(images_query)
        stats = stats_result.first()
        
        total_submitted = stats.total_submitted or 0
        approved = stats.approved or 0
        rejected = stats.rejected or 0
        pending = stats.pending or 0
        
        # 승인률 계산
        approval_rate = (approved / total_submitted * 100) if total_submitted > 0 else 0.0
        
        # 최근 리워드 조회 (최근 5개)
        recent_rewards_result = await self.db.execute(
            select(UserReward)
            .where(UserReward.user_id == user_id)
            .order_by(desc(UserReward.created_at))
            .limit(5)
        )
        recent_rewards = recent_rewards_result.scalars().all()
        
        return UserContributionStats(
            total_points=user.total_points,
            total_images_submitted=total_submitted,
            total_images_approved=approved,
            total_images_rejected=rejected,
            total_images_pending=pending,
            approval_rate=round(approval_rate, 2),
            recent_rewards=recent_rewards
        )
    
    async def get_leaderboard(self, pagination: PaginationInput) -> LeaderboardResponse:
        """리더보드 조회"""
        # 사용자별 통계 조회
        stats_query = select(
            User.id.label('user_id'),
            User.display_name,
            User.email,
            User.total_points,
            func.count(Image.id).label('total_contributions')
        ).select_from(
            User
        ).outerjoin(
            Image, Image.submitted_by == User.id
        ).group_by(
            User.id, User.display_name, User.email, User.total_points
        ).order_by(
            desc(User.total_points)
        )
        
        # 총 사용자 수 계산
        total_users_query = select(func.count(func.distinct(User.id)))
        total_result = await self.db.execute(total_users_query)
        total_users = total_result.scalar()
        
        # 페이지네이션 적용
        stats_query = stats_query.offset((pagination.page - 1) * pagination.limit)
        stats_query = stats_query.limit(pagination.limit)
        
        result = await self.db.execute(stats_query)
        stats = result.all()
        
        # 리더보드 엔트리 생성 (랭킹 계산)
        entries = []
        base_rank = (pagination.page - 1) * pagination.limit + 1
        
        for i, stat in enumerate(stats):
            entry = LeaderboardEntry(
                user_id=stat.user_id,
                display_name=stat.display_name,
                email=stat.email,
                total_points=stat.total_points,
                total_contributions=stat.total_contributions or 0,
                rank=base_rank + i
            )
            entries.append(entry)
        
        return LeaderboardResponse(
            entries=entries,
            total_users=total_users,
            page=pagination.page,
            size=pagination.limit,
            pages=(total_users + pagination.limit - 1) // pagination.limit
        )
    
    async def _update_user_total_points(self, user_id: int, points_delta: int):
        """사용자 총 포인트 업데이트"""
        user_result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if user:
            user.total_points += points_delta
            await self.db.flush()