"""
Dictionary Model

SQLAlchemy model for ontology group (dictionary) management
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, BigInteger, String, DateTime, func, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base


class Dictionary(Base):
    """Dictionary model for category groups"""
    
    __tablename__ = "dictionaries"
    
    # Basic fields
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # Relationships
    dictionary_categories: Mapped[List["DictionaryCategory"]] = relationship(
        "DictionaryCategory",
        back_populates="dictionary",
        foreign_keys="DictionaryCategory.dictionary_id",
        cascade="all, delete-orphan"
    )
    
    datasets: Mapped[List["Dataset"]] = relationship(
        "Dataset",
        back_populates="dictionary",
        foreign_keys="Dataset.dictionary_id"
    )
    
    def __repr__(self) -> str:
        return f"<Dictionary(id={self.id}, name={self.name})>"
    
    def __str__(self) -> str:
        return f"Dictionary({self.name})" 