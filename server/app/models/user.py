"""
사용자 모델

사용자 정보를 관리하는 SQLAlchemy 모델
"""

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Column, BigInteger, String, DateTime, func
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base

if TYPE_CHECKING:
    from .user_annotation_selection import UserAnnotationSelection


class User(Base):
    """사용자 모델"""
    
    __tablename__ = "users"
    
    # 기본 필드
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    google_id: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True, index=True)
    display_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    profile_image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sui_address: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True, index=True)
    
    # zkLogin 관련 필드
    zklogin_salt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    google_sub: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True, index=True)
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # 관계 정의
    datasets: Mapped[List["Dataset"]] = relationship(
        "Dataset", 
        back_populates="creator",
        foreign_keys="Dataset.created_by"
    )
    
    annotations: Mapped[List["Annotation"]] = relationship(
        "Annotation",
        back_populates="creator",
        foreign_keys="Annotation.created_by"
    )
    
    annotation_selections: Mapped[List["UserAnnotationSelection"]] = relationship(
        "UserAnnotationSelection",
        back_populates="user"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, display_name={self.display_name})>"
    
    def __str__(self) -> str:
        return f"User({self.display_name or self.email})" 