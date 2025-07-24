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
import time
import os

# 프로젝트 루트를 sys.path에 추가
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.schemas.image import ImageCreate
from app.schemas.annotation import AnnotationCreate
from app.utils.mask_processing import process_mask_info_batch
from app.utils.process_manager import get_process_pool


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


async def create_and_commit_annotation_batch(
    session: AsyncSession, 
    annotation_data_list: List[AnnotationCreate],
    batch_id: int,
    total_batches: int
) -> int:
    """annotation 데이터를 배치로 데이터베이스에 로드하고 즉시 커밋"""
    from app.models.annotation import Annotation
    
    if not annotation_data_list:
        return 0
    
    batch_start_time = time.time()
    print(f"\n  Batch {batch_id}/{total_batches}: Processing {len(annotation_data_list)} annotations...")
    
    # 병렬 처리를 위한 segmentation 데이터 준비
    segmentation_data_list = []
    needs_conversion = []
    
    for annotation_data in annotation_data_list:
        if annotation_data.segmentation_counts and annotation_data.segmentation_size:
            segmentation_data_list.append({
                'segmentation_counts': annotation_data.segmentation_counts,
                'segmentation_size': annotation_data.segmentation_size,
                'bbox': annotation_data.bbox
            })
            needs_conversion.append(True)
        else:
            needs_conversion.append(False)
    
    # 병렬 처리로 polygon 변환
    polygon_results = []
    if segmentation_data_list:
        print(f"    Converting {len(segmentation_data_list)} segmentations to polygons...")
        conversion_start = time.time()
        
        # 더 작은 sub-batch로 나눈어 병렬 처리
        cpu_count = os.cpu_count() or 10
        max_workers = min(cpu_count, 10)
        sub_batch_size = min(50, max(10, len(segmentation_data_list) // max_workers))
        
        loop = asyncio.get_event_loop()
        tasks = []
        
        for i in range(0, len(segmentation_data_list), sub_batch_size):
            sub_batch = segmentation_data_list[i:i + sub_batch_size]
            task = loop.run_in_executor(
                get_process_pool(),
                process_mask_info_batch,
                sub_batch
            )
            tasks.append(task)
        
        # 병렬 실행
        sub_batch_results = await asyncio.gather(*tasks)
        
        # 결과 병합
        all_polygon_data = []
        for sub_result in sub_batch_results:
            all_polygon_data.extend(sub_result)
        
        polygon_results = all_polygon_data
        conversion_time = time.time() - conversion_start
        print(f"    Polygon conversion completed in {conversion_time:.2f}s")
    
    # DB 객체 생성
    print(f"    Creating database objects...")
    db_objects_start = time.time()
    
    db_annotations = []
    polygon_idx = 0
    
    for annotation_data, needs_conv in zip(annotation_data_list, needs_conversion):
        # AUTO 타입의 경우 created_by를 None으로 설정
        created_by = None if annotation_data.source_type == "AUTO" else annotation_data.created_by
        
        # polygon 데이터 할당
        polygon_data = None
        if needs_conv and polygon_idx < len(polygon_results):
            polygon_data = polygon_results[polygon_idx]
            polygon_idx += 1
        
        db_annotation = Annotation(
            bbox=annotation_data.bbox,
            area=annotation_data.area,
            segmentation_size=annotation_data.segmentation_size,
            segmentation_counts=annotation_data.segmentation_counts,
            polygon=polygon_data,
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
    
    db_objects_time = time.time() - db_objects_start
    print(f"    Database objects created in {db_objects_time:.2f}s")
    
    # 데이터베이스에 추가 및 커밋
    print(f"    Adding to database and committing...")
    commit_start = time.time()
    
    try:
        session.add_all(db_annotations)
        await session.commit()
        commit_time = time.time() - commit_start
        
        batch_total_time = time.time() - batch_start_time
        print(f"    ✓ Batch {batch_id}/{total_batches} committed successfully in {batch_total_time:.2f}s (commit: {commit_time:.2f}s)")
        
        return len(db_annotations)
        
    except Exception as e:
        await session.rollback()
        print(f"    ✗ Batch {batch_id}/{total_batches} failed: {e}")
        raise


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


async def process_batch_streaming(image_files: List[Path], annotation_files: List[Path], dataset_id: int):
    """스트리밍 방식으로 배치별 독립 처리"""
    batch_start_time = time.time()
    print(f"\n=== Processing {len(image_files)} files with streaming batches ===")
    
    # 데이터 준비
    print("1. Preparing data from files...")
    prep_start = time.time()
    image_data_list, all_annotations, file_mapping = prepare_data_from_files(
        image_files, annotation_files, dataset_id
    )
    prep_time = time.time() - prep_start
    print(f"   Data preparation completed in {prep_time:.2f}s")
    
    # 이미지 배치 생성 (한 번에 모두 생성)
    print("\n2. Creating images...")
    async with AsyncSessionLocal() as session:
        try:
            image_start = time.time()
            image_ids = await create_image_batch(session, image_data_list)
            await session.commit()
            image_time = time.time() - image_start
            print(f"   Created {len(image_ids)} images in {image_time:.2f}s")
        except Exception as e:
            await session.rollback()
            print(f"   Error creating images: {e}")
            raise
    
    # annotation 데이터 준비
    print("\n3. Preparing annotation data...")
    ann_prep_start = time.time()
    annotation_data_list = []
    
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
                polygon=None,
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
    
    total_annotations = len(annotation_data_list)
    ann_prep_time = time.time() - ann_prep_start
    print(f"   Prepared {total_annotations} annotations_test in {ann_prep_time:.2f}s")
    
    # annotation 배치별 독립 처리
    print(f"\n4. Processing annotations_test in independent batches...")
    
    # 배치 크기 결정 (메모리 효율성 고려)
    batch_size = min(100, max(50, total_annotations // 10))  # 50-100 개씩 배치
    total_batches = (total_annotations + batch_size - 1) // batch_size
    
    print(f"   Total annotations_test: {total_annotations}")
    print(f"   Batch size: {batch_size}")
    print(f"   Total batches: {total_batches}")
    
    # 배치별 독립 처리
    ann_create_start = time.time()
    total_committed = 0
    
    for batch_idx in range(total_batches):
        start_idx = batch_idx * batch_size
        end_idx = min(start_idx + batch_size, total_annotations)
        batch_annotations = annotation_data_list[start_idx:end_idx]
        
        # 각 배치마다 독립된 세션 사용
        async with AsyncSessionLocal() as batch_session:
            committed_count = await create_and_commit_annotation_batch(
                batch_session,
                batch_annotations,
                batch_idx + 1,
                total_batches
            )
            total_committed += committed_count
    
    ann_create_time = time.time() - ann_create_start
    print(f"\n   All annotation batches completed in {ann_create_time:.2f}s")
    
    total_time = time.time() - batch_start_time
    print(f"\n=== Streaming batch processing completed successfully ===")
    print(f"   Files processed: {len(image_files)}")
    print(f"   Images created: {len(image_ids)}")
    print(f"   Annotations created: {total_committed}")
    print(f"   Total time: {total_time:.2f}s")
    print(f"   Average time per annotation: {total_time/total_committed:.4f}s")
    print(f"   Batches processed: {total_batches}")
    print(f"   Average time per batch: {ann_create_time/total_batches:.2f}s")


async def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Load pre-segmented images and annotations_test")
    parser.add_argument("--dataset-id", type=int, required=True, help="Target dataset ID")
    
    args = parser.parse_args()
    
    # 스크립트 디렉토리 경로
    script_dir = Path(__file__).parent
    images_dir = script_dir / "images_high"
    annotations_dir = script_dir / "annotations_high"

    # annotation 파일 기준으로 매칭
    annotation_files = sorted(annotations_dir.glob("*_relations_*.json"))
    matched_pairs = []
    processed_count = 0

    def get_image_file_from_annotation(annotation_file: Path, images_dir: Path) -> Path:
        # 예: kitchen_1_relations_16-8-4.json -> kitchen_1.jpg
        base_name = annotation_file.name.split('_relations_')[0]
        image_file = images_dir / f"{base_name}.jpg"
        return image_file

    for annotation_file in annotation_files:
        image_file = get_image_file_from_annotation(annotation_file, images_dir)
        if image_file.exists():
            matched_pairs.append((image_file, annotation_file))
        else:
            print(f"Warning: No image file found for {annotation_file.name}")

    if matched_pairs:
        # 배치 처리
        image_files_matched = [pair[0] for pair in matched_pairs]
        annotation_files_matched = [pair[1] for pair in matched_pairs]
        
        await process_batch_streaming(
            image_files_matched,
            annotation_files_matched,
            args.dataset_id
        )
        processed_count = len(matched_pairs)
    
    print(f"\nProcessing completed! {processed_count} files processed.")


if __name__ == "__main__":
    asyncio.run(main())