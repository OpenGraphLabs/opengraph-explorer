"""
공통 유틸리티 함수들

자주 사용되는 헬퍼 함수들을 정의합니다.
"""

import uuid
import re
from datetime import datetime
from typing import Optional
from passlib.context import CryptContext

# 비밀번호 해싱을 위한 컨텍스트 생성
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_uuid() -> str:
    """
    UUID를 생성합니다.
    
    Returns:
        str: UUID 문자열
    """
    return str(uuid.uuid4())


def datetime_to_iso(dt: datetime) -> str:
    """
    datetime을 ISO 형식 문자열로 변환합니다.
    
    Args:
        dt: datetime 객체
        
    Returns:
        str: ISO 형식 문자열
    """
    return dt.isoformat()


def iso_to_datetime(iso_string: str) -> datetime:
    """
    ISO 형식 문자열을 datetime으로 변환합니다.
    
    Args:
        iso_string: ISO 형식 문자열
        
    Returns:
        datetime: datetime 객체
    """
    return datetime.fromisoformat(iso_string)


def validate_email(email: str) -> bool:
    """
    이메일 주소의 유효성을 검사합니다.
    
    Args:
        email: 이메일 주소
        
    Returns:
        bool: 유효성 여부
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def hash_password(password: str) -> str:
    """
    비밀번호를 해시합니다.
    
    Args:
        password: 원본 비밀번호
        
    Returns:
        str: 해시된 비밀번호
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    비밀번호를 검증합니다.
    
    Args:
        plain_password: 원본 비밀번호
        hashed_password: 해시된 비밀번호
        
    Returns:
        bool: 검증 결과
    """
    return pwd_context.verify(plain_password, hashed_password)


def slugify(text: str) -> str:
    """
    텍스트를 슬러그로 변환합니다.
    
    Args:
        text: 원본 텍스트
        
    Returns:
        str: 슬러그
    """
    # 소문자 변환
    text = text.lower()
    # 특수문자를 하이픈으로 변환
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # 앞뒤 하이픈 제거
    text = text.strip('-')
    return text


def truncate_string(text: str, max_length: int = 100) -> str:
    """
    문자열을 자릅니다.
    
    Args:
        text: 원본 텍스트
        max_length: 최대 길이
        
    Returns:
        str: 자른 텍스트
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def format_file_size(size_bytes: int) -> str:
    """
    파일 크기를 읽기 쉬운 형식으로 변환합니다.
    
    Args:
        size_bytes: 바이트 단위 크기
        
    Returns:
        str: 형식화된 크기
    """
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}" 