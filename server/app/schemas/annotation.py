"""
Annotation Pydantic Schemas

API request/response schemas for unified annotation operations (both auto-generated and user-created)
"""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


class AnnotationBase(BaseModel):
    """Base annotation schema for both auto-generated and user-created annotations"""
    bbox: Optional[List[float]] = Field(None, description="Bounding Box [x, y, width, height]")
    area: Optional[float] = Field(None, description="Annotation area")
    segmentation_size: Optional[List[int]] = Field(None, description="Segmentation Size [height, width]")
    segmentation_counts: Optional[str] = Field(None, description="Segmentation RLE Encoding")
    point_coords: Optional[List[List[float]]] = Field(None, description="Point Coordinates [[x, y], [x, y], ...]")
    is_crowd: bool = Field(False, description="Is Crowd")
    predicted_iou: Optional[float] = Field(None, description="Predicted IoU")
    stability_score: Optional[float] = Field(None, description="Stability Score")
    status: Literal["PENDING", "APPROVED", "REJECTED"] = Field("PENDING", description="Status of the annotation")
    source_type: Literal["AUTO", "USER"] = Field(..., description="Source type of the annotation")
    image_id: int = Field(..., description="Image ID")
    category_id: Optional[int] = Field(None, description="Category ID")
    created_by: Optional[int] = Field(None, description="Creator ID (NULL for AUTO)")


class AnnotationCreate(AnnotationBase):
    pass


class AnnotationUpdate(BaseModel):
    """Annotation update schema"""
    bbox: Optional[List[float]] = Field(None, description="Bounding Box [x, y, width, height]")
    area: Optional[float] = Field(None, description="Annotation area")
    segmentation_size: Optional[List[int]] = Field(None, description="Segmentation Size [height, width]")
    segmentation_counts: Optional[str] = Field(None, description="Segmentation RLE Encoding")
    point_coords: Optional[List[List[float]]] = Field(None, description="Point Coordinates [[x, y], [x, y], ...]")
    is_crowd: Optional[bool] = Field(None, description="Is Crowd")
    predicted_iou: Optional[float] = Field(None, description="Predicted IoU")
    stability_score: Optional[float] = Field(None, description="Stability Score")
    status: Optional[Literal["PENDING", "APPROVED", "REJECTED"]] = Field(None, description="Status of the annotation")
    category_id: Optional[int] = Field(None, description="Category ID")


class AnnotationRead(AnnotationBase):
    """Annotation read schema"""
    id: int = Field(..., description="Annotation ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    model_config = ConfigDict(from_attributes=True)


class AnnotationInDB(AnnotationRead):
    """Database annotation schema"""
    pass 