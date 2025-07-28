"""
Category Model

SQLAlchemy model for annotation category management
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, BigInteger, String, DateTime, func
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base


class Category(Base):
    """Annotation category model"""
    
    __tablename__ = "categories"
    
    # Basic fields
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # Relationships
    annotations: Mapped[List["Annotation"]] = relationship(
        "Annotation",
        back_populates="category",
        foreign_keys="Annotation.category_id"
    )
    
    dictionary_categories: Mapped[List["DictionaryCategory"]] = relationship(
        "DictionaryCategory",
        back_populates="category",
        foreign_keys="DictionaryCategory.category_id"
    )
    
    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name={self.name})>"
    
    def __str__(self) -> str:
        return f"Category({self.name})" 