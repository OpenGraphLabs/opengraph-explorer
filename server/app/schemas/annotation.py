"""
어노테이션 Pydantic 스키마

어노테이션 관련 API 요청/응답 스키마들을 정의합니다.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator, field_serializer
import json


class AnnotationBase(BaseModel):
    """어노테이션 기본 스키마"""
    bbox: List[float] = Field(..., description="Bounding box [x, y, width, height]")
    area: float = Field(..., description="Segmentation area")
    segmentation_size: Optional[List[int]] = Field(None, description="[height, width] of the segmentation")
    segmentation_counts: Optional[str] = Field(None, description="COCO RLE encoding")
    polygon: Optional[Dict[str, Any]] = Field(None, description="Pre-computed polygon data for client rendering")
    point_coords: Optional[List[List[float]]] = Field(None, description="Point coordinates used for SAM")
    is_crowd: bool = Field(False, description="Is crowd annotation")
    predicted_iou: Optional[float] = Field(None, description="Predicted IoU from SAM")
    stability_score: Optional[float] = Field(None, description="Stability score from SAM")
    
    @field_validator('polygon', mode='before')
    @classmethod
    def validate_polygon(cls, v):
        """JSON 문자열을 딕셔너리로 변환"""
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v


class AnnotationCreate(AnnotationBase):
    """어노테이션 생성 스키마"""
    status: str = Field("PENDING", description="Annotation status")
    source_type: str = Field(..., description="Source type (AUTO or USER)")
    image_id: int = Field(..., description="Associated image ID")
    category_id: Optional[int] = Field(None, description="Associated category ID")
    created_by: Optional[int] = Field(None, description="Creator user ID (for USER type)")


class AnnotationUserCreate(BaseModel):
    """사용자가 생성하는 어노테이션 스키마"""
    bbox: List[float] = Field(..., description="Bounding box [x, y, width, height]")
    area: float = Field(..., description="Segmentation area")
    segmentation_size: Optional[List[int]] = Field(None, description="[height, width] of the segmentation")
    segmentation_counts: Optional[str] = Field(None, description="COCO RLE encoding")
    polygon: Optional[Dict[str, Any]] = Field(None, description="Pre-computed polygon data for client rendering")
    point_coords: Optional[List[List[float]]] = Field(None, description="Point coordinates used for SAM")
    is_crowd: bool = Field(False, description="Is crowd annotation")
    predicted_iou: Optional[float] = Field(None, description="Predicted IoU from SAM")
    stability_score: Optional[float] = Field(None, description="Stability score from SAM")
    image_id: int = Field(..., description="Associated image ID")
    category_id: Optional[int] = Field(None, description="Associated category ID")
    
    @field_validator('polygon', mode='before')
    @classmethod
    def validate_polygon(cls, v):
        """JSON 문자열을 딕셔너리로 변환"""
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v


class AnnotationUpdate(BaseModel):
    """어노테이션 업데이트 스키마"""
    bbox: Optional[List[float]] = Field(None, description="Bounding box [x, y, width, height]")
    area: Optional[float] = Field(None, description="Segmentation area")
    segmentation_size: Optional[List[int]] = Field(None, description="[height, width] of the segmentation")
    segmentation_counts: Optional[str] = Field(None, description="COCO RLE encoding")
    polygon: Optional[Dict[str, Any]] = Field(None, description="Pre-computed polygon data for client rendering")
    is_crowd: Optional[bool] = Field(None, description="Is crowd annotation")
    status: Optional[str] = Field(None, description="Annotation status")
    category_id: Optional[int] = Field(None, description="Associated category ID")


class AnnotationRead(AnnotationBase):
    """어노테이션 읽기 스키마"""
    id: int = Field(..., description="Annotation ID")
    status: str = Field(..., description="Annotation status")
    source_type: str = Field(..., description="Source type (AUTO or USER)")
    image_id: int = Field(..., description="Associated image ID")
    category_id: Optional[int] = Field(None, description="Associated category ID")
    created_by: Optional[int] = Field(None, description="Creator user ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Client-friendly mask information (computed field)
    mask_info: Optional[Dict[str, Any]] = Field(None, description="Processed mask information for client", exclude=True)
    
    model_config = ConfigDict(from_attributes=True)
    
    # Override model_dump to include mask_info
    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        if self.mask_info is not None and not kwargs.get('exclude', {}).get('mask_info', False):
            data['mask_info'] = self.mask_info
        return data
    
    def model_dump_json(self, **kwargs):
        data = self.model_dump(**kwargs)
        import json
        return json.dumps(data, default=str)


class AnnotationClientRead(BaseModel):
    """클라이언트용 어노테이션 읽기 스키마 (RLE 데이터 제외)"""
    id: int = Field(..., description="Annotation ID")
    bbox: List[float] = Field(..., description="Bounding box [x, y, width, height]")
    area: float = Field(..., description="Segmentation area")
    point_coords: Optional[List[List[float]]] = Field(None, description="Point coordinates used for SAM")
    is_crowd: bool = Field(False, description="Is crowd annotation")
    predicted_iou: Optional[float] = Field(None, description="Predicted IoU from SAM")
    stability_score: Optional[float] = Field(None, description="Stability score from SAM")
    status: str = Field(..., description="Annotation status")
    source_type: str = Field(..., description="Source type (AUTO or USER)")
    image_id: int = Field(..., description="Associated image ID")
    category_id: Optional[int] = Field(None, description="Associated category ID")
    created_by: Optional[int] = Field(None, description="Creator user ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Polygon 데이터 (JSON 형태)
    polygon: Optional[Dict[str, Any]] = Field(None, description="Pre-computed polygon data for client rendering")
    
    @field_validator('polygon', mode='before')
    def parse_polygon(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None
        return v
    
    @field_serializer('polygon')
    def serialize_polygon(self, v):
        # Serialize 시에는 항상 dict나 None을 반환
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None
        return v
    
    model_config = ConfigDict(from_attributes=True)


class AnnotationListResponse(BaseModel):
    """어노테이션 목록 응답 스키마"""
    items: List[AnnotationRead] = Field(..., description="Annotation list")
    total: int = Field(..., description="Total count")
    page: int = Field(..., description="Current page")
    limit: int = Field(..., description="Page size")
    pages: int = Field(..., description="Total pages")