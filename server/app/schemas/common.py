"""
Dataset Pydantic Schemas

Common schemas
"""

from typing import Optional
from pydantic import BaseModel, Field

class Pagination(BaseModel):
    """Pagination schema"""
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(10, ge=1, le=100, description="Page size")
    order_by: Optional[str] = Field(None, description="Sort criteria")
    order: Optional[str] = Field(None, description="Sort order (asc, desc)")