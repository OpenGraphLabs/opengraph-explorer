"""
애플리케이션 설정 관리

환경변수를 읽어서 설정값을 관리합니다.
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, validator


class Settings(BaseSettings):
    """애플리케이션 설정 클래스"""
    
    # Application Information
    app_name: str = "OpenGraph API"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # Database
    database_url: Optional[PostgresDsn] = None
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "opengraph"
    database_user: str = "postgres"
    database_password: str = "password"
    
    @validator("database_url", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        """데이터베이스 URL 조립"""
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            user=values.get("database_user"),
            password=values.get("database_password"),
            host=values.get("database_host"),
            port=str(values.get("database_port")),
            path=f"/{values.get('database_name') or ''}"
        )
    
    # Authentication
    secret_key: str = "your-secret-key-change-this-in-production"
    jwt_secret_key: str = "your-jwt-secret-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    class Config:
        """Pydantic 설정"""
        env_file = ".env"
        case_sensitive = False


# 설정 인스턴스 생성
settings = Settings()


def is_development() -> bool:
    return settings.debug


def is_production() -> bool:
    return not settings.debug
