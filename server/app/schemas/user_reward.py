"""
UserReward Schemas

사용자 리워드 관련 Pydantic 모델들
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from ..models.user_reward import RewardType


class UserRewardBase(BaseModel):
    """사용자 리워드 기본 스키마"""
    reward_type: RewardType
    points: int
    description: Optional[str] = None
    image_id: Optional[int] = None
    task_id: Optional[int] = None


class UserRewardCreate(UserRewardBase):
    """사용자 리워드 생성 스키마"""
    user_id: int


class UserRewardRead(UserRewardBase):
    """사용자 리워드 조회 스키마"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    created_at: datetime


class UserRewardUpdate(BaseModel):
    """사용자 리워드 업데이트 스키마"""
    description: Optional[str] = None


class UserRewardListResponse(BaseModel):
    """사용자 리워드 목록 응답 스키마"""
    items: list[UserRewardRead]
    total: int
    page: int
    size: int
    pages: int


class UserContributionStats(BaseModel):
    """사용자 기여도 통계 스키마"""
    total_points: int
    total_images_submitted: int
    total_images_approved: int
    total_images_rejected: int
    total_images_pending: int
    approval_rate: float  # 승인률 (%)
    recent_rewards: list[UserRewardRead]


class LeaderboardEntry(BaseModel):
    """리더보드 엔트리 스키마"""
    model_config = ConfigDict(from_attributes=True)
    
    user_id: int
    display_name: Optional[str]
    email: str
    total_points: int
    total_contributions: int
    rank: int


class LeaderboardResponse(BaseModel):
    """리더보드 응답 스키마"""
    entries: list[LeaderboardEntry]
    total_users: int
    page: int
    size: int
    pages: int