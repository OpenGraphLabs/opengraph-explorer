"""
Image Pydantic Schemas

API request/response schemas for image-related operations
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class ImageStatus(str, Enum):
    """Image approval status"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ImageBase(BaseModel):
    """Base image schema"""
    file_name: str = Field(..., description="File name")
    image_url: str = Field(..., description="Image URL")
    width: int = Field(..., description="Image width in pixels")
    height: int = Field(..., description="Image height in pixels")
    dataset_id: Optional[int] = Field(None, description="Dataset ID (optional for first-person images)")
    task_id: Optional[str] = Field(None, description="Task ID for first-person images")
    status: ImageStatus = Field(ImageStatus.PENDING, description="Image approval status")


class ImageCreate(ImageBase):
    """Image creation schema"""
    pass


class ImageUpdate(BaseModel):
    """Image update schema"""
    file_name: Optional[str] = Field(None, description="File name")
    image_url: Optional[str] = Field(None, description="Image URL")
    width: Optional[int] = Field(None, description="Image width in pixels")
    height: Optional[int] = Field(None, description="Image height in pixels")
    status: Optional[ImageStatus] = Field(None, description="Image approval status")
    task_id: Optional[str] = Field(None, description="Task ID for first-person images")


class ImageRead(ImageBase):
    """Image read schema"""
    id: int = Field(..., description="Image ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)


class ImageInDB(ImageRead):
    """Database image schema"""
    pass


class ImageListResponse(BaseModel):
    """ Image list response schema """
    items: List[ImageRead] = Field(..., description="Image list")
    total: int = Field(..., description="Total count")
    page: int = Field(..., description="Current page")
    limit: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages")


class FirstPersonImageCreate(BaseModel):
    """First-person image creation schema"""
    file_name: str = Field(..., description="File name")
    image_url: str = Field(..., description="Image URL or base64 data")
    width: int = Field(..., description="Image width in pixels")
    height: int = Field(..., description="Image height in pixels")
    task_id: str = Field(..., description="Task ID for first-person images")
