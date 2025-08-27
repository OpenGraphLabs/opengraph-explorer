"""
User Pydantic Schemas

API request/response schemas for user-related operations
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr = Field(..., description="User email address")
    google_id: Optional[str] = Field(None, description="Google OAuth ID")
    display_name: Optional[str] = Field(None, description="Display name")
    profile_image_url: Optional[str] = Field(None, description="Profile image URL")
    sui_address: Optional[str] = Field(None, description="Sui wallet address")
    total_points: int = Field(0, description="Total points earned by user")


class UserCreate(UserBase):
    """User creation schema"""
    pass


class UserUpdate(BaseModel):
    """User update schema"""
    email: Optional[EmailStr] = Field(None, description="User email address")
    google_id: Optional[str] = Field(None, description="Google OAuth ID")
    display_name: Optional[str] = Field(None, description="Display name")
    profile_image_url: Optional[str] = Field(None, description="Profile image URL")
    sui_address: Optional[str] = Field(None, description="Sui wallet address")


class UserRead(UserBase):
    """User read schema"""
    id: int = Field(..., description="User ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserRead):
    """Database user schema"""
    pass


class UserProfile(BaseModel):
    """User profile schema"""
    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email address")
    google_id: Optional[str] = Field(None, description="Google OAuth ID")
    display_name: Optional[str] = Field(None, description="Display name")
    profile_image_url: Optional[str] = Field(None, description="Profile image URL")
    sui_address: Optional[str] = Field(None, description="Sui wallet address")
    created_at: datetime = Field(..., description="Creation timestamp")
    total_points: int = Field(0, description="Total points earned by user")
    dataset_count: int = Field(0, description="Number of created datasets")
    annotation_count: int = Field(0, description="Number of created annotations")
    
    # 기여도 관련 통계
    images_submitted: int = Field(0, description="Number of images submitted")
    images_approved: int = Field(0, description="Number of approved images") 
    images_rejected: int = Field(0, description="Number of rejected images")
    images_pending: int = Field(0, description="Number of pending images")
    approval_rate: float = Field(0.0, description="Image approval rate percentage")
    
    model_config = ConfigDict(from_attributes=True) 