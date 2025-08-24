"""
Task Pydantic Schemas

API request/response schemas for task-related operations
"""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class TaskBase(BaseModel):
    """Base task schema"""
    name: str = Field(..., description="Task name")


class TaskCreate(TaskBase):
    """Task creation schema"""
    pass


class TaskUpdate(BaseModel):
    """Task update schema"""
    name: str = Field(..., description="Task name")


class TaskRead(TaskBase):
    """Task read schema"""
    id: int = Field(..., description="Task ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)