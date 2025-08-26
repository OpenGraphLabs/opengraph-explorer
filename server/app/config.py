"""
애플리케이션 설정 관리

환경변수를 읽어서 설정값을 관리합니다.
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """애플리케이션 설정 클래스"""
    
    # Application Information
    app_name: str = "OpenGraph API"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # URLs Configuration
    client_url: str = "http://localhost:5173"  # Frontend URL
    server_url: str = "http://localhost:8000"  # Backend API URL
    
    # Database
    database_url: Optional[str] = None
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "opengraph_db"
    database_user: str = "opengraph_user"
    database_password: str = "opengraph_password"
    
    @validator("database_url", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        """데이터베이스 URL 조립"""
        if isinstance(v, str):
            return v
        host = values.get("database_host", "localhost")
        port = values.get("database_port", 5432)
        user = values.get("database_user", "opengraph_user")
        password = values.get("database_password", "opengraph_pw")
        db_name = values.get("database_name", "opengraph")
        
        return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db_name}"
    
    # Authentication
    jwt_secret_key: str = "your-jwt-secret-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: Optional[str] = None  # Will be set based on server_url
    
    # zkLogin
    zklogin_prover_url: str = "https://prover-dev.mystenlabs.com/v1"
    zklogin_salt_service: str = "https://salt.api.mystenlabs.com/get_salt"
    
    # CORS
    allowed_origins: Optional[List[str]] = None  # Will be set based on client_url
    
    @validator("google_redirect_uri", pre=True, always=True)
    def assemble_google_redirect_uri(cls, v: Optional[str], values: dict) -> str:
        """Google OAuth 리디렉트 URI 자동 생성"""
        if isinstance(v, str) and v:
            return v
        server_url = values.get("server_url", "http://localhost:8000")
        return f"{server_url}/api/v1/auth/google/callback"
    
    @validator("allowed_origins", pre=True, always=True)
    def assemble_allowed_origins(cls, v: Optional[List[str]], values: dict) -> List[str]:
        """CORS 허용 오리진 자동 설정"""
        if v:
            return v
        client_url = values.get("client_url", "http://localhost:5173")
        # 기본적으로 client_url을 허용하고, localhost 개발 환경도 추가
        origins = [client_url]
        if client_url != "http://localhost:5173":
            origins.append("http://localhost:5173")  # 개발 환경 항상 허용
        return origins
    
    # Google Cloud Storage
    google_application_credentials: Optional[str] = None
    google_cloud_project: Optional[str] = None
    gcs_bucket_name: str = "noyes_test"
    
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
