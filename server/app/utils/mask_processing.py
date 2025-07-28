"""
Mask processing utilities for multiprocessing

Separate module to avoid pickling issues with ProcessPoolExecutor
"""

from typing import Dict, Any, List, Optional
import numpy as np
import cv2
from pycocotools import mask as maskUtils


def process_mask_info_batch(segmentation_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Process multiple mask info in a single process call (more efficient)
    
    Args:
        segmentation_data_list: List of dictionaries containing segmentation data
        
    Returns:
        List of processed mask info
    """
    import os
    import time
    
    process_id = os.getpid()
    batch_size = len(segmentation_data_list)
    start_time = time.time()
    
    print(f"      [PID {process_id}] Starting batch processing of {batch_size} items...")
    
    results = []
    for i, seg_data in enumerate(segmentation_data_list):
        if i % 10 == 0 and i > 0:  # Progress every 10 items
            elapsed = time.time() - start_time
            print(f"      [PID {process_id}] Processed {i}/{batch_size} items ({elapsed:.2f}s)")
        
        results.append(process_single_mask_info(seg_data))
    
    total_time = time.time() - start_time
    print(f"      [PID {process_id}] Completed batch of {batch_size} items in {total_time:.2f}s")
    
    return results


def process_single_mask_info(segmentation_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process mask info for a single annotation
    
    Args:
        segmentation_data: Dictionary containing segmentation_counts, segmentation_size, bbox
        
    Returns:
        Processed mask info
    """
    segmentation_counts = segmentation_data.get('segmentation_counts')
    segmentation_size = segmentation_data.get('segmentation_size')
    bbox = segmentation_data.get('bbox')
    
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
        bbox_polygon = bbox_to_polygon(bbox)
        mask_info["bbox_polygon"] = bbox_polygon
    
    return mask_info


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
            epsilon = 0.01 * cv2.arcLength(contour, True)
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


def rle_to_polygon_optimized(segmentation_counts: str, segmentation_size: List[int]) -> List[List[List[float]]]:
    """
    Optimized COCO RLE to polygon conversion
    """
    if not segmentation_counts or not segmentation_size:
        return []
    
    try:
        # COCO RLE 포맷으로 변환
        rle = {
            'size': segmentation_size,
            'counts': segmentation_counts.encode('utf-8') if isinstance(segmentation_counts, str) else segmentation_counts
        }
        
        # RLE를 binary mask로 변환
        binary_mask = maskUtils.decode(rle)
        
        # Skip if mask is too small
        mask_pixels = binary_mask.sum()
        if mask_pixels < 10:
            return []
        
        # Use faster contour approximation for large masks
        if mask_pixels > 10000:  # Large mask
            # Downsample for faster processing
            scale = 0.5
            small_mask = cv2.resize(binary_mask, None, fx=scale, fy=scale, interpolation=cv2.INTER_NEAREST)
            contours, _ = cv2.findContours(
                small_mask.astype(np.uint8), 
                cv2.RETR_EXTERNAL, 
                cv2.CHAIN_APPROX_SIMPLE
            )
            # Scale contours back up - FIX: Proper scaling to avoid cv2.contourArea errors
            scaled_contours = []
            for contour in contours:
                # Convert to float and scale properly
                scaled_contour = contour.astype(np.float32) * (1/scale)
                # Convert back to proper format for cv2 functions
                scaled_contour = scaled_contour.astype(np.int32)
                scaled_contours.append(scaled_contour)
            contours = scaled_contours
        else:
            contours, _ = cv2.findContours(
                binary_mask.astype(np.uint8), 
                cv2.RETR_EXTERNAL, 
                cv2.CHAIN_APPROX_SIMPLE
            )
        
        polygons = []
        for contour in contours:
            # Skip tiny contours
            area = cv2.contourArea(contour.astype(np.float32))
            if area < 20:
                continue
            
            # Adaptive epsilon based on contour size
            perimeter = cv2.arcLength(contour.astype(np.float32), True)
            if area > 5000:  # Large contour
                epsilon = 0.02 * perimeter
            elif area > 1000:  # Medium contour
                epsilon = 0.015 * perimeter
            else:  # Small contour
                epsilon = 0.01 * perimeter
            
            simplified_contour = cv2.approxPolyDP(contour.astype(np.float32), epsilon, True)
            
            if len(simplified_contour) >= 3:
                polygon = simplified_contour.reshape(-1, 2).astype(float).tolist()
                
                # Aggressive point reduction for very long polygons
                if len(polygon) > 100:
                    step = len(polygon) // 50
                    polygon = polygon[::step]
                elif len(polygon) > 50:
                    step = 2
                    polygon = polygon[::step]
                
                polygons.append(polygon)
        
        # Limit polygons
        if len(polygons) > 5:
            polygons = sorted(polygons, key=lambda p: cv2.contourArea(np.array(p, dtype=np.float32)), reverse=True)[:5]
        
        return polygons
        
    except Exception as e:
        # Silent fail in production
        return []


def bbox_to_polygon(bbox: List[float]) -> List[List[float]]:
    """Convert bbox to polygon"""
    if not bbox or len(bbox) != 4:
        return []
    
    x, y, width, height = bbox
    return [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height]
    ]