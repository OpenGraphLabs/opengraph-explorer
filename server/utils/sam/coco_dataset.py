import os
import urllib.request
import zipfile
from typing import Optional, List
import shutil
from pathlib import Path

class COCODatasetDownloader:
    """COCO 2017 데이터셋을 다운로드하고 관리하는 클래스"""
    
    def __init__(self, base_path: str = "./test"):
        """
        Args:
            base_path: 데이터셋을 저장할 기본 경로 (기본값: ./test)
        """
        self.base_path = Path(base_path)
        self.coco_path = self.base_path / "coco2017"
        
        # COCO 2017 다운로드 URL들
        self.urls = {
            "train_images": "http://images.cocodataset.org/zips/train2017.zip",
            "val_images": "http://images.cocodataset.org/zips/val2017.zip", 
            "test_images": "http://images.cocodataset.org/zips/test2017.zip",
            "annotations": "http://images.cocodataset.org/annotations/annotations_trainval2017.zip"
        }
        
        # 파일 크기 정보 (참고용)
        self.file_sizes = {
            "train_images": "~19GB",
            "val_images": "~1GB",
            "test_images": "~6GB", 
            "annotations": "~241MB"
        }

    def create_directories(self):
        """필요한 디렉토리 구조 생성"""
        directories = [
            self.coco_path,
            self.coco_path / "images",
            self.coco_path / "annotations",
            self.coco_path / "downloads"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"✓ 디렉토리 생성: {directory}")

    def download_file(self, url: str, filepath: Path, description: str = ""):
        """파일을 다운로드하고 진행률을 표시"""
        print(f"\n📥 다운로드 시작: {description}")
        print(f"URL: {url}")
        print(f"저장 경로: {filepath}")
        
        def progress_hook(count, block_size, total_size):
            if total_size > 0:
                percent = min(100, (count * block_size * 100) // total_size)
                downloaded = count * block_size
                total_mb = total_size / (1024 * 1024)
                downloaded_mb = downloaded / (1024 * 1024)
                print(f"\r진행률: {percent:3d}% ({downloaded_mb:.1f}MB / {total_mb:.1f}MB)", end="")
        
        try:
            urllib.request.urlretrieve(url, filepath, progress_hook)
            print(f"\n✓ 다운로드 완료: {filepath.name}")
            return True
        except Exception as e:
            print(f"\n❌ 다운로드 실패: {e}")
            return False

    def extract_zip(self, zip_path: Path, extract_to: Path):
        """ZIP 파일을 압축 해제"""
        print(f"\n📂 압축 해제 중: {zip_path.name}")
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_to)
            print(f"✓ 압축 해제 완료: {extract_to}")
            return True
        except Exception as e:
            print(f"❌ 압축 해제 실패: {e}")
            return False

    def download_dataset(self, 
                        include_train: bool = True,
                        include_val: bool = True, 
                        include_test: bool = False,
                        include_annotations: bool = True,
                        keep_zip_files: bool = False):
        """
        COCO 2017 데이터셋 다운로드
        
        Args:
            include_train: 훈련 이미지 다운로드 여부
            include_val: 검증 이미지 다운로드 여부  
            include_test: 테스트 이미지 다운로드 여부
            include_annotations: 어노테이션 다운로드 여부
            keep_zip_files: ZIP 파일 보관 여부
        """
        print("🚀 COCO 2017 데이터셋 다운로드를 시작합니다!")
        print(f"저장 경로: {self.coco_path.absolute()}")
        
        # 디렉토리 생성
        self.create_directories()
        
        downloads = []
        if include_train:
            downloads.append(("train_images", "훈련 이미지"))
        if include_val:
            downloads.append(("val_images", "검증 이미지"))
        if include_test:
            downloads.append(("test_images", "테스트 이미지"))
        if include_annotations:
            downloads.append(("annotations", "어노테이션"))
        
        print(f"\n📋 다운로드 예정 항목: {len(downloads)}개")
        for key, desc in downloads:
            print(f"  - {desc} ({self.file_sizes[key]})")
        
        # 다운로드 및 압축 해제
        for key, description in downloads:
            url = self.urls[key]
            filename = url.split('/')[-1]
            zip_path = self.coco_path / "downloads" / filename
            
            # 이미 다운로드된 파일이 있는지 확인
            if zip_path.exists():
                print(f"\n⚠️  파일이 이미 존재합니다: {filename}")
                response = input("다시 다운로드하시겠습니까? (y/N): ").lower()
                if response != 'y':
                    print("⏭️  다운로드를 건너뜁니다.")
                    continue
            
            # 다운로드
            if self.download_file(url, zip_path, f"{description} ({self.file_sizes[key]})"):
                
                # 압축 해제
                if key == "annotations":
                    extract_to = self.coco_path
                else:
                    extract_to = self.coco_path / "images"
                
                if self.extract_zip(zip_path, extract_to):
                    # ZIP 파일 삭제 (옵션)
                    if not keep_zip_files:
                        zip_path.unlink()
                        print(f"🗑️  ZIP 파일 삭제: {filename}")
                else:
                    print(f"❌ {description} 압축 해제에 실패했습니다.")
            else:
                print(f"❌ {description} 다운로드에 실패했습니다.")
        
        self.print_dataset_info()

    def print_dataset_info(self):
        """다운로드된 데이터셋 정보 출력"""
        print("\n" + "="*50)
        print("📊 COCO 2017 데이터셋 정보")
        print("="*50)
        
        images_path = self.coco_path / "images"
        annotations_path = self.coco_path / "annotations"
        
        # 이미지 폴더 확인
        for folder_name in ["train2017", "val2017", "test2017"]:
            folder_path = images_path / folder_name
            if folder_path.exists():
                image_count = len(list(folder_path.glob("*.jpg")))
                print(f"📁 {folder_name}: {image_count:,}개 이미지")
        
        # 어노테이션 파일 확인  
        if annotations_path.exists():
            annotation_files = list(annotations_path.glob("*.json"))
            print(f"📝 어노테이션 파일: {len(annotation_files)}개")
            for file in annotation_files:
                file_size = file.stat().st_size / (1024 * 1024)  # MB
                print(f"   - {file.name} ({file_size:.1f}MB)")
        
        total_size = self._get_folder_size(self.coco_path)
        print(f"\n💾 총 데이터셋 크기: {total_size:.1f}GB")
        print(f"📍 데이터셋 경로: {self.coco_path.absolute()}")

    def _get_folder_size(self, folder_path: Path) -> float:
        """폴더의 총 크기를 GB 단위로 반환"""
        total_size = 0
        for file_path in folder_path.rglob("*"):
            if file_path.is_file():
                total_size += file_path.stat().st_size
        return total_size / (1024 ** 3)  # GB

    def cleanup_downloads(self):
        """다운로드 폴더의 ZIP 파일들을 정리"""
        downloads_path = self.coco_path / "downloads"
        if downloads_path.exists():
            zip_files = list(downloads_path.glob("*.zip"))
            for zip_file in zip_files:
                zip_file.unlink()
                print(f"🗑️  삭제: {zip_file.name}")
            print(f"✓ {len(zip_files)}개 ZIP 파일을 정리했습니다.")

def main():
    """메인 실행 함수"""
    print("🎯 COCO 2017 데이터셋 다운로더")
    print("=" * 40)
    
    # 다운로더 초기화
    downloader = COCODatasetDownloader("./test")
    
    # 사용자 입력
    print("\n다운로드할 항목을 선택하세요:")
    print("1. 훈련 이미지 (~19GB)")
    print("2. 검증 이미지 (~1GB)")  
    print("3. 테스트 이미지 (~6GB)")
    print("4. 어노테이션 (~241MB)")
    print("5. 모두 다운로드")
    print("6. 기본 설정 (훈련 + 검증 + 어노테이션)")
    
    choice = input("\n선택 (1-6): ").strip()
    
    if choice == "1":
        downloader.download_dataset(True, False, False, False)
    elif choice == "2":
        downloader.download_dataset(False, True, False, False)
    elif choice == "3":
        downloader.download_dataset(False, False, True, False)
    elif choice == "4":
        downloader.download_dataset(False, False, False, True)
    elif choice == "5":
        downloader.download_dataset(True, True, True, True)
    elif choice == "6":
        downloader.download_dataset(True, True, False, True)
    else:
        print("❌ 잘못된 선택입니다. 기본 설정으로 진행합니다.")
        downloader.download_dataset(True, True, False, True)

if __name__ == "__main__":
    main()
