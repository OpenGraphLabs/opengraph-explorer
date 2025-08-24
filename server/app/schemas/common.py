"""
Dataset Pydantic Schemas

Common schemas
"""

from typing import Optional, TypeVar, Generic, List
from pydantic import BaseModel, Field

T = TypeVar('T')

class PaginationInput(BaseModel):
    """Pagination input schema (for requests)"""
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(10, ge=1, le=100, description="Page size")
    order_by: Optional[str] = Field(None, description="Sort criteria")
    order: Optional[str] = Field(None, description="Sort order (asc, desc)")

class Pagination(BaseModel, Generic[T]):
    """Pagination response schema (for responses)"""
    items: List[T] = Field(..., description="List of items")
    total: int = Field(..., description="Total number of items")
    page: int = Field(1, ge=1, description="Current page number")
    size: int = Field(10, ge=1, le=100, description="Page size")
    pages: int = Field(..., description="Total number of pages")