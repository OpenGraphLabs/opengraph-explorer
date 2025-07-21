#!/usr/bin/env python3
"""
Pre-segmented 이미지와 annotation 데이터를 데이터베이스에 로드하는 스크립트

사용법:
    python load_annotations.py --dataset-id 1 --category-id 1
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import List

# 프로젝트 루트를 sys.path에 추가
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.schemas.image import ImageCreate
from app.schemas.annotation import AnnotationCreate


async def create_image_batch(session: AsyncSession, image_data_list: List[ImageCreate]) -> List[int]:
    """이미지를 배치로 데이터베이스에 로드"""
    from app.models.image import Image
    
    db_images = []
    for image_data in image_data_list:
        db_image = Image(
            file_name=image_data.file_name,
            image_url=image_data.image_url,
            width=image_data.width,
            height=image_data.height,
            dataset_id=image_data.dataset_id
        )
        db_images.append(db_image)
    
    session.add_all(db_images)
    await session.flush()  # ID를 얻기 위해 flush
    
    return [img.id for img in db_images]


async def create_annotation_batch(session: AsyncSession, annotation_data_list: List[AnnotationCreate]):
    """annotation 데이터를 배치로 데이터베이스에 로드"""
    from app.models.annotation import Annotation
    
    db_annotations = []
    for annotation_data in annotation_data_list:
        # AUTO 타입의 경우 created_by를 None으로 설정
        created_by = None if annotation_data.source_type == "AUTO" else annotation_data.created_by
        
        db_annotation = Annotation(
            bbox=annotation_data.bbox,
            area=annotation_data.area,
            segmentation_size=annotation_data.segmentation_size,
            segmentation_counts=annotation_data.segmentation_counts,
            point_coords=annotation_data.point_coords,
            is_crowd=annotation_data.is_crowd,
            predicted_iou=annotation_data.predicted_iou,
            stability_score=annotation_data.stability_score,
            status=annotation_data.status,
            source_type=annotation_data.source_type,
            image_id=annotation_data.image_id,
            category_id=annotation_data.category_id,
            created_by=created_by
        )
        db_annotations.append(db_annotation)
    
    session.add_all(db_annotations)


def prepare_data_from_files(image_files: List[Path], annotation_files: List[Path], dataset_id: int) -> tuple:
    """파일들로부터 배치 처리용 데이터 준비"""
    image_data_list = []
    all_annotations = []
    file_to_image_mapping = {}
    
    for i, (image_file, annotation_file) in enumerate(zip(image_files, annotation_files)):
        # annotation JSON 파일 로드
        with open(annotation_file, 'r') as f:
            coco_data = json.load(f)
        
        image_info = coco_data["images"][0]
        
        # 이미지 데이터 준비
        image_data = ImageCreate(
            file_name=image_info["file_name"],
            image_url=f"https://ik.imagekit.io/opengraphv1/kitchen_images/{image_info['file_name']}",
            width=image_info["width"],
            height=image_info["height"],
            dataset_id=dataset_id
        )
        image_data_list.append(image_data)
        
        # 파일과 이미지 인덱스 매핑 저장
        file_to_image_mapping[str(annotation_file)] = i
        
        # annotation 데이터는 나중에 image_id가 필요하므로 raw 데이터만 저장
        all_annotations.append((i, coco_data["annotations"]))
    
    return image_data_list, all_annotations, file_to_image_mapping


async def process_batch(image_files: List[Path], annotation_files: List[Path], dataset_id: int):
    """배치로 이미지와 annotation 파일들을 처리"""
    async with AsyncSessionLocal() as session:
        try:
            print(f"Processing {len(image_files)} files in batch...")
            
            # 데이터 준비
            image_data_list, all_annotations, file_mapping = prepare_data_from_files(
                image_files, annotation_files, dataset_id
            )
            
            # 이미지 배치 생성
            print("Creating images...")
            image_ids = await create_image_batch(session, image_data_list)
            print(f"Created {len(image_ids)} images")
            
            # annotation 데이터 준비
            annotation_data_list = []
            total_annotations = 0
            
            for image_idx, annotations in all_annotations:
                image_id = image_ids[image_idx]
                
                for ann in annotations:
                    # segmentation 데이터 처리
                    segmentation = ann["segmentation"]
                    segmentation_size = segmentation["size"]
                    segmentation_counts = segmentation["counts"]
                    
                    # bbox 데이터
                    bbox = ann["bbox"]
                    area = ann["area"]
                    
                    annotation_data = AnnotationCreate(
                        bbox=bbox,
                        area=area,
                        segmentation_size=segmentation_size,
                        segmentation_counts=segmentation_counts,
                        point_coords=None,
                        is_crowd=bool(ann["iscrowd"]),
                        predicted_iou=None,
                        stability_score=ann.get("score"),
                        status="PENDING",
                        source_type="AUTO",
                        image_id=image_id,
                        category_id=None,
                        created_by=None
                    )
                    annotation_data_list.append(annotation_data)
                    total_annotations += 1
            
            # annotation 배치 생성
            print(f"Creating {total_annotations} annotations...")
            await create_annotation_batch(session, annotation_data_list)
            
            # 커밋
            await session.commit()
            print(f"Successfully processed {len(image_files)} files with {total_annotations} annotations")
            
        except Exception as e:
            await session.rollback()
            print(f"Error processing batch: {e}")
            raise


async def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Load pre-segmented images and annotations")
    parser.add_argument("--dataset-id", type=int, required=True, help="Target dataset ID")
    
    args = parser.parse_args()
    
    # 스크립트 디렉토리 경로
    script_dir = Path(__file__).parent
    images_dir = script_dir / "images"
    annotations_dir = script_dir / "annotations"
    
    # 이미지와 annotation 파일 매칭
    image_files = sorted(images_dir.glob("*.jpg"))
    
    processed_count = 0
    
    # 매칭되는 파일들 찾기
    matched_pairs = []
    
    for image_file in image_files:
        # kitchen_1.jpg -> kitchen_1_relations_16-8-4.json
        base_name = image_file.stem  # kitchen_1
        annotation_file = annotations_dir / f"{base_name}_relations_16-8-4.json"
        
        if annotation_file.exists():
            matched_pairs.append((image_file, annotation_file))
        else:
            print(f"Warning: No annotation file found for {image_file.name}")
    
    if matched_pairs:
        # 배치 처리
        image_files_matched = [pair[0] for pair in matched_pairs]
        annotation_files_matched = [pair[1] for pair in matched_pairs]
        
        await process_batch(
            image_files_matched,
            annotation_files_matched,
            args.dataset_id
        )
        processed_count = len(matched_pairs)
    
    print(f"\nProcessing completed! {processed_count} files processed.")


if __name__ == "__main__":
    asyncio.run(main())