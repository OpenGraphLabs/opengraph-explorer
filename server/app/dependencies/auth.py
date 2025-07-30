"""
인증 관련 의존성

JWT 토큰 검증 및 현재 사용자 추출을 담당합니다.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..database import get_db
from ..models.user import User
from ..services.user_service import UserService


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    JWT 토큰으로부터 현재 사용자를 조회합니다.
    
    Args:
        credentials: JWT 토큰
        db: 데이터베이스 세션
        
    Returns:
        User: 현재 사용자
        
    Raises:
        HTTPException: 인증 실패 시
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # JWT 토큰 디코딩
        payload = jwt.decode(
            credentials.credentials, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # 사용자 조회
    user_service = UserService(db)
    user = await user_service.get_user_by_id(int(user_id))
    
    if user is None:
        raise credentials_exception
        
    # UserRead를 User 모델로 변환 (실제 DB 객체 필요)
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == int(user_id)))
    db_user = result.scalar_one_or_none()
    
    if db_user is None:
        raise credentials_exception
        
    return db_user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    선택적으로 현재 사용자를 조회합니다. (토큰이 없어도 에러 없음)
    
    Args:
        credentials: JWT 토큰 (선택)
        db: 데이터베이스 세션
        
    Returns:
        Optional[User]: 현재 사용자 또는 None
    """
    if not credentials:
        return None
        
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    현재 활성 사용자를 조회합니다. (활성 상태 확인 포함)
    
    Args:
        current_user: 현재 사용자
        
    Returns:
        User: 활성 사용자
        
    Raises:
        HTTPException: 사용자가 비활성 상태인 경우
    """
    # 현재는 모든 사용자가 활성으로 간주
    # 추후 User 모델에 is_active 필드 추가 시 검증 로직 구현
    return current_user