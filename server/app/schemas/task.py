"""
Task Pydantic Schemas

API request/response schemas for task-related operations
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
import json


class TaskBase(BaseModel):
    """Base task schema"""
    id: str = Field(..., description="Task ID")
    title: str = Field(..., description="Task title")
    description: str = Field(..., description="Task description")
    space: str = Field(..., description="Space category (kitchen, living-room, etc.)")
    icon: Optional[str] = Field(None, description="Task icon emoji")
    target_objects: Optional[List[str]] = Field(None, description="Expected objects to detect")
    required_count: Optional[int] = Field(None, description="Minimum number of objects needed")


class TaskRead(TaskBase):
    """Task read schema"""
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def model_validate(cls, obj):
        """Custom validation to handle JSON string fields"""
        if hasattr(obj, 'target_objects') and isinstance(obj.target_objects, str):
            try:
                obj.target_objects = json.loads(obj.target_objects)
            except:
                obj.target_objects = []
        return super().model_validate(obj)