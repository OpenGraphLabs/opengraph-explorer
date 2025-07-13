"""
데이터베이스 연결 및 세션 관리

SQLAlchemy를 사용한 비동기 데이터베이스 연결과 세션 관리
"""

from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from .config import settings

# 동기 엔진 (Alembic 마이그레이션용)
sync_engine = create_engine(
    str(settings.database_url).replace("postgresql+asyncpg", "postgresql"),
    pool_pre_ping=True,
    echo=settings.debug
)

# 비동기 엔진 (애플리케이션용)
async_engine = create_async_engine(
    str(settings.database_url),
    pool_pre_ping=True,
    echo=settings.debug
)

# 동기 세션 메이커 (Alembic용)
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

# 비동기 세션 메이커 (애플리케이션용)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

# Base 클래스 선언
Base = declarative_base()


# 데이터베이스 세션 의존성 주입 함수
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    비동기 데이터베이스 세션을 생성하고 반환합니다.
    
    FastAPI 의존성 주입에서 사용됩니다.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# 동기 데이터베이스 세션 생성 (마이그레이션용)
def get_sync_db() -> Session:
    """
    동기 데이터베이스 세션을 생성하고 반환합니다.
    
    Alembic 마이그레이션에서 사용됩니다.
    """
    return SyncSessionLocal()


# 데이터베이스 연결 테스트
async def test_db_connection() -> bool:
    """
    데이터베이스 연결을 테스트합니다.
    
    Returns:
        bool: 연결 성공 여부
    """
    try:
        async with async_engine.begin() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False


# 데이터베이스 테이블 생성
async def create_tables() -> None:
    """
    모든 테이블을 생성합니다.
    
    개발 환경에서만 사용하세요. 프로덕션에서는 Alembic을 사용하세요.
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# 데이터베이스 테이블 삭제
async def drop_tables() -> None:
    """
    모든 테이블을 삭제합니다.
    
    개발 환경에서만 사용하세요.
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all) 