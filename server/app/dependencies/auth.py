"""
인증 의존성 주입

FastAPI 의존성 주입을 위한 인증 관련 함수들
"""

from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError, jwt

from ..config import settings
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserRead


security = HTTPBearer(auto_error=False)  # auto_error=False to allow optional authentication


async def get_user_from_test_header(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Optional[UserRead]:
    """
    Get user from X-Opengraph-User-Id header for testing purposes.
    
    This function extracts user_id from the custom header and retrieves
    the corresponding user from the database.
    """
    user_id_header = request.headers.get("X-Opengraph-User-Id")
    if not user_id_header:
        return None
    
    try:
        user_id = int(user_id_header)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID in X-Opengraph-User-Id header"
        )
    
    # Query user from database
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User with ID {user_id} not found"
        )
    
    return UserRead.from_orm(user)


async def get_user_from_jwt(
    credentials: HTTPAuthorizationCredentials,
    db: AsyncSession = Depends(get_db)
) -> UserRead:
    """
    Get user from JWT token.
    
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
    
    # Query user from database
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise credentials_exception
    
    return UserRead.from_orm(user)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> UserRead:
    """
    Get the current user from either JWT token or test header.
    
    Priority:
    1. X-Opengraph-User-Id header (for testing)
    2. JWT Bearer token (for production)
    
    Raises HTTPException if neither authentication method is provided or valid.
    """
    # Try test header first (for testing purposes)
    test_user = await get_user_from_test_header(request, db)
    if test_user:
        return test_user
    
    # Try JWT token
    if credentials:
        return await get_user_from_jwt(credentials, db)
    
    # No valid authentication found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No valid authentication provided. Use either 'Authorization: Bearer <token>' or 'X-Opengraph-User-Id: <user_id>' header",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_active_user(
    current_user: UserRead = Depends(get_current_user)
) -> UserRead:
    """
    Get the current active user.
    
    Checks if the user is active. If not, raises an HTTPException.
    """
    # In a real implementation, check if user has an is_active field
    # For now, we assume all authenticated users are active
    return current_user


async def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[UserRead]:
    """
    Get the current user if available.
    
    Returns None if no valid authentication is provided instead of raising an exception.
    Useful for endpoints that work with or without authentication.
    """
    try:
        # Try test header first
        test_user = await get_user_from_test_header(request, db)
        if test_user:
            return test_user
        
        # Try JWT token
        if credentials:
            return await get_user_from_jwt(credentials, db)
        
        return None
    except HTTPException:
        return None 