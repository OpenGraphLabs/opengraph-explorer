import json
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from pycocotools import mask as coco_mask
import os
from typing import Dict, Any, List, Tuple
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

def create_parent_child_coco_data(coco_data: Dict[str, Any], parent_id: int, child_id: int) -> Dict[str, Any]:
    """parent와 child annotation만 포함하는 새로운 COCO 데이터를 생성합니다."""
    # 기본 구조 복사
    new_coco_data = {
        'info': coco_data['info'].copy(),
        'licenses': coco_data['licenses'].copy() if 'licenses' in coco_data else [],
        'categories': coco_data['categories'].copy(),
        'images': coco_data['images'].copy(),
        'annotations': []
    }
    
    # parent와 child annotation 찾기
    for ann in coco_data['annotations']:
        if ann['id'] == parent_id or ann['id'] == child_id:
            new_coco_data['annotations'].append(ann.copy())
    
    return new_coco_data

def extract_parent_child_images(json_path: str, output_dir: str = None, alpha: float = 0.5, line_only: bool = False, base_path: str = None):
    """parent-child 관계별로 개별 이미지를 생성합니다."""
    
    # JSON 파일명에서 .json 제거
    json_filename = os.path.basename(json_path)
    name = json_filename.replace('.json', '')
    
    # 출력 디렉토리 설정
    if output_dir is None:
        current_dir = os.path.dirname(os.path.abspath(json_path))
        output_dir = os.path.join(current_dir, name)
    else:
        # output_dir가 지정된 경우 그 안에 name 디렉토리 생성
        output_dir = os.path.join(output_dir, name)
    
    # 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # COCO 데이터 로드
    coco_data = load_coco_annotations(json_path)
    
    # relationships 확인
    if 'relationships' not in coco_data:
        print("relationships 데이터가 없습니다.")
        return
    
    # parent-child pairs 추출
    parent_child_pairs = coco_data['relationships'].get('parent_child_pairs', [])
    
    if not parent_child_pairs:
        print("parent_child_pairs가 없습니다.")
        return
    
    print(f"총 {len(parent_child_pairs)}개의 parent-child 관계를 찾았습니다.")
    print(f"출력 디렉토리: {output_dir}")
    
    # 원본 이미지 경로 찾기
    image_info = coco_data['images'][0]
    original_image_name = image_info['file_name']
    
    # base_path가 제공된 경우 사용
    if base_path:
        original_image_path = os.path.join(base_path, original_image_name)
        if os.path.exists(original_image_path):
            print(f"원본 이미지 찾음: {original_image_path}")
        else:
            print(f"원본 이미지를 찾을 수 없습니다: {original_image_path}")
            original_image_path = None
    else:
        # 기존 로직 (하위 호환성)
        current_dir = os.path.dirname(os.path.abspath(json_path))
        possible_image_paths = [
            os.path.join(current_dir, original_image_name),
            os.path.join(current_dir, '..', 'images', original_image_name),
            os.path.join(current_dir, 'images', original_image_name),
        ]
        
        original_image_path = None
        for path in possible_image_paths:
            if os.path.exists(path):
                original_image_path = path
                print(f"원본 이미지 찾음: {path}")
                break
        
        if original_image_path is None:
            print(f"원본 이미지를 찾을 수 없습니다: {original_image_name}")
            print("가능한 경로들:")
            for path in possible_image_paths:
                print(f"  - {path}")
    
    # 각 parent-child pair에 대해 이미지 생성
    for i, pair in enumerate(parent_child_pairs):
        parent_id = pair['parent_id']
        child_id = pair['child_id']
        
        # parent-child만 포함하는 COCO 데이터 생성
        pair_coco_data = create_parent_child_coco_data(coco_data, parent_id, child_id)
        
        # 출력 파일명 생성
        output_filename = f"parent_{parent_id}_child_{child_id}.png"
        output_path = os.path.join(output_dir, output_filename)
        
        # 이미지 생성
        try:
            create_overlay_image(pair_coco_data, output_path, original_image_path, alpha, line_only)
            print(f"[{i+1}/{len(parent_child_pairs)}] 생성 완료: {output_filename}")
        except Exception as e:
            print(f"[{i+1}/{len(parent_child_pairs)}] 생성 실패: {output_filename} - {e}")
    
    print(f"\n모든 parent-child 이미지가 {output_dir}에 저장되었습니다.")

def draw_dashed_contour(image, contour, color, thickness=2, dash_length=10):
    """점선으로 윤곽선을 그립니다."""
    if len(contour) < 2:
        return
    
    # contour를 단순화하여 주요 점들만 추출
    epsilon = 0.02 * cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, epsilon, True)
    
    points = approx.reshape(-1, 2)
    
    for i in range(len(points)):
        pt1 = tuple(points[i])
        pt2 = tuple(points[(i + 1) % len(points)])
        
        # 두 점 사이의 거리 계산
        dist = np.sqrt((pt2[0] - pt1[0])**2 + (pt2[1] - pt1[1])**2)
        
        if dist > 0:
            # 점선 그리기
            num_dashes = int(dist / dash_length)
            if num_dashes > 0:
                for j in range(0, num_dashes, 2):  # 2칸씩 건너뛰어 점선 효과
                    start_ratio = j / num_dashes
                    end_ratio = min((j + 1) / num_dashes, 1.0)
                    
                    start_point = (
                        int(pt1[0] + (pt2[0] - pt1[0]) * start_ratio),
                        int(pt1[1] + (pt2[1] - pt1[1]) * start_ratio)
                    )
                    end_point = (
                        int(pt1[0] + (pt2[0] - pt1[0]) * end_ratio),
                        int(pt1[1] + (pt2[1] - pt1[1]) * end_ratio)
                    )
                    
                    cv2.line(image, start_point, end_point, color, thickness)

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
    
    # parent-child 관계에서 parent와 child 구분
    if len(annotations) == 2:
        # parent-child pair인 경우
        parent_ann = None
        child_ann = None
        
        # parent_id와 child_id를 찾기 위해 annotations을 확인
        for ann in annotations:
            if 'parent_id' in ann and ann['parent_id'] is None:
                parent_ann = ann
            else:
                child_ann = ann
        
        # 만약 parent_id 정보가 없다면 첫 번째를 parent로 가정
        if parent_ann is None and child_ann is None:
            parent_ann = annotations[0]
            child_ann = annotations[1]
        elif parent_ann is None:
            parent_ann = annotations[0] if annotations[0] != child_ann else annotations[1]
        elif child_ann is None:
            child_ann = annotations[1] if annotations[1] != parent_ann else annotations[0]
        
        # Parent 처리 (빨간색 실선)
        if parent_ann:
            rle_data = parent_ann['segmentation']
            mask = decode_rle_mask(rle_data, image_height, image_width)
            
            if line_only:
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                # 빨간색 (RGB 순서로 수정)
                red_color = (255, 0, 0)
                cv2.drawContours(result_array, contours, -1, red_color, 3)
            else:
                # 빨간색으로 마스크 채우기
                red_color = np.array([255, 0, 0])
                mask_overlay[mask > 0] = red_color
        
        # Child 처리 (검정색 점선)
        if child_ann:
            rle_data = child_ann['segmentation']
            mask = decode_rle_mask(rle_data, image_height, image_width)
            
            if line_only:
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                # 검정색 점선 (RGB 순서)
                black_color = (0, 0, 0)
                for contour in contours:
                    draw_dashed_contour(result_array, contour, black_color, thickness=2)
            else:
                # 검정색으로 마스크 채우기
                black_color = np.array([0, 0, 0])
                mask_overlay[mask > 0] = black_color
    else:
        # 일반적인 경우 (기존 로직)
        colors = plt.cm.tab20(np.linspace(0, 1, len(annotations)))
        
        for i, ann in enumerate(annotations):
            # RLE 마스크 디코딩
            rle_data = ann['segmentation']
            mask = decode_rle_mask(rle_data, image_height, image_width)
            color = (colors[i][:3] * 255).astype(np.uint8)
            
            if line_only:
                # contour line만 그리기
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                # RGB 순서 유지
                rgb_color = tuple(int(c) for c in color)
                cv2.drawContours(result_array, contours, -1, rgb_color, 2)
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
    if line_only and len(annotations) == 2:
        print(f"Parent-Child 윤곽선 저장됨: {output_path} (Parent: 빨간색 실선, Child: 검정색 점선)")
    else:
        print(f"오버레이 이미지 저장됨: {output_path}")
    print(f"총 {len(annotations)}개의 객체가 감지되었습니다.")
    print(f"렌더링 모드: {mode_text}")
    if not line_only:
        print(f"투명도: {alpha}")

def process_directory_recursively(input_dir: str, output_dir: str, base_path: str = None, alpha: float = 0.5, line_only: bool = False):
    """디렉토리를 재귀적으로 순회하여 모든 JSON 파일을 처리합니다."""
    
    # input 디렉토리의 마지막 폴더명 추출
    input_basename = os.path.basename(input_dir.rstrip('/'))
    
    # output 디렉토리 생성 (input 마지막 폴더명으로 하위 디렉토리 생성)
    final_output_dir = os.path.join(output_dir, input_basename)
    os.makedirs(final_output_dir, exist_ok=True)
    
    print(f"입력 디렉토리: {input_dir}")
    print(f"출력 디렉토리: {final_output_dir}")
    if base_path:
        print(f"기본 이미지 경로: {base_path}")
    
    # 모든 JSON 파일 찾기
    json_files = []
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.endswith('.json'):
                json_files.append(os.path.join(root, file))
    
    if not json_files:
        print(f"입력 디렉토리에서 JSON 파일을 찾을 수 없습니다: {input_dir}")
        return
    
    print(f"총 {len(json_files)}개의 JSON 파일을 찾았습니다.")
    
    # 각 JSON 파일 처리
    for i, json_path in enumerate(json_files):
        print(f"\n[{i+1}/{len(json_files)}] 처리 중: {json_path}")
        
        try:
            # COCO 데이터 로드
            coco_data = load_coco_annotations(json_path)
            
            # 원본 이미지 경로 생성
            if base_path and len(coco_data['images']) > 0:
                image_info = coco_data['images'][0]
                original_image_name = image_info['file_name']
                original_image_path = os.path.join(base_path, original_image_name)
                
                if not os.path.exists(original_image_path):
                    print(f"경고: 원본 이미지를 찾을 수 없습니다: {original_image_path}")
                    original_image_path = None
            else:
                original_image_path = None
            
            # 출력 파일명 생성 (상대 경로 구조 유지)
            rel_path = os.path.relpath(json_path, input_dir)
            output_filename = rel_path.replace('.json', '.png')
            output_path = os.path.join(final_output_dir, output_filename)
            
            # 출력 디렉토리 생성
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # 오버레이 이미지 생성
            create_overlay_image(coco_data, output_path, original_image_path, alpha, line_only)
            
        except Exception as e:
            print(f"오류 발생: {json_path} - {e}")
    
    print(f"\n모든 처리가 완료되었습니다. 결과는 {final_output_dir}에 저장되었습니다.")

def main():
    parser = argparse.ArgumentParser(description='COCO RLE 형식을 오버레이 이미지로 변환')
    parser.add_argument('--input', '-i', required=True, help='COCO JSON 파일 경로 또는 디렉토리 경로')
    parser.add_argument('--output', '-o', help='출력 디렉토리 경로')
    parser.add_argument('--original', help='원본 이미지 경로 (단일 파일 처리시)')
    parser.add_argument('--base', help='원본 이미지들의 기본 경로 (디렉토리 처리시)')
    parser.add_argument('--alpha', type=float, default=0.5, help='오버레이 투명도 (0-1)')
    parser.add_argument('--line', action='store_true', help='contour line만 그리기 (기본값: False)')
    parser.add_argument('--extract-relations', action='store_true', help='parent-child 관계별로 개별 이미지 생성')
    parser.add_argument('--output-dir', help='parent-child 이미지들을 저장할 디렉토리')
    
    args = parser.parse_args()
    
    # parent-child 관계 추출 모드
    if args.extract_relations:
        extract_parent_child_images(args.input, args.output_dir, args.alpha, args.line, args.base)
        return
    
    # input이 디렉토리인지 파일인지 확인
    if os.path.isdir(args.input):
        # 디렉토리인 경우 재귀적으로 처리
        if args.output is None:
            args.output = './results'
        
        process_directory_recursively(args.input, args.output, args.base, args.alpha, args.line)
    else:
        # 파일인 경우 기존 로직
        json_path = args.input
        
        # output이 지정되지 않은 경우 자동 생성
        if args.output is None:
            output_filename = os.path.basename(json_path).replace('.json', '.png')
            results_dir = './results'
            os.makedirs(results_dir, exist_ok=True)
            output_path = os.path.join(results_dir, output_filename)
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
