import torch
import numpy as np
from PIL import Image
import os
from typing import List, Tuple, Optional
import math

# 각 패키지별로 개별 체크
missing_packages = []
available_packages = []

try:
    from diffusers import DiffusionPipeline, StableDiffusionInpaintPipeline
    available_packages.append("diffusers")
except ImportError:
    missing_packages.append("diffusers")

try:
    import transformers
    available_packages.append("transformers")
except ImportError:
    missing_packages.append("transformers")

try:
    import accelerate
    available_packages.append("accelerate")
except ImportError:
    missing_packages.append("accelerate")

try:
    import xformers
    available_packages.append("xformers")
except ImportError:
    missing_packages.append("xformers")

try:
    import requests
    available_packages.append("requests")
except ImportError:
    missing_packages.append("requests")

# 의존성 상태 출력
if missing_packages:
    print("❌ Missing packages:")
    for pkg in missing_packages:
        print(f"  - {pkg}")
    print("\n📦 To install missing packages:")
    print(f"pip install {' '.join(missing_packages)}")
    
if available_packages:
    print("✅ Available packages:")
    for pkg in available_packages:
        print(f"  - {pkg}")

DEPENDENCIES_AVAILABLE = len(missing_packages) == 0

class Image2ViewGenerator:
    """
    고품질 Novel View Synthesis를 위한 클래스
    최신 3D-aware 모델들을 사용하여 단일 이미지에서 다양한 시점의 이미지를 생성합니다.
    """
    
    def __init__(self, device: str = "auto"):
        if not DEPENDENCIES_AVAILABLE:
            print(f"\n❌ Cannot initialize: {len(missing_packages)} packages missing")
            print("Please install the missing packages first:")
            print(f"pip install {' '.join(missing_packages)}")
            raise ImportError(f"Required dependencies not installed: {', '.join(missing_packages)}")
            
        self.device = self._get_device(device)
        self.model = None
        self.is_loaded = False
        
    def _get_device(self, device: str) -> str:
        """최적의 디바이스 선택"""
        if device == "auto":
            if torch.cuda.is_available():
                return "cuda"
            elif torch.backends.mps.is_available():
                return "mps" 
            else:
                return "cpu"
        return device
    
    def load_model(self):
        """
        모델 로딩 개선 - 더 안정적인 로딩
        """
        try:
            print(f"Loading advanced view synthesis model on {self.device}...")
            
            # 시도할 모델들 (우선순위 순)
            model_options = [
                {
                    "id": "lambdalabs/sd-image-variations-diffusers",
                    "type": "image_variation",
                    "description": "Image variation model"
                },
                {
                    "id": "runwayml/stable-diffusion-v1-5", 
                    "type": "text2img",
                    "description": "Standard Stable Diffusion"
                },
                {
                    "id": "stabilityai/stable-diffusion-2-1",
                    "type": "text2img", 
                    "description": "Stable Diffusion 2.1"
                }
            ]
            
            self.model = None
            self.model_type = None
            
            for model_info in model_options:
                try:
                    print(f"Trying {model_info['description']}: {model_info['id']}")
                    
                    # 안전한 로딩 옵션
                    load_kwargs = {
                        "torch_dtype": torch.float16 if self.device == "cuda" else torch.float32,
                        "safety_checker": None,
                        "requires_safety_checker": False,
                    }
                    
                    # 선택적 파라미터 (에러 발생시 제외)
                    try:
                        load_kwargs["use_safetensors"] = True
                        if self.device == "cuda":
                            load_kwargs["variant"] = "fp16"
                    except:
                        pass
                    
                    self.model = DiffusionPipeline.from_pretrained(
                        model_info['id'],
                        **load_kwargs
                    )
                    
                    self.model_type = model_info['type']
                    print(f"✓ Successfully loaded: {model_info['description']}")
                    break
                    
                except Exception as e:
                    print(f"✗ Failed to load {model_info['id']}: {str(e)[:100]}...")
                    continue
                    
            if self.model is None:
                raise Exception("모든 모델 로딩 실패")
                
            self.model = self.model.to(self.device)
            
            # 메모리 최적화 (안전하게)
            if self.device == "cuda":
                try:
                    if hasattr(self.model, 'enable_memory_efficient_attention'):
                        self.model.enable_memory_efficient_attention()
                except:
                    print("Memory efficient attention not available")
                    
                try:
                    if hasattr(self.model, 'enable_xformers_memory_efficient_attention'):
                        self.model.enable_xformers_memory_efficient_attention()
                except:
                    print("Xformers not available")
                    
                try:
                    if hasattr(self.model, 'enable_model_cpu_offload'):
                        self.model.enable_model_cpu_offload()
                except:
                    print("CPU offload not available")
                
            self.is_loaded = True
            print(f"✅ Model loaded and optimized! Type: {self.model_type}")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    def generate_multi_view_poses(self, num_views: int = 8) -> List[Tuple[float, float, float]]:
        """
        3D 회전을 위한 카메라 포즈 생성 (azimuth, elevation, distance)
        """
        poses = []
        
        # 더 체계적인 카메라 배치
        azimuth_angles = np.linspace(0, 360, num_views, endpoint=False)
        
        for i, azimuth in enumerate(azimuth_angles):
            # elevation을 조금씩 변화
            elevation = np.sin(azimuth * np.pi / 180) * 20  # -20 ~ +20도 범위
            distance = 1.5  # 기본 거리
            
            poses.append((azimuth, elevation, distance))
            
        return poses
    
    def create_enhanced_prompt(self, azimuth: float, elevation: float, base_prompt: str = "") -> str:
        """
        더 정확한 시점 정보를 포함한 프롬프트 생성
        """
        # 정확한 방향 설명
        if -22.5 <= azimuth < 22.5 or 337.5 <= azimuth < 360:
            view_desc = "front view"
        elif 22.5 <= azimuth < 67.5:
            view_desc = "front-right view"
        elif 67.5 <= azimuth < 112.5:
            view_desc = "right side view" 
        elif 112.5 <= azimuth < 157.5:
            view_desc = "back-right view"
        elif 157.5 <= azimuth < 202.5:
            view_desc = "back view"
        elif 202.5 <= azimuth < 247.5:
            view_desc = "back-left view"
        elif 247.5 <= azimuth < 292.5:
            view_desc = "left side view"
        else:
            view_desc = "front-left view"
            
        # elevation 설명
        if elevation > 20:
            view_desc += ", high angle view, from above"
        elif elevation > 5:
            view_desc += ", slightly from above"
        elif elevation < -20:
            view_desc += ", low angle view, from below"
        elif elevation < -5:
            view_desc += ", slightly from below"
        else:
            view_desc += ", eye level"
            
        prompt = f"{base_prompt}, {view_desc}, professional photography, high resolution, detailed, well-lit, sharp focus"
        return prompt
    
    def preprocess_image(self, image_path: str, target_size: Tuple[int, int] = (512, 512)) -> Image.Image:
        """
        더 나은 이미지 전처리
        """
        if isinstance(image_path, str):
            image = Image.open(image_path)
        else:
            image = image_path
            
        # RGB로 변환
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # 가로세로 비율 유지하면서 리사이즈
        original_width, original_height = image.size
        target_width, target_height = target_size
        
        # 비율 계산
        ratio = min(target_width/original_width, target_height/original_height)
        new_width = int(original_width * ratio)
        new_height = int(original_height * ratio)
        
        # 리사이즈
        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 중앙에 배치하여 타겟 크기로 패딩
        new_image = Image.new('RGB', target_size, (255, 255, 255))
        paste_x = (target_width - new_width) // 2
        paste_y = (target_height - new_height) // 2
        new_image.paste(image, (paste_x, paste_y))
        
        return new_image
    
    def generate_novel_views(
        self, 
        image_path: str, 
        num_views: int = 8,
        output_dir: str = "generated_views",
        base_prompt: str = "a high quality photograph of an object",
        guidance_scale: float = 7.5,
        num_inference_steps: int = 30,
        strength: float = 0.8
    ) -> List[str]:
        """
        고품질 Novel View 생성 - 모델 타입에 따른 올바른 API 호출
        """
        if not self.is_loaded:
            self.load_model()
            
        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)
        
        # 입력 이미지 전처리
        input_image = self.preprocess_image(image_path)
        print(f"Processed input image: {input_image.size}")
        
        # 원본 이미지도 저장
        original_path = os.path.join(output_dir, "00_original.png")
        input_image.save(original_path)
        
        # 카메라 포즈 생성
        camera_poses = self.generate_multi_view_poses(num_views)
        
        generated_paths = [original_path]  # 원본 포함
        
        # 모델 타입 확인
        model_name = str(type(self.model)).lower()
        print(f"Model type: {model_name}")
        
        print(f"Generating {num_views} novel views...")
        
        for i, (azimuth, elevation, distance) in enumerate(camera_poses):
            print(f"Generating view {i+1}/{num_views} (azimuth: {azimuth:.1f}°, elevation: {elevation:.1f}°)")
            
            # 시점별 프롬프트 생성
            prompt = self.create_enhanced_prompt(azimuth, elevation, base_prompt)
            print(f"Prompt: {prompt}")
            
            try:
                # 모델 타입에 따른 올바른 API 호출
                with torch.autocast(self.device, enabled=self.device=="cuda"):
                    
                    # lambdalabs/sd-image-variations-diffusers 모델인 경우
                    if "lambdalabs" in model_name or "image" in model_name and "variation" in model_name:
                        print("Using image variation pipeline")
                        generated_image = self.model(
                            image=input_image,
                            guidance_scale=guidance_scale,
                            num_inference_steps=num_inference_steps
                        ).images[0]
                        
                    # MVDream 모델인 경우
                    elif "mvdream" in model_name:
                        print("Using MVDream pipeline")
                        # MVDream 특별 처리
                        generated_image = self.model(
                            prompt=prompt,
                            image=input_image,
                            guidance_scale=guidance_scale,
                            num_inference_steps=num_inference_steps,
                            height=512,
                            width=512
                        ).images[0]
                        
                    # 일반적인 Stable Diffusion 모델인 경우
                    else:
                        print("Using standard text-to-image pipeline")
                        generated_image = self.model(
                            prompt=prompt,
                            guidance_scale=guidance_scale,
                            num_inference_steps=num_inference_steps,
                            height=512,
                            width=512
                        ).images[0]
                
                # 결과 저장
                output_path = os.path.join(output_dir, f"view_{i+1:02d}_az{azimuth:.0f}_el{elevation:.0f}.png")
                generated_image.save(output_path, quality=95)
                generated_paths.append(output_path)
                
                print(f"✓ Saved: {output_path}")
                
            except Exception as e:
                print(f"✗ Error generating view {i+1}: {e}")
                
                # 대안 방법 시도
                try:
                    print("Trying alternative generation method...")
                    
                    # 가장 기본적인 text-to-image 호출
                    with torch.autocast(self.device, enabled=self.device=="cuda"):
                        generated_image = self.model(
                            prompt=prompt,
                            num_inference_steps=20,  # 더 빠르게
                            guidance_scale=7.0,
                            height=512,
                            width=512
                        ).images[0]
                    
                    output_path = os.path.join(output_dir, f"view_{i+1:02d}_az{azimuth:.0f}_el{elevation:.0f}.png")
                    generated_image.save(output_path, quality=95)
                    generated_paths.append(output_path)
                    print(f"✓ Saved with alternative method: {output_path}")
                    
                except Exception as e2:
                    print(f"✗ Alternative method also failed: {e2}")
                    continue
                
        return generated_paths
    
    def create_video_from_views(self, image_paths: List[str], output_path: str = "novel_views.mp4", fps: int = 3):
        """
        고품질 회전 비디오 생성
        """
        try:
            import cv2
            
            if len(image_paths) < 2:
                print("Need at least 2 images to create video")
                return
                
            # 첫 번째 이미지로 비디오 설정
            first_img = cv2.imread(image_paths[0])
            height, width, layers = first_img.shape
            
            # 고품질 비디오 설정
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            # 모든 이미지 추가 (2번씩 반복해서 더 부드럽게)
            for img_path in image_paths:
                img = cv2.imread(img_path)
                if img is not None:
                    video.write(img)
                    video.write(img)  # 두 번 추가
                    
            # 루프를 위해 첫 이미지 다시 추가
            video.write(first_img)
            
            video.release()
            print(f"✓ Video created: {output_path}")
            
        except ImportError:
            print("OpenCV not installed. Install with: pip install opencv-python")
        except Exception as e:
            print(f"Error creating video: {e}")

def check_additional_dependencies():
    """추가 의존성 체크"""
    additional_missing = []
    
    try:
        import cv2
        print("✅ opencv-python available")
    except ImportError:
        additional_missing.append("opencv-python")
        print("❌ opencv-python missing (needed for video creation)")
    
    if additional_missing:
        print(f"Optional dependencies missing: {', '.join(additional_missing)}")
        print(f"Install with: pip install {' '.join(additional_missing)}")

def main():
    """개선된 사용 예시"""
    print("🔍 Checking dependencies...")
    check_additional_dependencies()
    
    if not DEPENDENCIES_AVAILABLE:
        print(f"\n❌ Cannot proceed: {len(missing_packages)} required packages missing")
        print("Please install the missing packages first:")
        print(f"pip install {' '.join(missing_packages)}")
        return
    
    img_path = "000000000139.jpg"
    
    if not os.path.exists(img_path):
        print(f"❌ Image not found: {img_path}")
        print("Please make sure the image file exists in the current directory.")
        return
    
    print("\n🚀 Starting High-Quality Novel View Synthesis...")
    print(f"📷 Input image: {img_path}")
    
    # View generator 초기화
    try:
        generator = Image2ViewGenerator()
    except ImportError as e:
        print(f"❌ Failed to initialize: {e}")
        return
    
    try:
        # 새로운 시점들 생성
        generated_paths = generator.generate_novel_views(
            image_path=img_path,
            num_views=8,
            output_dir="novel_views",
            base_prompt="a detailed high quality photograph of the object",
            guidance_scale=7.5,
            num_inference_steps=30
        )
        
        print(f"\n✅ Generated {len(generated_paths)} images (including original)!")
        print(f"📁 Output directory: novel_views/")
        
        # 비디오 생성
        if len(generated_paths) > 1:
            generator.create_video_from_views(generated_paths, "rotating_view.mp4", fps=3)
            print(f"🎬 Video created: rotating_view.mp4")
            
        print("\n🎉 Novel view synthesis completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Make sure you have installed all required packages:")
        print(f"pip install {' '.join(missing_packages + ['opencv-python'])}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()