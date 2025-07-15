import json
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from pycocotools import mask as coco_mask
import os
from typing import Dict, Any
import argparse

def load_coco_annotations(json_path: str) -> Dict[str, Any]:
    """COCO 형식 JSON 파일을 로드합니다."""
    with open(json_path, 'r') as f:
        data = json.load(f)
    return data

def decode_rle_mask(rle_data: Dict[str, Any], image_height: int, image_width: int) -> np.ndarray:
    """RLE 인코딩된 마스크를 디코딩합니다."""
    if isinstance(rle_data, dict) and 'counts' in rle_data:
        # RLE 형식이 이미 올바른 형식인 경우
        rle_data['size'] = [image_height, image_width]
        mask = coco_mask.decode(rle_data)
    else:
        # 다른 형식의 경우 처리
        mask = np.zeros((image_height, image_width), dtype=np.uint8)
    
    return mask

def create_overlay_image(coco_data: Dict[str, Any], output_path: str, original_image_path: str = None, alpha: float = 0.5):
    """COCO 데이터에서 전체 오버레이 이미지를 생성합니다."""
    
    # 이미지 정보 가져오기
    image_info = coco_data['images'][0]  # 첫 번째 이미지 정보
    image_height = image_info['height']
    image_width = image_info['width']
    
    # 원본 이미지 로드
    if original_image_path and os.path.exists(original_image_path):
        original_img = Image.open(original_image_path).convert('RGB')
        original_array = np.array(original_img)
    else:
        # 원본 이미지가 없으면 같은 폴더에서 찾기
        current_dir = os.path.dirname(os.path.abspath(__file__))
        image_name = image_info['file_name']
        possible_paths = [
            os.path.join(current_dir, image_name),
            os.path.join(current_dir, '..', 'images', image_name),
            os.path.join(current_dir, 'images', image_name),
        ]
        
        original_array = None
        for path in possible_paths:
            if os.path.exists(path):
                original_img = Image.open(path).convert('RGB')
                original_array = np.array(original_img)
                print(f"원본 이미지 로드: {path}")
                break
        
        if original_array is None:
            print(f"원본 이미지를 찾을 수 없습니다: {image_name}")
            print("흰색 배경을 사용합니다.")
            original_array = np.ones((image_height, image_width, 3), dtype=np.uint8) * 255
    
    # 원본 이미지 크기 조정 (필요한 경우)
    if original_array.shape[:2] != (image_height, image_width):
        original_img = Image.fromarray(original_array).resize((image_width, image_height))
        original_array = np.array(original_img)
    
    # 마스크 생성
    mask_overlay = np.zeros((image_height, image_width, 3), dtype=np.uint8)
    
    # 각 annotation 처리
    annotations = coco_data['annotations']
    colors = plt.cm.tab20(np.linspace(0, 1, len(annotations)))
    
    for i, ann in enumerate(annotations):
        # RLE 마스크 디코딩
        rle_data = ann['segmentation']
        mask = decode_rle_mask(rle_data, image_height, image_width)
        color = (colors[i][:3] * 255).astype(np.uint8)
        mask_overlay[mask > 0] = color
    
    # 오버레이 적용 (투명도 적용)
    # 마스크가 있는 부분만 블렌딩
    mask_exists = np.any(mask_overlay > 0, axis=2)
    blended = original_array.copy()
    blended[mask_exists] = (original_array[mask_exists] * (1 - alpha) + 
                           mask_overlay[mask_exists] * alpha).astype(np.uint8)
    
    # 이미지 저장
    Image.fromarray(blended).save(output_path)
    
    print(f"오버레이 이미지 저장됨: {output_path}")
    print(f"총 {len(annotations)}개의 객체가 감지되었습니다.")
    print(f"투명도: {alpha}")

def main():
    parser = argparse.ArgumentParser(description='COCO RLE 형식을 오버레이 이미지로 변환')
    parser.add_argument('--input', '-i', required=True, help='COCO JSON 파일 경로')
    parser.add_argument('--output', '-o', default='overlay_mask.png', help='출력 이미지 경로')
    parser.add_argument('--original', help='원본 이미지 경로')
    parser.add_argument('--alpha', type=float, default=0.5, help='오버레이 투명도 (0-1)')
    
    args = parser.parse_args()
    
    # COCO 데이터 로드
    coco_data = load_coco_annotations(args.input)
    
    # 오버레이 이미지 생성
    create_overlay_image(coco_data, args.output, args.original, args.alpha)

if __name__ == "__main__":
    # 스크립트가 직접 실행될 때의 기본 동작
    if len(os.sys.argv) == 1:
        # 기본 파일 경로 사용
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, 'sam_coco_format.json')
        output_path = os.path.join(current_dir, 'overlay_mask.png')
        
        if os.path.exists(json_path):
            coco_data = load_coco_annotations(json_path)
            create_overlay_image(coco_data, output_path, alpha=0.5)
        else:
            print(f"JSON 파일을 찾을 수 없습니다: {json_path}")
    else:
        main()
