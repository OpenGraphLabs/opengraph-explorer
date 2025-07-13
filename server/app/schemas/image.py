"""
Image Pydantic Schemas

API request/response schemas for image-related operations
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ImageBase(BaseModel):
    """Base image schema"""
    file_name: str = Field(..., description="File name")
    image_url: str = Field(..., description="Image URL")
    width: int = Field(..., description="Image width in pixels")
    height: int = Field(..., description="Image height in pixels")
    dataset_id: int = Field(..., description="Dataset ID")


class ImageCreate(ImageBase):
    """Image creation schema"""
    pass


class ImageUpdate(BaseModel):
    """Image update schema"""
    file_name: Optional[str] = Field(None, description="File name")
    image_url: Optional[str] = Field(None, description="Image URL")
    width: Optional[int] = Field(None, description="Image width in pixels")
    height: Optional[int] = Field(None, description="Image height in pixels")


class ImageRead(ImageBase):
    """Image read schema"""
    id: int = Field(..., description="Image ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)


class ImageInDB(ImageRead):
    """Database image schema"""
    pass 