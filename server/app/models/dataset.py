"""
데이터셋 모델

데이터셋 정보를 관리하는 SQLAlchemy 모델
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, BigInteger, String, DateTime, func, ForeignKey, ARRAY, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base


class Dataset(Base):
    """데이터셋 모델"""
    
    __tablename__ = "datasets"
    
    # 기본 필드
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)
    
    # 외래 키
    created_by: Mapped[Optional[int]] = mapped_column(
        BigInteger, 
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    dictionary_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("dictionaries.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # 관계 정의
    creator: Mapped[Optional["User"]] = relationship(
        "User", 
        back_populates="datasets",
        foreign_keys=[created_by]
    )
    
    dictionary: Mapped[Optional["Dictionary"]] = relationship(
        "Dictionary",
        back_populates="datasets",
        foreign_keys=[dictionary_id]
    )
    
    images: Mapped[List["Image"]] = relationship(
        "Image",
        back_populates="dataset",
        foreign_keys="Image.dataset_id",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Dataset(id={self.id}, name={self.name}, created_by={self.created_by})>"
    
    def __str__(self) -> str:
        return f"Dataset({self.name})" 