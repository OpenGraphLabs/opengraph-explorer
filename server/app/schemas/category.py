"""
Category Pydantic Schemas

API request/response schemas for category-related operations
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class CategoryBase(BaseModel):
    """
    Category is the ontology class for the dataset.
    """
    name: str = Field(..., description="Category Name")


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Category Name")


class CategoryRead(CategoryBase):
    id: int = Field(..., description="Category ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)


class CategoryInDB(CategoryRead):
    pass

class CategoryListResponse(BaseModel):
    """Category list response schema"""
    items: List[CategoryRead] = Field(..., description="Category list")
    total: int = Field(..., description="Total count")
    page: int = Field(..., description="Current page")
    limit: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages")
