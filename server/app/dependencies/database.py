"""
데이터베이스 의존성 주입

FastAPI 의존성 주입을 위한 데이터베이스 관련 함수들
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db as _get_db


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Get a database session for dependency injection.
    
    This function yields a database session that can be used in FastAPI endpoints.
    """
    async for db in _get_db():
        yield db 