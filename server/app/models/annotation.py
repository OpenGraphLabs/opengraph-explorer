"""
Annotation Model

SQLAlchemy model for unified annotation management (both auto-generated and user-created)
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, BigInteger, String, DateTime, func, ForeignKey, Boolean, ARRAY, Float, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base


class Annotation(Base):
    """Unified annotation model for both auto-generated and user-created annotations"""
    
    __tablename__ = "annotations"
    
    # Basic fields
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    bbox: Mapped[Optional[List[float]]] = mapped_column(ARRAY(Float, dimensions=1), nullable=True)
    area: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    segmentation_size: Mapped[Optional[List[int]]] = mapped_column(ARRAY(BigInteger, dimensions=1), nullable=True)
    segmentation_counts: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    polygon: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    point_coords: Mapped[Optional[List[List[float]]]] = mapped_column(ARRAY(Float, dimensions=2), nullable=True)
    is_crowd: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    predicted_iou: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stability_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String, default="PENDING", nullable=False)
    source_type: Mapped[str] = mapped_column(String, nullable=False)
    
    # Foreign keys
    image_id: Mapped[int] = mapped_column(
        BigInteger, 
        ForeignKey("images.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    category_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, 
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True
    )
    
    created_by: Mapped[Optional[int]] = mapped_column(
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
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    # Relationships
    image: Mapped["Image"] = relationship(
        "Image", 
        back_populates="annotations",
        foreign_keys=[image_id]
    )
    
    category: Mapped[Optional["Category"]] = relationship(
        "Category", 
        back_populates="annotations",
        foreign_keys=[category_id]
    )
    
    creator: Mapped[Optional["User"]] = relationship(
        "User", 
        back_populates="annotations",
        foreign_keys=[created_by]
    )
    
    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING', 'APPROVED', 'REJECTED')",
            name="check_annotation_status"
        ),
        CheckConstraint(
            "source_type IN ('AUTO', 'USER')",
            name="check_annotation_source_type"
        ),
    )
    
    def __repr__(self) -> str:
        return f"<Annotation(id={self.id}, image_id={self.image_id}, category_id={self.category_id}, status={self.status}, source_type={self.source_type})>"
    
    def __str__(self) -> str:
        return f"Annotation({self.id} - {self.status} - {self.source_type})" 