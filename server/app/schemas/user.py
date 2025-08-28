"""
User Pydantic Schemas

API request/response schemas for user-related operations
"""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr = Field(..., description="User email address")
    google_id: Optional[str] = Field(None, description="Google OAuth ID")
    display_name: Optional[str] = Field(None, description="Display name")
    profile_image_url: Optional[str] = Field(None, description="Profile image URL")
    sui_address: Optional[str] = Field(None, description="Sui wallet address")
    total_points: int = Field(0, description="Total points earned by user")
    
    # 프로필 완성 관련 필드
    nickname: Optional[str] = Field(None, description="User nickname")
    gender: Optional[Literal["MALE", "FEMALE", "OTHER"]] = Field(None, description="User gender")
    age: Optional[int] = Field(None, description="User age", ge=13, le=100)
    country: Optional[str] = Field(None, description="Country code (ISO 3166-1 alpha-2)")
    is_profile_complete: bool = Field(False, description="Whether profile is complete")


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
    
    # 프로필 완성 관련 필드
    nickname: Optional[str] = Field(None, description="User nickname")
    gender: Optional[Literal["MALE", "FEMALE", "OTHER"]] = Field(None, description="User gender")
    age: Optional[int] = Field(None, description="User age", ge=13, le=100)
    country: Optional[str] = Field(None, description="Country code (ISO 3166-1 alpha-2)")


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
    
    # 프로필 완성 관련 필드
    nickname: Optional[str] = Field(None, description="User nickname")
    gender: Optional[Literal["MALE", "FEMALE", "OTHER"]] = Field(None, description="User gender")
    age: Optional[int] = Field(None, description="User age")
    country: Optional[str] = Field(None, description="Country code (ISO 3166-1 alpha-2)")
    is_profile_complete: bool = Field(False, description="Whether profile is complete")
    
    # 기여도 관련 통계
    images_submitted: int = Field(0, description="Number of images submitted")
    images_approved: int = Field(0, description="Number of approved images") 
    images_rejected: int = Field(0, description="Number of rejected images")
    images_pending: int = Field(0, description="Number of pending images")
    approval_rate: float = Field(0.0, description="Image approval rate percentage")
    
    model_config = ConfigDict(from_attributes=True)


class ProfileCompleteRequest(BaseModel):
    """Profile completion request schema"""
    nickname: str = Field(..., description="User nickname", min_length=2, max_length=50)
    gender: Literal["MALE", "FEMALE", "OTHER"] = Field(..., description="User gender")
    age: int = Field(..., description="User age", ge=13, le=100)
    country: str = Field(..., description="Country code (ISO 3166-1 alpha-2)", min_length=2, max_length=2)


class ProfileCompleteResponse(BaseModel):
    """Profile completion response schema"""
    success: bool = Field(..., description="Whether profile completion was successful")
    message: str = Field(..., description="Response message")
    user: UserRead = Field(..., description="Updated user data") 