"""
Image Model

SQLAlchemy model for image information management
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, BigInteger, String, DateTime, func, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum

from ..database import Base


class ImageStatus(str, enum.Enum):
    """Image approval status"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Image(Base):
    """Image model"""
    
    __tablename__ = "images"
    
    # Basic fields
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    file_name: Mapped[str] = mapped_column(String, nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Status field for approval workflow
    status: Mapped[ImageStatus] = mapped_column(
        Enum(ImageStatus),
        nullable=False,
        default=ImageStatus.PENDING,
        server_default=ImageStatus.PENDING.value
    )
    
    # Foreign keys
    dataset_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, 
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=True,  # Making nullable for first-person images
        index=True
    )
    
    task_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True,  # Nullable for non-first-person images
        index=True
    )
    
    # 이미지 제출자 추적
    submitted_by: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # Relationships
    dataset: Mapped[Optional["Dataset"]] = relationship(
        "Dataset", 
        back_populates="images",
        foreign_keys=[dataset_id]
    )
    
    task: Mapped[Optional["Task"]] = relationship(
        "Task",
        back_populates="images",
        foreign_keys=[task_id]
    )
    
    submitter: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[submitted_by]
    )
    
    annotations: Mapped[List["Annotation"]] = relationship(
        "Annotation",
        back_populates="image",
        foreign_keys="Annotation.image_id",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Image(id={self.id}, file_name={self.file_name}, dataset_id={self.dataset_id})>"
    
    def __str__(self) -> str:
        return f"Image({self.file_name})" 