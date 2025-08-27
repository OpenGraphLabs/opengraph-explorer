"""
Task Pydantic Schemas

API request/response schemas for task-related operations
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TaskBase(BaseModel):
    """Base task schema"""
    name: str = Field(..., description="Task name")
    description: Optional[str] = Field(None, description="Task description")
    reward_points: int = Field(10, description="Points awarded for completing this task")
    difficulty_level: int = Field(1, description="Task difficulty level (1-5)")


class TaskCreate(TaskBase):
    """Task creation schema"""
    pass


class TaskUpdate(BaseModel):
    """Task update schema"""
    name: Optional[str] = Field(None, description="Task name")
    description: Optional[str] = Field(None, description="Task description")
    reward_points: Optional[int] = Field(None, description="Points awarded for completing this task")
    difficulty_level: Optional[int] = Field(None, description="Task difficulty level (1-5)")


class TaskRead(TaskBase):
    """Task read schema"""
    id: int = Field(..., description="Task ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)