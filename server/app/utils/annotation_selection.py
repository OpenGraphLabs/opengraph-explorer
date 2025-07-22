"""
Annotation Selection 유틸리티

사용자의 어노테이션 선택과 관련된 유틸리티 함수들을 제공합니다.
"""

from typing import List
import hashlib


def normalize_annotation_ids(annotation_ids: List[int]) -> str:
    """
    어노테이션 ID 목록을 정규화된 문자열 키로 변환합니다.
    
    Args:
        annotation_ids: 어노테이션 ID 목록
        
    Returns:
        str: 정렬된 comma-separated 문자열 (예: "1,3,4")
        
    Examples:
        >>> normalize_annotation_ids([4, 1, 3])
        "1,3,4"
        >>> normalize_annotation_ids([])
        ""
        >>> normalize_annotation_ids([1])
        "1"
    """
    if not annotation_ids:
        return ""
    
    # 중복 제거 및 정렬
    unique_sorted_ids = sorted(set(annotation_ids))
    
    # comma-separated 문자열로 변환
    return ','.join(str(id_) for id_ in unique_sorted_ids)


def parse_annotation_ids_key(annotation_ids_key: str) -> List[int]:
    """
    Parse normalized keys to annotation ID list.
    
    Args:
        annotation_ids_key: comma-separated string key (ex: "1,3,4")
        
    Returns:
        List[int]: annotation ID list
        
    Examples:
        >>> parse_annotation_ids_key("1,3,4")
        [1, 3, 4]
        >>> parse_annotation_ids_key("")
        []
        >>> parse_annotation_ids_key("1")
        [1]
    """
    if not annotation_ids_key or annotation_ids_key.strip() == "":
        return []
    
    try:
        return [int(id_.strip()) for id_ in annotation_ids_key.split(',') if id_.strip()]
    except ValueError as e:
        raise ValueError(f"Invalid annotation_ids_key format: {annotation_ids_key}") from e


def validate_annotation_ids(annotation_ids: List[int]) -> bool:
    """
    어노테이션 ID 목록의 유효성을 검증합니다.
    
    Args:
        annotation_ids: 검증할 어노테이션 ID 목록
        
    Returns:
        bool: 유효한 경우 True, 그렇지 않으면 False
        
    Validation Rules:
        - 빈 목록은 유효하지 않음
        - 모든 ID는 양의 정수여야 함
        - 중복된 ID가 있어도 허용 (정규화 과정에서 제거됨)
    """
    if not annotation_ids:
        return False
    
    for annotation_id in annotation_ids:
        if not isinstance(annotation_id, int) or annotation_id <= 0:
            return False
    
    return True


def generate_selection_hash(image_id: int, annotation_ids_key: str, category_id: int) -> str:
    """
    선택 조합의 고유 해시를 생성합니다. (선택적 사용)
    
    동일한 선택을 빠르게 식별하기 위한 해시값을 생성합니다.
    주로 캐싱이나 중복 검사 용도로 사용할 수 있습니다.
    
    Args:
        image_id: 이미지 ID
        annotation_ids_key: 정규화된 어노테이션 ID 키
        category_id: 카테고리 ID
        
    Returns:
        str: SHA-256 해시값 (64자)
        
    Examples:
        >>> generate_selection_hash(1, "1,3,4", 5)
        "a1b2c3d4e5f6..."
    """
    # 선택을 고유하게 식별할 수 있는 문자열 생성
    selection_string = f"img:{image_id}|ann:{annotation_ids_key}|cat:{category_id}"
    
    # SHA-256 해시 생성
    return hashlib.sha256(selection_string.encode('utf-8')).hexdigest()


def calculate_selection_similarity(
    selection1_ids: List[int], 
    selection2_ids: List[int]
) -> float:
    """
    두 어노테이션 선택의 유사도를 계산합니다.
    
    Jaccard 유사도 (교집합 / 합집합)를 사용하여 계산합니다.
    완전히 동일한 선택은 1.0, 전혀 겹치지 않는 선택은 0.0을 반환합니다.
    
    Args:
        selection1_ids: 첫 번째 선택의 어노테이션 ID 목록
        selection2_ids: 두 번째 선택의 어노테이션 ID 목록
        
    Returns:
        float: 0.0 ~ 1.0 사이의 유사도 값
        
    Examples:
        >>> calculate_selection_similarity([1, 2, 3], [1, 2, 3])
        1.0
        >>> calculate_selection_similarity([1, 2], [2, 3])
        0.333...
        >>> calculate_selection_similarity([1, 2], [3, 4])
        0.0
    """
    if not selection1_ids and not selection2_ids:
        return 1.0  # 둘 다 빈 선택인 경우
    
    if not selection1_ids or not selection2_ids:
        return 0.0  # 하나만 빈 선택인 경우
    
    set1 = set(selection1_ids)
    set2 = set(selection2_ids)
    
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    
    return intersection / union if union > 0 else 0.0