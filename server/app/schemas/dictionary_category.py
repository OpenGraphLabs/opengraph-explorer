"""
Dictionary Category Pydantic Schemas

API request/response schemas for dictionary-category association operations
"""

from pydantic import BaseModel, Field, ConfigDict


class DictionaryCategoryBase(BaseModel):
    """Base dictionary-category association schema"""
    dictionary_id: int = Field(..., description="Dictionary ID")
    category_id: int = Field(..., description="Category ID")


class DictionaryCategoryCreate(DictionaryCategoryBase):
    """Dictionary-category association creation schema"""
    pass


class DictionaryCategoryRead(DictionaryCategoryBase):
    """Dictionary-category association read schema"""
    
    model_config = ConfigDict(from_attributes=True)


class DictionaryCategoryInDB(DictionaryCategoryRead):
    """Database dictionary-category association schema"""
    pass 