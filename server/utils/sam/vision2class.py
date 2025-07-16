import json
import cv2
import numpy as np
from PIL import Image
import torch
from transformers import pipeline, AutoProcessor, AutoModelForVision2Seq
import os
import re

# 이미지 경로 설정
image_path = "000000000139.jpg"

def detect_classes_with_multiple_models(image_path):
    """
    여러 VLM 모델을 사용하여 이미지에서 보이는 클래스들을 감지하고 
    일관된 JSON 형태로 반환합니다.
    """
    try:
        # 이미지가 존재하는지 확인
        if not os.path.exists(image_path):
            return {"class": []}
        
        # 이미지 로드
        image = Image.open(image_path)
        
        all_classes = []
        
        # 모델 1: BLIP Base
        try:
            print("=== BLIP Base 모델 실행 중 ===")
            from transformers import BlipProcessor, BlipForConditionalGeneration
            
            processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
            model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
            
            device = "cuda" if torch.cuda.is_available() else "cpu"
            model = model.to(device)
            
            inputs = processor(images=image, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            out = model.generate(**inputs, max_length=100)
            caption = processor.decode(out[0], skip_special_tokens=True)
            
            print(f"BLIP Base 캡션: {caption}")
            classes = extract_classes_from_caption(caption)
            print(f"BLIP Base 클래스: {classes}")
            all_classes.extend(classes)
            
        except Exception as e:
            print(f"BLIP Base 실패: {e}")
        
        # 모델 2: BLIP Large
        try:
            print("\n=== BLIP Large 모델 실행 중 ===")
            from transformers import BlipProcessor, BlipForConditionalGeneration
            
            processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
            model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")
            
            device = "cuda" if torch.cuda.is_available() else "cpu"
            model = model.to(device)
            
            inputs = processor(images=image, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            out = model.generate(**inputs, max_length=100)
            caption = processor.decode(out[0], skip_special_tokens=True)
            
            print(f"BLIP Large 캡션: {caption}")
            classes = extract_classes_from_caption(caption)
            print(f"BLIP Large 클래스: {classes}")
            all_classes.extend(classes)
            
        except Exception as e:
            print(f"BLIP Large 실패: {e}")
        
        # 모델 3: GIT Base
        try:
            print("\n=== GIT Base 모델 실행 중 ===")
            from transformers import GitProcessor, GitForCausalLM
            
            processor = GitProcessor.from_pretrained("microsoft/git-base")
            model = GitForCausalLM.from_pretrained("microsoft/git-base")
            
            device = "cuda" if torch.cuda.is_available() else "cpu"
            model = model.to(device)
            
            inputs = processor(images=image, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            out = model.generate(**inputs, max_length=100)
            caption = processor.decode(out[0], skip_special_tokens=True)
            
            print(f"GIT Base 캡션: {caption}")
            classes = extract_classes_from_caption(caption)
            print(f"GIT Base 클래스: {classes}")
            all_classes.extend(classes)
            
        except Exception as e:
            print(f"GIT Base 실패: {e}")
        
        # 모델 4: ResNet 이미지 분류
        try:
            print("\n=== ResNet 이미지 분류 실행 중 ===")
            classifier = pipeline("image-classification", 
                                model="microsoft/resnet-50", 
                                top_k=10)
            
            results = classifier(image)
            print(f"ResNet 분류 결과: {results}")
            
            detected_classes = []
            for result in results:
                class_name = result['label'].replace('_', ' ').title()
                detected_classes.append(class_name)
            
            print(f"ResNet 클래스: {detected_classes}")
            all_classes.extend(detected_classes)
            
        except Exception as e:
            print(f"ResNet 실패: {e}")
        
        # 모델 5: ViT 이미지 분류
        try:
            print("\n=== ViT 이미지 분류 실행 중 ===")
            classifier = pipeline("image-classification", 
                                model="google/vit-base-patch16-224", 
                                top_k=10)
            
            results = classifier(image)
            print(f"ViT 분류 결과: {results}")
            
            detected_classes = []
            for result in results:
                class_name = result['label'].replace('_', ' ').title()
                detected_classes.append(class_name)
            
            print(f"ViT 클래스: {detected_classes}")
            all_classes.extend(detected_classes)
            
        except Exception as e:
            print(f"ViT 실패: {e}")
        
        # 중복 제거 및 정렬
        unique_classes = list(set(all_classes))
        unique_classes.sort()
        
        print(f"\n=== 최종 통합 클래스: {unique_classes} ===")
        
        return {"class": unique_classes}
        
    except Exception as e:
        print(f"전체 처리 중 오류 발생: {e}")
        return {"class": []}

def extract_classes_from_caption(caption):
    """
    이미지 캡션에서 클래스명들을 추출합니다.
    """
    classes = []
    
    # 캡션을 소문자로 변환
    caption_lower = caption.lower()
    
    # 확장된 객체 패턴 매칭
    patterns = [
        r'\b(person|people|man|woman|child|boy|girl|human)\b',
        r'\b(car|vehicle|truck|bus|motorcycle|bicycle|auto)\b',
        r'\b(building|house|skyscraper|office|shop|store|home|room)\b',
        r'\b(tree|plant|flower|grass|forest|park|garden)\b',
        r'\b(road|street|highway|sidewalk|path|lane)\b',
        r'\b(sky|cloud|sun|moon|star|weather)\b',
        r'\b(water|river|lake|ocean|sea|pool)\b',
        r'\b(animal|dog|cat|bird|fish|horse|pet)\b',
        r'\b(chair|table|bed|sofa|desk|couch|furniture)\b',
        r'\b(phone|computer|laptop|tv|screen|television|monitor)\b',
        r'\b(book|paper|pen|pencil|document)\b',
        r'\b(food|fruit|vegetable|bread|meat|dish)\b',
        r'\b(clothing|shirt|pants|dress|shoes|hat|jacket)\b',
        r'\b(fireplace|fire|heater|stove)\b',
        r'\b(lamp|light|bulb|chandelier)\b',
        r'\b(window|door|wall|floor|ceiling)\b',
        r'\b(picture|photo|painting|art|frame)\b',
        r'\b(cup|glass|bottle|container)\b',
        r'\b(clock|watch|time)\b',
        r'\b(mirror|reflection)\b'
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, caption_lower)
        for match in matches:
            if match not in [c.lower() for c in classes]:
                classes.append(match.title())
    
    return classes[:15]  # 더 많은 클래스 허용

def detect_classes_simple_vlm(image_path):
    """
    간단한 VLM 스타일 접근법으로 이미지에서 클래스들을 추정합니다.
    """
    try:
        if not os.path.exists(image_path):
            return {"class": []}
        
        # 이미지 로드
        image = cv2.imread(image_path)
        if image is None:
            return {"class": []}
        
        # 이미지 분석
        height, width = image.shape[:2]
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        classes = []
        
        # 색상 기반 객체 추정
        # 하늘 (파란색)
        blue_mask = cv2.inRange(hsv, (100, 50, 50), (130, 255, 255))
        blue_ratio = np.sum(blue_mask > 0) / (height * width)
        if blue_ratio > 0.3:
            classes.append("Sky")
        
        # 자연 요소 (녹색)
        green_mask = cv2.inRange(hsv, (40, 40, 40), (80, 255, 255))
        green_ratio = np.sum(green_mask > 0) / (height * width)
        if green_ratio > 0.2:
            classes.append("Tree")
            classes.append("Grass")
        
        # 사람 (피부색)
        skin_mask = cv2.inRange(hsv, (0, 20, 70), (20, 255, 255))
        skin_ratio = np.sum(skin_mask > 0) / (height * width)
        if skin_ratio > 0.05:
            classes.append("Person")
        
        # 건물 (회색, 갈색)
        gray_mask = cv2.inRange(hsv, (0, 0, 50), (180, 30, 200))
        gray_ratio = np.sum(gray_mask > 0) / (height * width)
        if gray_ratio > 0.3:
            classes.append("Building")
        
        # 도로 (어두운 회색)
        dark_mask = cv2.inRange(hsv, (0, 0, 0), (180, 255, 100))
        dark_ratio = np.sum(dark_mask > 0) / (height * width)
        if dark_ratio > 0.2:
            classes.append("Road")
        
        # 기본 클래스
        if not classes:
            classes = ["Object", "Background"]
        
        return {"class": classes}
        
    except Exception as e:
        print(f"간단한 VLM 분석 중 오류: {e}")
        return {"class": []}

# 메인 실행 함수
def main():
    print("여러 VLM 모델을 사용하여 이미지에서 클래스 감지 중...")
    
    # 여러 모델을 사용한 감지
    result = detect_classes_with_multiple_models(image_path)
    
    # 결과 출력
    print(f"\n최종 결과:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 결과를 파일로 저장
    output_file = image_path.replace('.jpg', '_multi_vlm_classes.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"결과가 {output_file}에 저장되었습니다.")

if __name__ == "__main__":
    main()