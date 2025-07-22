"""
User Annotation Selection 스키마

사용자의 어노테이션 선택 관련 Pydantic 모델들을 정의합니다.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator, computed_field

from ..utils.annotation_selection import parse_annotation_ids_key


class UserAnnotationSelectionBase(BaseModel):
    """사용자 어노테이션 선택 기본 스키마"""
    
    image_id: int = Field(..., description="이미지 ID")
    selected_annotation_ids: List[int] = Field(
        ..., 
        min_items=1,
        description="선택된 어노테이션 ID 목록"
    )
    category_id: Optional[int] = Field(None, description="매핑할 카테고리 ID")
    
    @validator('selected_annotation_ids')
    def validate_annotation_ids(cls, v):
        """어노테이션 ID 목록 유효성 검증"""
        if not v:
            raise ValueError("최소 하나의 어노테이션을 선택해야 합니다")
        
        # 양의 정수 검증
        for annotation_id in v:
            if annotation_id <= 0:
                raise ValueError(f"어노테이션 ID는 양의 정수여야 합니다: {annotation_id}")
        
        return v


class UserAnnotationSelectionCreate(UserAnnotationSelectionBase):
    """사용자 어노테이션 선택 생성 스키마"""
    pass


class UserAnnotationSelectionUpdate(BaseModel):
    """사용자 어노테이션 선택 업데이트 스키마"""
    
    category_id: Optional[int] = Field(None, description="업데이트할 카테고리 ID")
    status: Optional[str] = Field(
        None, 
        pattern="^(PENDING|APPROVED|REJECTED)$",
        description="상태 업데이트 (PENDING|APPROVED|REJECTED)"
    )


class UserAnnotationSelectionRead(BaseModel):
    """사용자 어노테이션 선택 조회 스키마"""
    
    id: int
    user_id: int
    image_id: int
    category_id: Optional[int]
    selected_annotation_ids_key: str = Field(
        description="정규화된 어노테이션 ID 문자열 키"
    )
    status: str = Field(description="선택 상태")
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @computed_field
    def selected_annotation_ids(self) -> List[int]:
        """선택된 어노테이션 ID 목록을 computed field로 제공"""
        return parse_annotation_ids_key(self.selected_annotation_ids_key)
    
    class Config:
        from_attributes = True


class UserAnnotationSelectionWithDetails(UserAnnotationSelectionRead):
    """상세 정보가 포함된 사용자 어노테이션 선택 스키마"""
    
    # 관련 엔티티 정보 (선택적으로 포함)
    user_display_name: Optional[str] = Field(None, description="사용자 표시 이름")
    category_name: Optional[str] = Field(None, description="카테고리 이름")
    image_filename: Optional[str] = Field(None, description="이미지 파일명")


class AnnotationSelectionStats(BaseModel):
    """어노테이션 선택 통계 스키마"""
    
    image_id: int
    selected_annotation_ids_key: str
    category_id: Optional[int]
    category_name: Optional[str]
    selection_count: int = Field(description="동일한 선택을 한 사용자 수")
    status: str = Field(description="현재 상태")
    first_selected_at: datetime = Field(description="첫 선택 시각")
    last_selected_at: datetime = Field(description="마지막 선택 시각")
    
    # 승인 임계값 도달 여부
    is_ready_for_approval: bool = Field(
        description="승인 가능 여부 (5명 이상 선택)"
    )


class AnnotationSelectionBatch(BaseModel):
    """어노테이션 선택 일괄 처리 스키마"""
    
    image_ids: List[int] = Field(..., min_items=1, description="처리할 이미지 ID 목록")
    status_filter: Optional[str] = Field(
        None,
        pattern="^(PENDING|APPROVED|REJECTED)$", 
        description="필터링할 상태"
    )
    min_selection_count: int = Field(
        default=5,
        ge=1,
        description="승인을 위한 최소 선택 수"
    )


class AnnotationSelectionSummary(BaseModel):
    """어노테이션 선택 요약 스키마"""
    
    total_selections: int = Field(description="전체 선택 수")
    pending_selections: int = Field(description="대기 중인 선택 수") 
    approved_selections: int = Field(description="승인된 선택 수")
    rejected_selections: int = Field(description="거부된 선택 수")
    ready_for_approval: int = Field(description="승인 가능한 선택 수")
    
    # 이미지별 통계
    images_with_selections: int = Field(description="선택이 있는 이미지 수")
    avg_selections_per_image: float = Field(description="이미지당 평균 선택 수")
    
    # 사용자별 통계  
    active_users: int = Field(description="선택에 참여한 사용자 수")
    avg_selections_per_user: float = Field(description="사용자당 평균 선택 수")