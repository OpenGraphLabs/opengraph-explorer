"""
사용자 라우터

사용자 관련 API 엔드포인트들을 정의합니다.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_user, get_current_active_user
from ..schemas.user import UserCreate, UserUpdate, UserRead, UserProfile
from ..services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user.
    """
    user_service = UserService(db)
    
    try:
        return await user_service.create_user(user_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user: UserRead = Depends(get_current_active_user)
):
    """
    Get the current user's information.
    """
    return current_user


@router.get("/me/profile", response_model=UserProfile)
async def get_current_user_profile(
    current_user: UserRead = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current user's profile information.
    """
    user_service = UserService(db)
    profile = await user_service.get_user_profile(current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return profile


@router.put("/me", response_model=UserRead)
async def update_current_user(
    user_data: UserUpdate,
    current_user: UserRead = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the current user's information.
    """
    user_service = UserService(db)
    updated_user = await user_service.update_user(current_user.id, user_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    current_user: UserRead = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete the current user.
    """
    user_service = UserService(db)
    success = await user_service.delete_user(current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific user by ID.
    """
    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/{user_id}/profile", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific user's profile by ID.
    """
    user_service = UserService(db)
    profile = await user_service.get_user_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return profile


@router.get("/", response_model=List[UserRead])
async def get_users(
    skip: int = Query(0, ge=0, description="건너뛸 개수"),
    limit: int = Query(100, ge=1, le=100, description="제한 개수"),
    email_filter: Optional[str] = Query(None, description="이메일 필터"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all users with optional pagination and email filter.
    """
    user_service = UserService(db)
    return await user_service.get_users_list(
        skip=skip,
        limit=limit,
        email_filter=email_filter
    )


@router.get("/search/by-email", response_model=UserRead)
async def search_user_by_email(
    email: str = Query(..., description="이메일 주소"),
    db: AsyncSession = Depends(get_db)
):
    """
    Search for a user by email address.
    """
    user_service = UserService(db)
    user = await user_service.get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/search/by-sui-address", response_model=UserRead)
async def search_user_by_sui_address(
    sui_address: str = Query(..., description="Sui 지갑 주소"),
    db: AsyncSession = Depends(get_db)
):
    """
    Search for a user by Sui wallet address.
    """
    user_service = UserService(db)
    user = await user_service.get_user_by_sui_address(sui_address)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserRead = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a specific user by ID.
    Note: This endpoint requires admin privileges.
    """
    # TODO: 관리자 권한 확인 로직 추가
    user_service = UserService(db)
    updated_user = await user_service.update_user(user_id, user_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: UserRead = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific user by ID.
    Note: This endpoint requires admin privileges.
    """
    # TODO: 관리자 권한 확인 로직 추가
    user_service = UserService(db)
    success = await user_service.delete_user(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        ) 