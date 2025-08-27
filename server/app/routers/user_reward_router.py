"""
User Reward Router

사용자 리워드 관련 API 엔드포인트들을 정의합니다.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.common import PaginationInput
from ..schemas.user_reward import (
    UserRewardCreate, UserRewardRead, UserRewardListResponse, 
    UserContributionStats, LeaderboardResponse
)
from ..models.user_reward import RewardType
from ..services import UserRewardService

router = APIRouter(
    prefix="/rewards",
    tags=["rewards"]
)


@router.post("/", response_model=UserRewardRead, status_code=status.HTTP_201_CREATED)
async def create_reward(
    reward_data: UserRewardCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new reward record.
    This endpoint is typically used internally for awarding rewards.
    """
    reward_service = UserRewardService(db)
    
    try:
        return await reward_service.create_reward(reward_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/user/{user_id}", response_model=UserRewardListResponse)
async def get_user_rewards(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    reward_type: Optional[RewardType] = Query(None, description="Filter by reward type"),
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get rewards for a specific user.
    Users can only view their own rewards unless they are admin.
    """
    # Check permission - users can only view their own rewards
    if current_user.id != user_id:
        # TODO: Add admin check when admin roles are implemented
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own rewards"
        )
    
    reward_service = UserRewardService(db)
    
    try:
        return await reward_service.get_user_rewards(
            user_id=user_id,
            pagination=PaginationInput(page=page, limit=limit),
            reward_type=reward_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/user/{user_id}/stats", response_model=UserContributionStats)
async def get_user_contribution_stats(
    user_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get contribution statistics for a specific user.
    Users can only view their own stats unless they are admin.
    """
    # Check permission - users can only view their own stats
    if current_user.id != user_id:
        # TODO: Add admin check when admin roles are implemented
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own contribution stats"
        )
    
    reward_service = UserRewardService(db)
    
    try:
        return await reward_service.get_user_contribution_stats(user_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the leaderboard showing top contributors by points.
    This endpoint is public and doesn't require authentication.
    """
    reward_service = UserRewardService(db)
    
    try:
        return await reward_service.get_leaderboard(
            pagination=PaginationInput(page=page, limit=limit)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/my-rewards", response_model=UserRewardListResponse)
async def get_my_rewards(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    reward_type: Optional[RewardType] = Query(None, description="Filter by reward type"),
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get rewards for the current authenticated user.
    """
    reward_service = UserRewardService(db)
    
    try:
        return await reward_service.get_user_rewards(
            user_id=current_user.id,
            pagination=PaginationInput(page=page, limit=limit),
            reward_type=reward_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/my-stats", response_model=UserContributionStats)
async def get_my_contribution_stats(
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get contribution statistics for the current authenticated user.
    """
    reward_service = UserRewardService(db)
    
    try:
        return await reward_service.get_user_contribution_stats(current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )