"""
Task Model

SQLAlchemy model for first-person capture tasks
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, BigInteger, String, DateTime, func, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base


class Task(Base):
    """Task model for first-person image capture tasks"""
    
    __tablename__ = "tasks"
    
    # Basic fields
    id: Mapped[str] = mapped_column(String, primary_key=True)  # Using string ID to match frontend
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    space: Mapped[str] = mapped_column(String, nullable=False)  # kitchen, living-room, closet, dining-room, etc.
    icon: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # JSON fields stored as string (can be parsed on retrieval)
    target_objects: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array of strings
    required_count: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # Relationships
    images: Mapped[List["Image"]] = relationship(
        "Image",
        back_populates="task",
        foreign_keys="Image.task_id"
    )
    
    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title={self.title}, space={self.space})>"
    
    def __str__(self) -> str:
        return f"Task({self.id}: {self.title})"