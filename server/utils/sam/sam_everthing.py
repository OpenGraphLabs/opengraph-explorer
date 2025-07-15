import torch
from segment_anything import sam_model_registry, SamPredictor
import cv2
import numpy as np
import matplotlib.pyplot as plt
from typing import List, Tuple, Optional
import os
import json
from pycocotools import mask as maskUtils
from datetime import datetime
import argparse
import requests
from tqdm import tqdm
import hashlib

class SAMEverything:
    # SAM 모델 다운로드 URL들
    SAM_MODEL_URLS = {
        "vit_h": "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth",
        "vit_l": "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_l_0b3195.pth",
        "vit_b": "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth"
    }
    
    # 모델 파일 체크섬 (파일 무결성 확인용)
    SAM_MODEL_CHECKSUMS = {
        "sam_vit_h_4b8939.pth": "a7bf3b02f3ebf1267aba913ff637d9a2d5c33d3173bb679e46d9f338c26f262e",
        "sam_vit_l_0b3195.pth": "3adcc4315b642a4d2101128f611684e8734c41232a17c648ed1693702a49a622", 
        "sam_vit_b_01ec64.pth": "ec2df62732614e57411cdcf32a23ffdf28910380d03139ee0f4fcbe91eb8c912"
    }
    
    def __init__(self, checkpoint_path: str = None, model_type: str = "vit_h"):
        """
        Initialize SAM Everything with specified model
        
        Args:
            checkpoint_path: Path to SAM checkpoint file
            model_type: Type of SAM model ("vit_h", "vit_l", "vit_b") - default: "vit_h"
        """
        print(f"Initializing SAM Everything with model: {model_type} (default: vit_h)")
        
        # Default checkpoint path based on model type
        if checkpoint_path is None:
            if model_type == "vit_h":
                checkpoint_path = "sam_vit_h_4b8939.pth"
            elif model_type == "vit_l":
                checkpoint_path = "sam_vit_l_0b3195.pth"
            elif model_type == "vit_b":
                checkpoint_path = "sam_vit_b_01ec64.pth"
            else:
                raise ValueError(f"Unsupported model type: {model_type}")
        
        self.checkpoint_path = checkpoint_path
        self.model_type = model_type
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # 모델 파일이 없으면 자동 다운로드
        if not os.path.exists(checkpoint_path):
            print(f"Model file not found: {checkpoint_path}")
            self._download_model(model_type, checkpoint_path)
        
        # 파일 무결성 확인
        if not self._verify_file_integrity(checkpoint_path):
            print("File integrity check failed. Re-downloading...")
            self._download_model(model_type, checkpoint_path)
        
        # Load SAM model
        print(f"Loading SAM {model_type} model from: {checkpoint_path}")
        self.sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
        self.sam.to(self.device)
        
        self.predictor = SamPredictor(self.sam)
        self.current_image = None
        
        print(f"SAM {model_type} model loaded successfully on {self.device}")
    
    def _download_model(self, model_type: str, checkpoint_path: str):
        """
        Download SAM model file
        
        Args:
            model_type: Type of SAM model
            checkpoint_path: Path to save the model file
        """
        if model_type not in self.SAM_MODEL_URLS:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        url = self.SAM_MODEL_URLS[model_type]
        print(f"Downloading SAM {model_type} model from: {url}")
        
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            # 파일 크기 확인
            total_size = int(response.headers.get('content-length', 0))
            
            # 다운로드 진행률 표시
            with open(checkpoint_path, 'wb') as f, tqdm(
                desc=f"Downloading {checkpoint_path}",
                total=total_size,
                unit='B',
                unit_scale=True,
                unit_divisor=1024,
            ) as pbar:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))
            
            print(f"Successfully downloaded: {checkpoint_path}")
            
        except Exception as e:
            print(f"Error downloading model: {e}")
            if os.path.exists(checkpoint_path):
                os.remove(checkpoint_path)
            raise
    
    def _verify_file_integrity(self, checkpoint_path: str) -> bool:
        """
        Verify file integrity using SHA256 checksum
        
        Args:
            checkpoint_path: Path to the model file
            
        Returns:
            True if file is valid, False otherwise
        """
        filename = os.path.basename(checkpoint_path)
        
        # 체크섬이 정의되지 않은 파일은 검증 생략
        if filename not in self.SAM_MODEL_CHECKSUMS:
            return True
        
        expected_checksum = self.SAM_MODEL_CHECKSUMS[filename]
        
        try:
            # 파일의 SHA256 체크섬 계산
            sha256_hash = hashlib.sha256()
            with open(checkpoint_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(chunk)
            
            actual_checksum = sha256_hash.hexdigest()
            
            if actual_checksum == expected_checksum:
                print(f"File integrity verified: {checkpoint_path}")
                return True
            else:
                print(f"File integrity check failed for {checkpoint_path}")
                print(f"Expected: {expected_checksum}")
                print(f"Actual: {actual_checksum}")
                return False
                
        except Exception as e:
            print(f"Error verifying file integrity: {e}")
            return False

    def set_image(self, image: np.ndarray):
        """
        Set the image for segmentation
        
        Args:
            image: Input image in RGB format
        """
        self.current_image = image
        self.predictor.set_image(image)
    
    def segment_with_points(self, 
                          points: List[Tuple[int, int]], 
                          labels: List[int],
                          multimask_output: bool = True) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Segment using point prompts
        
        Args:
            points: List of (x, y) coordinates
            labels: List of labels (1 for foreground, 0 for background)
            multimask_output: Whether to return multiple masks
            
        Returns:
            Tuple of (masks, scores, logits)
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        input_points = np.array(points)
        input_labels = np.array(labels)
        
        masks, scores, logits = self.predictor.predict(
            point_coords=input_points,
            point_labels=input_labels,
            multimask_output=multimask_output,
        )
        
        return masks, scores, logits
    
    def segment_with_box(self, 
                        box: Tuple[int, int, int, int],
                        multimask_output: bool = False) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Segment using bounding box prompt
        
        Args:
            box: Bounding box as (x1, y1, x2, y2)
            multimask_output: Whether to return multiple masks
            
        Returns:
            Tuple of (masks, scores, logits)
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        input_box = np.array(box)
        
        masks, scores, logits = self.predictor.predict(
            box=input_box,
            multimask_output=multimask_output,
        )
        
        return masks, scores, logits
    
    def segment_everything(self, 
                          grid_size: int = 32,
                          min_mask_area: int = 1000) -> List[dict]:
        """
        Segment everything in the image using automatic mask generation
        
        Args:
            grid_size: Grid size for point sampling
            min_mask_area: Minimum area threshold for masks
            
        Returns:
            List of mask dictionaries
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        # Generate grid of points
        h, w = self.current_image.shape[:2]
        points = []
        for y in range(0, h, grid_size):
            for x in range(0, w, grid_size):
                if x < w and y < h:
                    points.append([x, y])
        
        all_masks = []
        
        # Process each point
        for i, point in enumerate(points):
            try:
                masks, scores, logits = self.segment_with_points(
                    [point], [1], multimask_output=True
                )
                
                # Select best mask
                best_mask_idx = np.argmax(scores)
                best_mask = masks[best_mask_idx]
                best_score = scores[best_mask_idx]
                
                # Filter by area
                if np.sum(best_mask) >= min_mask_area:
                    mask_dict = {
                        'segmentation': best_mask,
                        'area': int(np.sum(best_mask)),
                        'score': float(best_score),
                        'point': point,
                        'bbox': self._mask_to_bbox(best_mask)
                    }
                    all_masks.append(mask_dict)
                    
            except Exception as e:
                print(f"Error processing point {point}: {e}")
                continue
        
        # Remove duplicate masks (중복마스크 제거)
        all_masks = self._remove_duplicate_masks(all_masks)
        
        return all_masks
    
    def _mask_to_bbox(self, mask: np.ndarray) -> List[int]:
        """Convert mask to bounding box"""
        rows, cols = np.where(mask)
        if len(rows) == 0:
            return [0, 0, 0, 0]
        
        min_row, max_row = rows.min(), rows.max()
        min_col, max_col = cols.min(), cols.max()
        
        return [int(min_col), int(min_row), int(max_col), int(max_row)]
    
    def _remove_duplicate_masks(self, masks: List[dict], iou_threshold: float = 0.7) -> List[dict]:
        """Remove duplicate masks based on IoU (중복마스크 제거)"""
        if len(masks) <= 1:
            return masks
        
        # Sort by score (descending)
        masks.sort(key=lambda x: x['score'], reverse=True)
        
        keep_masks = []
        for i, mask1 in enumerate(masks):
            keep = True
            for mask2 in keep_masks:
                iou = self._calculate_iou(mask1['segmentation'], mask2['segmentation'])
                if iou > iou_threshold:
                    keep = False
                    break
            if keep:
                keep_masks.append(mask1)
        
        return keep_masks
    
    def _calculate_iou(self, mask1: np.ndarray, mask2: np.ndarray) -> float:
        """Calculate IoU between two masks"""
        intersection = np.logical_and(mask1, mask2).sum()
        union = np.logical_or(mask1, mask2).sum()
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    def visualize_masks(self, masks: List[dict], alpha: float = 0.5):
        """
        Visualize masks on the current image
        
        Args:
            masks: List of mask dictionaries
            alpha: Transparency of masks
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        plt.figure(figsize=(12, 8))
        plt.imshow(self.current_image)
        
        # Generate random colors for each mask
        colors = np.random.rand(len(masks), 3)
        
        for i, mask_dict in enumerate(masks):
            mask = mask_dict['segmentation']
            color = colors[i]
            
            # Create colored mask
            colored_mask = np.zeros((*mask.shape, 3))
            colored_mask[mask] = color
            
            plt.imshow(colored_mask, alpha=alpha)
        
        plt.axis('off')
        plt.title(f'SAM vit_h Segmentation Results ({len(masks)} masks)')
        plt.show()
    
    def save_masks(self, masks: List[dict], output_path: str):
        """
        Save masks to file (일반 JSON 포맷)
        
        Args:
            masks: List of mask dictionaries
            output_path: Path to save the masks
        """
        # Convert numpy arrays to lists for JSON serialization
        serializable_masks = []
        for mask_dict in masks:
            serializable_dict = {
                'segmentation': mask_dict['segmentation'].tolist(),
                'area': mask_dict['area'],
                'score': mask_dict['score'],
                'point': mask_dict['point'],
                'bbox': mask_dict['bbox']
            }
            serializable_masks.append(serializable_dict)
        
        with open(output_path, 'w') as f:
            json.dump(serializable_masks, f, indent=2)
        
        print(f"Saved {len(masks)} masks to {output_path}")
    
    def save_masks_coco_format(self, masks: List[dict], output_path: str, 
                              image_filename: str, image_id: int = 1):
        """
        Save masks in COCO dataset format (COCO 포맷으로 저장)
        
        Args:
            masks: List of mask dictionaries
            output_path: Path to save the COCO format JSON
            image_filename: Original image filename
            image_id: Image ID for COCO format
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        h, w = self.current_image.shape[:2]
        
        # COCO format structure
        coco_format = {
            "info": {
                "description": "SAM vit_h Segmentation Results",
                "url": "https://github.com/facebookresearch/segment-anything",
                "version": "1.0",
                "year": 2024,
                "contributor": "SAM Everything",
                "date_created": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "licenses": [
                {
                    "id": 1,
                    "name": "Apache License 2.0",
                    "url": "https://www.apache.org/licenses/LICENSE-2.0"
                }
            ],
            "categories": [
                {
                    "id": 1,
                    "name": "object",
                    "supercategory": "thing"
                }
            ],
            "images": [
                {
                    "id": image_id,
                    "width": w,
                    "height": h,
                    "file_name": image_filename,
                    "license": 1,
                    "flickr_url": "",
                    "coco_url": "",
                    "date_captured": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            ],
            "annotations": []
        }
        
        # Convert masks to COCO annotations
        for ann_id, mask_dict in enumerate(masks, 1):
            mask = mask_dict['segmentation']
            
            # Convert mask to COCO RLE format
            mask_uint8 = mask.astype(np.uint8)
            rle = maskUtils.encode(np.asfortranarray(mask_uint8))
            
            # Convert bytes to string for JSON serialization
            if isinstance(rle['counts'], bytes):
                rle['counts'] = rle['counts'].decode('utf-8')
            
            # Calculate area and bounding box
            area = int(maskUtils.area(rle))
            bbox = maskUtils.toBbox(rle).tolist()
            
            # Create COCO annotation
            annotation = {
                "id": ann_id,
                "image_id": image_id,
                "category_id": 1,
                "segmentation": rle,
                "area": area,
                "bbox": bbox,  # [x, y, width, height]
                "iscrowd": 0,
                "score": mask_dict['score']
            }
            
            coco_format["annotations"].append(annotation)
        
        # Save COCO format JSON
        with open(output_path, 'w') as f:
            json.dump(coco_format, f, indent=2)
        
        print(f"Saved {len(masks)} masks in COCO format to {output_path}")
    
    def save_masks_polygon_format(self, masks: List[dict], output_path: str, 
                                 image_filename: str, image_id: int = 1):
        """
        Save masks in COCO polygon format (COCO 폴리곤 포맷으로 저장)
        
        Args:
            masks: List of mask dictionaries
            output_path: Path to save the COCO polygon format JSON
            image_filename: Original image filename
            image_id: Image ID for COCO format
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        h, w = self.current_image.shape[:2]
        
        # COCO format structure
        coco_format = {
            "info": {
                "description": "SAM vit_h Segmentation Results (Polygon)",
                "url": "https://github.com/facebookresearch/segment-anything",
                "version": "1.0",
                "year": 2024,
                "contributor": "SAM Everything",
                "date_created": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "licenses": [
                {
                    "id": 1,
                    "name": "Apache License 2.0",
                    "url": "https://www.apache.org/licenses/LICENSE-2.0"
                }
            ],
            "categories": [
                {
                    "id": 1,
                    "name": "object",
                    "supercategory": "thing"
                }
            ],
            "images": [
                {
                    "id": image_id,
                    "width": w,
                    "height": h,
                    "file_name": image_filename,
                    "license": 1,
                    "flickr_url": "",
                    "coco_url": "",
                    "date_captured": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            ],
            "annotations": []
        }
        
        # Convert masks to COCO polygon annotations
        for ann_id, mask_dict in enumerate(masks, 1):
            mask = mask_dict['segmentation']
            
            # Convert mask to polygon format
            polygons = self._mask_to_polygons(mask)
            
            if polygons:
                # Create COCO annotation with polygon
                annotation = {
                    "id": ann_id,
                    "image_id": image_id,
                    "category_id": 1,
                    "segmentation": polygons,
                    "area": mask_dict['area'],
                    "bbox": mask_dict['bbox'],
                    "iscrowd": 0,
                    "score": mask_dict['score']
                }
                
                coco_format["annotations"].append(annotation)
        
        # Save COCO polygon format JSON
        with open(output_path, 'w') as f:
            json.dump(coco_format, f, indent=2)
        
        print(f"Saved {len(coco_format['annotations'])} masks in COCO polygon format to {output_path}")
    
    def _mask_to_polygons(self, mask: np.ndarray, tolerance: float = 2.0):
        """Convert mask to polygon format"""
        from skimage import measure
        
        # Find contours
        contours = measure.find_contours(mask, 0.5)
        
        polygons = []
        for contour in contours:
            # Simplify contour
            contour = measure.approximate_polygon(contour, tolerance=tolerance)
            
            # Convert to flat list [x1, y1, x2, y2, ...]
            if len(contour) >= 3:  # Need at least 3 points for a polygon
                polygon = []
                for point in contour:
                    polygon.extend([float(point[1]), float(point[0])])  # x, y
                polygons.append(polygon)
        
        return polygons


# Example usage function
def demo_sam_everything(input_path: str, grid_size: int = 64, model_type: str = "vit_h"):
    """
    Demo function showing how to use SAM Everything
    
    Args:
        input_path: Path to input image
        grid_size: Grid size for segmentation (default: 64)
        model_type: SAM model type ("vit_h", "vit_l", "vit_b") - default: "vit_h"
    """
    print(f"Starting SAM Everything demo with model: {model_type}")
    print("Available models: vit_h (2.4GB, best quality), vit_l (1.2GB, good), vit_b (375MB, fast)")
    
    # Initialize SAM Everything with automatic download
    sam_everything = SAMEverything(model_type=model_type)
    
    # Load and set image
    image_path = input_path
    image_name = os.path.basename(image_path)

    if os.path.exists(image_path):
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # 이미지 width, height 추출
        height = image.shape[0]  # 높이
        width = image.shape[1]   # 너비
        channels = image.shape[2] # 채널 (일반적으로 3 for RGB)

        print(f"Image shape: {image.shape}")
        print(f"Width: {width}, Height: {height}, Channels: {channels}")
        
        sam_everything.set_image(image)
        
        # Segment everything
        print(f"Segmenting everything with grid_size={grid_size}...")
        masks = sam_everything.segment_everything(grid_size=grid_size, min_mask_area=500)
        
        print(f"Found {len(masks)} masks (after duplicate removal)")
        # Visualize results
        sam_everything.visualize_masks(masks)
        # Save in different formats
        sam_everything.save_masks_coco_format(masks, f"{image_name}_{model_type}_{grid_size}.json", 
                                            image_name, image_id=1)
        
    else:
        print(f"Image not found: {image_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='SAM Everything - Segment Anything Model for everything')
    parser.add_argument('--input', type=str, required=True, help='Path to input image')
    parser.add_argument('--grid_size', type=int, default=64, help='Grid size for segmentation (default: 64)')
    parser.add_argument('--model_type', type=str, default='vit_h', choices=['vit_h', 'vit_l', 'vit_b'], 
                        help='SAM model type - vit_h: 2.4GB best quality (default), vit_l: 1.2GB good, vit_b: 375MB fast')
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("SAM Everything - Segment Anything Model")
    print("=" * 50)
    print(f"Using model: {args.model_type} (default: vit_h)")
    print(f"Input image: {args.input}")
    print(f"Grid size: {args.grid_size}")
    print("=" * 50)
    
    demo_sam_everything(args.input, args.grid_size, args.model_type)
