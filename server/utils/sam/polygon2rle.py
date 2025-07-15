import json
import numpy as np
from pycocotools import mask as mask_utils

polygon_path = "./test/coco2017/annotations/instances_val2017.json"
rle_path = "./test/coco2017/annotations/instances_val2017_rle.json"

def polygon_to_rle(polygon, height, width):
    """
    폴리곤을 RLE 형태로 변환
    
    Args:
        polygon: 폴리곤 좌표 리스트 [[x1,y1,x2,y2,...]]
        height: 이미지 높이
        width: 이미지 너비
    
    Returns:
        RLE 형태의 segmentation
    """
    rles = mask_utils.frPyObjects(polygon, height, width)
    rle = mask_utils.merge(rles)
    return rle

def convert_annotations():
    """
    COCO 어노테이션의 폴리곤을 RLE로 변환
    """
    # 원본 COCO 데이터 로드
    with open(polygon_path, 'r') as f:
        coco_data = json.load(f)
    
    # 이미지 ID별 크기 정보 매핑
    image_info = {img['id']: (img['height'], img['width']) 
                  for img in coco_data['images']}
    
    # 어노테이션 변환
    converted_annotations = []
    
    for ann in coco_data['annotations']:
        image_id = ann['image_id']
        height, width = image_info[image_id]
        
        # 이미 RLE 형태인 경우 그대로 유지
        if isinstance(ann['segmentation'], dict):
            converted_annotations.append(ann)
        # 폴리곤인 경우 RLE로 변환
        elif isinstance(ann['segmentation'], list):
            rle = polygon_to_rle(ann['segmentation'], height, width)
            
            # 새로운 어노테이션 생성
            new_ann = ann.copy()
            new_ann['segmentation'] = {
                'size': [height, width],
                'counts': rle['counts'].decode('utf-8') if isinstance(rle['counts'], bytes) else rle['counts']
            }
            converted_annotations.append(new_ann)
    
    # 변환된 데이터 저장
    converted_data = coco_data.copy()
    converted_data['annotations'] = converted_annotations
    
    with open(rle_path, 'w') as f:
        json.dump(converted_data, f, indent=2)
    
    print(f"변환 완료: {len(converted_annotations)}개 어노테이션")
    print(f"저장 위치: {rle_path}")

if __name__ == "__main__":
    convert_annotations()











