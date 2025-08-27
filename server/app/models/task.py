"""
Task Model

SQLAlchemy model for first-person capture tasks
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import BigInteger, String, DateTime, func, Integer, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base


class Task(Base):
    """Task model for first-person image capture tasks"""
    
    __tablename__ = "tasks"
    
    # Basic fields
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 보상 관련 필드
    reward_points: Mapped[int] = mapped_column(Integer, nullable=False, default=10, server_default="10")
    difficulty_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")  # 1-5 scale
    
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
        return f"<Task(id={self.id}, name={self.name})>"
    
    def __str__(self) -> str:
        return f"Task({self.id}: {self.name})"