"""
Dictionary Pydantic Schemas

API request/response schemas for dictionary-related operations
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class DictionaryBase(BaseModel):
    """Base dictionary schema"""
    name: str = Field(..., description="Dictionary name")
    description: Optional[str] = Field(None, description="Dictionary description")


class DictionaryCreate(DictionaryBase):
    """Dictionary creation schema"""
    pass


class DictionaryUpdate(BaseModel):
    """Dictionary update schema"""
    name: Optional[str] = Field(None, description="Dictionary name")
    description: Optional[str] = Field(None, description="Dictionary description")


class DictionaryRead(DictionaryBase):
    """Dictionary read schema"""
    id: int = Field(..., description="Dictionary ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)


class DictionaryInDB(DictionaryRead):
    """Database dictionary schema"""
    pass 