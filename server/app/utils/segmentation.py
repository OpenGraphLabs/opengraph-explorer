"""
Segmentation 유틸리티

COCO RLE 포맷을 클라이언트 친화적인 형태로 변환하는 함수들
"""

import numpy as np
import cv2
from typing import List, Optional, Tuple, Dict, Any
from pycocotools import mask as maskUtils


def rle_to_polygon(segmentation_counts: str, segmentation_size: List[int]) -> List[List[List[float]]]:
    """
    COCO RLE 포맷을 polygon 좌표로 변환
    
    Args:
        segmentation_counts: COCO RLE encoding string
        segmentation_size: [height, width] of the segmentation
        
    Returns:
        List[List[List[float]]]: List of polygons, each polygon is a list of [x, y] coordinates
    """
    if not segmentation_counts or not segmentation_size:
        return []
    
    try:
        # COCO RLE 포맷으로 변환
        rle = {
            'size': segmentation_size,  # [height, width]
            'counts': segmentation_counts.encode('utf-8')
        }
        
        # RLE를 binary mask로 변환
        binary_mask = maskUtils.decode(rle)
        
        # OpenCV를 사용해서 contour 찾기
        contours, _ = cv2.findContours(
            binary_mask.astype(np.uint8), 
            cv2.RETR_EXTERNAL, 
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        polygons = []
        for contour in contours:
            # contour 단순화 (너무 많은 점들 제거)
            epsilon = 0.005 * cv2.arcLength(contour, True)
            simplified_contour = cv2.approxPolyDP(contour, epsilon, True)
            
            # 최소 3개의 점이 있어야 polygon
            if len(simplified_contour) >= 3:
                # contour를 [x, y] 좌표 리스트로 변환
                polygon = simplified_contour.reshape(-1, 2).astype(float).tolist()
                polygons.append(polygon)
        
        return polygons
    
    except Exception as e:
        print(f"Error converting RLE to polygon: {e}")
        return []


def rle_to_bbox_polygon(bbox: List[float]) -> List[List[float]]:
    """
    Bounding box를 polygon 형태로 변환 (fallback 용도)
    
    Args:
        bbox: [x, y, width, height] format
        
    Returns:
        List[List[float]]: Rectangle polygon coordinates
    """
    if not bbox or len(bbox) != 4:
        return []
    
    x, y, width, height = bbox
    return [
        [x, y],                    # top-left
        [x + width, y],            # top-right  
        [x + width, y + height],   # bottom-right
        [x, y + height]            # bottom-left
    ]


def get_mask_info_for_client(
    segmentation_counts: Optional[str],
    segmentation_size: Optional[List[int]],
    bbox: Optional[List[float]]
) -> Dict[str, Any]:
    """
    클라이언트용 마스크 정보를 생성
    
    Args:
        segmentation_counts: COCO RLE encoding
        segmentation_size: [height, width]
        bbox: [x, y, width, height]
        
    Returns:
        Dict: 클라이언트에서 사용할 수 있는 마스크 정보
    """
    mask_info = {
        "has_segmentation": False,
        "polygons": [],
        "bbox_polygon": []
    }
    
    # Segmentation 변환 시도
    if segmentation_counts and segmentation_size:
        polygons = rle_to_polygon(segmentation_counts, segmentation_size)
        if polygons:
            mask_info["has_segmentation"] = True
            mask_info["polygons"] = polygons
    
    # Bbox polygon (fallback 또는 추가 정보)
    if bbox:
        bbox_polygon = rle_to_bbox_polygon(bbox)
        mask_info["bbox_polygon"] = bbox_polygon
    
    return mask_info


def validate_polygon_coordinates(polygons: List[List[List[float]]], image_size: Optional[Tuple[int, int]] = None) -> bool:
    """
    Polygon 좌표의 유효성 검증
    
    Args:
        polygons: List of polygons
        image_size: Optional (width, height) for bounds checking
        
    Returns:
        bool: 유효한 polygon인지 여부
    """
    if not polygons:
        return False
    
    for polygon in polygons:
        if len(polygon) < 3:  # polygon은 최소 3개의 점이 필요
            return False
        
        for point in polygon:
            if len(point) != 2:  # 각 점은 [x, y] 형태
                return False
            
            x, y = point
            if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
                return False
            
            # 이미지 경계 검증 (선택적)
            if image_size:
                width, height = image_size
                if x < 0 or x > width or y < 0 or y > height:
                    return False
    
    return True 