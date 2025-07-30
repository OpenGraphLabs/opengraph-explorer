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
    database_user: str = "opengraph_user"
    database_password: str = "opengraph_pw"
    
    @validator("database_url", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        """데이터베이스 URL 조립"""
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=values.get("database_user", "opengraph_user"),
            password=values.get("database_password", "opengraph_pw"),
            host=values.get("database_host", "localhost"),
            port=values.get("database_port", 5432),
            path=values.get("database_name", "opengraph")
        )
    
    # Authentication
    jwt_secret_key: str = "your-jwt-secret-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:5173/auth/callback"
    
    # zkLogin
    zklogin_prover_url: str = "https://prover-dev.mystenlabs.com/v1"
    zklogin_salt_service: str = "https://salt.api.mystenlabs.com/get_salt"
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:5173",
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
