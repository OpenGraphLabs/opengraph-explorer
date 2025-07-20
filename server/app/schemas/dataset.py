"""
Dataset Pydantic Schemas

API request/response schemas for dataset-related operations
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class DatasetBase(BaseModel):
    """Base dataset schema"""
    name: str = Field(..., description="Dataset name")
    description: Optional[str] = Field(None, description="Dataset description")
    tags: Optional[List[str]] = Field(None, description="Tag list")


class DatasetCreate(DatasetBase):
    """Dataset creation schema"""
    pass


class DatasetUpdate(BaseModel):
    """Dataset update schema"""
    name: Optional[str] = Field(None, description="Dataset name")
    description: Optional[str] = Field(None, description="Dataset description")
    tags: Optional[List[str]] = Field(None, description="Tag list")


class DatasetRead(DatasetBase):
    """Dataset read schema"""
    id: int = Field(..., description="Dataset ID")
    created_by: Optional[int] = Field(None, description="Creator ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)


class DatasetInDB(DatasetRead):
    """Database dataset schema"""
    pass


class DatasetWithStats(DatasetRead):
    """Dataset schema with statistics"""
    image_count: int = Field(0, description="Number of images")
    annotation_count: int = Field(0, description="Number of annotations")
    
    model_config = ConfigDict(from_attributes=True)


class DatasetListItem(BaseModel):
    """Dataset list item schema"""
    id: int = Field(..., description="Dataset ID")
    name: str = Field(..., description="Dataset name")
    description: Optional[str] = Field(None, description="Dataset description")
    tags: Optional[List[str]] = Field(None, description="Tag list")
    created_by: Optional[int] = Field(None, description="Creator ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    image_count: int = Field(0, description="Number of images")
    
    model_config = ConfigDict(from_attributes=True)


class DatasetFilter(BaseModel):
    """Dataset filter schema"""
    name: Optional[str] = Field(None, description="Name search")
    tags: Optional[List[str]] = Field(None, description="Tag filter")
    created_by: Optional[int] = Field(None, description="Creator filter")
    created_after: Optional[datetime] = Field(None, description="Created after timestamp")
    created_before: Optional[datetime] = Field(None, description="Created before timestamp")
    
    
class DatasetPagination(BaseModel):
    """Dataset pagination schema"""
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(10, ge=1, le=100, description="Page size")
    order_by: Optional[str] = Field(None, description="Sort criteria")
    order: Optional[str] = Field(None, description="Sort order (asc, desc)")


class DatasetListResponse(BaseModel):
    """Dataset list response schema"""
    items: List[DatasetListItem] = Field(..., description="Dataset list")
    total: int = Field(..., description="Total count")
    page: int = Field(..., description="Current page")
    limit: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages") 