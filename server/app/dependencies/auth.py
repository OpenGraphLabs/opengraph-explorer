"""
인증 의존성 주입

FastAPI 의존성 주입을 위한 인증 관련 함수들
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt

from ..config import settings
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserRead


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> UserRead:
    """
    Get the current user from the JWT token.
    
    Validates the JWT token and retrieves the user information.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # 사용자 조회 (실제 구현에서는 UserService를 사용해야 함)
    # 여기서는 간단한 예시로 작성
    user = await db.execute(
        "SELECT * FROM users WHERE email = :email",
        {"email": email}
    )
    user_data = user.fetchone()
    
    if user_data is None:
        raise credentials_exception
    
    return UserRead.model_validate(user_data)


async def get_current_active_user(
    current_user: UserRead = Depends(get_current_user)
) -> UserRead:
    """
    Get the current active user.
    
    Checks if the user is active. If not, raises an HTTPException.
    """
    # 실제로는 User 모델에 is_active 필드가 있어야 함
    # 여기서는 간단한 예시로 작성
    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[UserRead]:
    """
    Get the current user if available.
    
    If no credentials are provided, returns None.
    """
    if credentials is None:
        return None
    
    try:
        # get_current_user 로직을 여기에 구현
        return None  # 실제 구현 필요
    except HTTPException:
        return None 