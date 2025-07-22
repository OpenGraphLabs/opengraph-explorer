"""
User Annotation Selection 모델

사용자의 어노테이션 선택 기록을 저장하는 모델입니다.
여러 AUTO 어노테이션을 조합하여 유의미한 entity를 만드는 사용자의 선택을 추적합니다.
"""

from sqlalchemy import BigInteger, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import TYPE_CHECKING, Optional

from ..database import Base

if TYPE_CHECKING:
    from .user import User
    from .image import Image 
    from .category import Category


class UserAnnotationSelection(Base):
    __tablename__ = "user_annotation_selections"
    
    # Primary Key
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    
    # Foreign Keys
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    image_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("images.id", ondelete="CASCADE"),
        nullable=False
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Selection Data
    selected_annotation_ids_key: Mapped[str] = mapped_column(
        String(500),  # 충분한 길이로 설정 (예: "1,2,3,4,5,...")
        nullable=False,
        comment="Comma-separated sorted annotation IDs (e.g., '1,3,4')"
    )
    
    # Status
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDING",
        comment="PENDING, APPROVED, REJECTED"
    )
    
    # Timestamps
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[Optional[DateTime]] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="annotation_selections")
    image: Mapped["Image"] = relationship("Image")
    category: Mapped[Optional["Category"]] = relationship("Category")
    
    # Indexes for efficient querying
    __table_args__ = (
        # 동일한 선택을 빠르게 찾기 위한 인덱스
        Index(
            'idx_selection_lookup', 
            'image_id', 'selected_annotation_ids_key', 'category_id'
        ),
        # 사용자별 선택 조회를 위한 인덱스
        Index('idx_user_selections', 'user_id', 'created_at'),
        # 이미지별 선택 조회를 위한 인덱스  
        Index('idx_image_selections', 'image_id', 'status'),
        # 승인 대기 중인 선택들을 위한 인덱스
        Index('idx_pending_selections', 'status', 'created_at'),
    )
    
    def __repr__(self) -> str:
        return (
            f"<UserAnnotationSelection(id={self.id}, "
            f"user_id={self.user_id}, image_id={self.image_id}, "
            f"annotations={self.selected_annotation_ids_key}, "
            f"category_id={self.category_id}, status={self.status})>"
        )