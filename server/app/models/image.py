"""
Image Model

SQLAlchemy model for image information management
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, BigInteger, String, DateTime, func, ForeignKey, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base


class Image(Base):
    """Image model"""
    
    __tablename__ = "images"
    
    # Basic fields
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    file_name: Mapped[str] = mapped_column(String, nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Foreign keys
    dataset_id: Mapped[int] = mapped_column(
        BigInteger, 
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # Relationships
    dataset: Mapped["Dataset"] = relationship(
        "Dataset", 
        back_populates="images",
        foreign_keys=[dataset_id]
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