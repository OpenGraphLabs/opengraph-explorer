import json
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from pycocotools import mask as coco_mask
import os
from typing import Dict, Any
import argparse
import cv2

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

def create_overlay_image(coco_data: Dict[str, Any], output_path: str, original_image_path: str = None, alpha: float = 0.5, line_only: bool = False):
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
    if line_only:
        # 라인 모드: 원본 이미지 복사
        result_array = original_array.copy()
    else:
        # 기존 마스크 모드
        mask_overlay = np.zeros((image_height, image_width, 3), dtype=np.uint8)
    
    # 각 annotation 처리
    annotations = coco_data['annotations']
    colors = plt.cm.tab20(np.linspace(0, 1, len(annotations)))
    
    for i, ann in enumerate(annotations):
        # RLE 마스크 디코딩
        rle_data = ann['segmentation']
        mask = decode_rle_mask(rle_data, image_height, image_width)
        color = (colors[i][:3] * 255).astype(np.uint8)
        
        if line_only:
            # contour line만 그리기
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            # BGR 순서로 변환하고 tuple로 변환
            bgr_color = tuple(int(c) for c in color[::-1])
            cv2.drawContours(result_array, contours, -1, bgr_color, 2)
        else:
            # 기존 방식: 마스크 전체 색칠
            mask_overlay[mask > 0] = color
    
    if line_only:
        # 라인 모드: 이미 result_array에 그려져 있음
        blended = result_array
    else:
        # 기존 마스크 모드: 오버레이 적용 (투명도 적용)
        mask_exists = np.any(mask_overlay > 0, axis=2)
        blended = original_array.copy()
        blended[mask_exists] = (original_array[mask_exists] * (1 - alpha) + 
                               mask_overlay[mask_exists] * alpha).astype(np.uint8)
    
    # 이미지 저장
    Image.fromarray(blended).save(output_path)
    
    mode_text = "contour lines" if line_only else "filled masks"
    print(f"오버레이 이미지 저장됨: {output_path}")
    print(f"총 {len(annotations)}개의 객체가 감지되었습니다.")
    print(f"렌더링 모드: {mode_text}")
    if not line_only:
        print(f"투명도: {alpha}")

def main():
    parser = argparse.ArgumentParser(description='COCO RLE 형식을 오버레이 이미지로 변환')
    parser.add_argument('--input', '-i', required=True, help='COCO JSON 파일 경로 또는 디렉토리 경로')
    parser.add_argument('--output', '-o', help='출력 이미지 경로 (미지정시 자동 생성: .json -> .png)')
    parser.add_argument('--original', help='원본 이미지 경로')
    parser.add_argument('--alpha', type=float, default=0.5, help='오버레이 투명도 (0-1)')
    parser.add_argument('--line', action='store_true', help='contour line만 그리기 (기본값: False)')
    
    args = parser.parse_args()
    
    # input이 디렉토리인지 파일인지 확인
    if os.path.isdir(args.input):
        # 디렉토리인 경우 JSON 파일 찾기
        json_files = [f for f in os.listdir(args.input) if f.endswith('.json')]
        if not json_files:
            print(f"디렉토리에 JSON 파일이 없습니다: {args.input}")
            return
        
        json_filename = json_files[0]
        
        json_path = os.path.join(args.input, json_filename)
        
        # output이 지정되지 않은 경우 자동 생성
        if args.output is None:
            output_filename = json_filename.replace('.json', '.png')
            output_path = os.path.join(args.input, output_filename)
        else:
            output_path = args.output
            
        print(f"디렉토리에서 JSON 파일 사용: {json_filename}")
    else:
        # 파일인 경우
        json_path = args.input
        
        # output이 지정되지 않은 경우 자동 생성
        if args.output is None:
            output_path = json_path.replace('.json', '.png')
        else:
            output_path = args.output
    
    # COCO 데이터 로드
    coco_data = load_coco_annotations(json_path)
    
    # 오버레이 이미지 생성
    create_overlay_image(coco_data, output_path, args.original, args.alpha, args.line)

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
