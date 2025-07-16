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
                          min_mask_area: int = 1000,
                          max_mask_area: int = None,
                          max_complexity_ratio: float = 0.05,
                          min_solidity: float = 0.3) -> List[dict]:
        """
        Segment everything in the image using automatic mask generation
        
        Args:
            grid_size: Grid size for point sampling
            min_mask_area: Minimum area threshold for masks
            max_mask_area: Maximum area threshold for masks (None for no limit)
            max_complexity_ratio: Maximum perimeter/area ratio to filter complex shapes
            min_solidity: Minimum solidity (area/convex_hull_area) to filter irregular shapes
            
        Returns:
            List of mask dictionaries
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        # Set default max_mask_area to 1/4 of image area if not specified
        if max_mask_area is None:
            h, w = self.current_image.shape[:2]
            max_mask_area = (h * w) // 4
        
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
                
                # Calculate mask properties
                mask_area = int(np.sum(best_mask))
                
                # Filter by area
                if mask_area < min_mask_area or mask_area > max_mask_area:
                    continue
                
                # Calculate complexity metrics
                complexity_ratio = self._calculate_complexity_ratio(best_mask)
                solidity = self._calculate_solidity(best_mask)
                
                # Filter by complexity
                if complexity_ratio > max_complexity_ratio or solidity < min_solidity:
                    continue
                
                mask_dict = {
                    'segmentation': best_mask,
                    'area': mask_area,
                    'score': float(best_score),
                    'point': point,
                    'bbox': self._mask_to_bbox(best_mask),
                    'complexity_ratio': complexity_ratio,
                    'solidity': solidity
                }
                all_masks.append(mask_dict)
                    
            except Exception as e:
                print(f"Error processing point {point}: {e}")
                continue
        
        # Remove duplicate masks
        all_masks = self._remove_duplicate_masks(all_masks)
        
        print(f"Filtered masks: {len(all_masks)} (after area: {min_mask_area}-{max_mask_area}, "
              f"complexity_ratio < {max_complexity_ratio}, solidity > {min_solidity})")
        
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

    def _calculate_complexity_ratio(self, mask: np.ndarray) -> float:
        """
        Calculate complexity ratio (perimeter^2 / area) to identify complex shapes
        Higher values indicate more complex/irregular shapes
        """
        import cv2
        
        # Convert mask to uint8
        mask_uint8 = mask.astype(np.uint8) * 255
        
        # Find contours
        contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0.0
        
        # Get the largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Calculate perimeter and area
        perimeter = cv2.arcLength(largest_contour, True)
        area = cv2.contourArea(largest_contour)
        
        if area == 0:
            return float('inf')
        
        # Return perimeter^2 / (4π * area) - normalized circularity measure
        # Perfect circle = 1.0, more complex shapes > 1.0
        complexity_ratio = (perimeter * perimeter) / (4 * np.pi * area)
        
        return complexity_ratio

    def _calculate_solidity(self, mask: np.ndarray) -> float:
        """
        Calculate solidity (area / convex_hull_area) to identify irregular shapes
        Values closer to 1.0 indicate more solid/regular shapes
        """
        import cv2
        
        # Convert mask to uint8
        mask_uint8 = mask.astype(np.uint8) * 255
        
        # Find contours
        contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0.0
        
        # Get the largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Calculate area and convex hull area
        area = cv2.contourArea(largest_contour)
        hull = cv2.convexHull(largest_contour)
        hull_area = cv2.contourArea(hull)
        
        if hull_area == 0:
            return 0.0
        
        solidity = area / hull_area
        return solidity
    
    def segment_everything_multi_scale(self, 
                                     grid_sizes: List[int] = [32, 16, 8],
                                     min_mask_area: int = 500,
                                     max_mask_area: int = None,
                                     max_complexity_ratio: float = 4.0,
                                     min_solidity: float = 0.4,
                                     iou_threshold: float = 0.7) -> List[dict]:
        """
        Segment everything with multiple grid sizes and establish parent-child relationships
        
        Args:
            grid_sizes: List of grid sizes to process (e.g., [32, 16, 8])
            min_mask_area: Minimum area threshold for masks
            max_mask_area: Maximum area threshold for masks (None for no limit)
            max_complexity_ratio: Maximum perimeter/area ratio to filter complex shapes
            min_solidity: Minimum solidity to filter irregular shapes
            iou_threshold: IoU threshold for duplicate removal
            
        Returns:
            List of mask dictionaries with parent-child relationships
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        # Set default max_mask_area
        if max_mask_area is None:
            h, w = self.current_image.shape[:2]
            max_mask_area = (h * w) // 4
        
        all_masks_by_grid = {}
        
        # Process each grid size
        for grid_size in sorted(grid_sizes, reverse=True):  # 큰 grid부터 처리 (큰 덩어리부터)
            print(f"Processing grid_size: {grid_size}")
            
            masks = self.segment_everything(
                grid_size=grid_size,
                min_mask_area=min_mask_area,
                max_mask_area=max_mask_area,
                max_complexity_ratio=max_complexity_ratio,
                min_solidity=min_solidity
            )
            
            # Add grid_size info to each mask
            for idx, mask in enumerate(masks):
                mask['grid_size'] = grid_size
                mask['original_id'] = f"grid{grid_size}_{idx}"
            
            all_masks_by_grid[grid_size] = masks
            print(f"Grid {grid_size}: Found {len(masks)} masks")
        
        # Combine all masks
        all_masks = []
        for grid_size in sorted(grid_sizes, reverse=True):
            all_masks.extend(all_masks_by_grid[grid_size])
        
        print(f"Total masks before duplicate removal: {len(all_masks)}")
        
        # Remove duplicates across all grid sizes
        unique_masks = self._remove_duplicate_masks_advanced(all_masks, iou_threshold)
        print(f"Total masks after duplicate removal: {len(unique_masks)}")
        
        # Establish parent-child relationships
        masks_with_relations = self._establish_parent_child_relationships(unique_masks)
        print(f"Established parent-child relationships for {len(masks_with_relations)} masks")
        
        return masks_with_relations

    def _remove_duplicate_masks_advanced(self, masks: List[dict], iou_threshold: float = 0.7) -> List[dict]:
        """
        Remove duplicate masks across different grid sizes based on IoU
        Priority: larger grid_size (coarser segmentation) is kept
        """
        if len(masks) <= 1:
            return masks
        
        # Sort by grid_size (descending) then by score (descending)
        masks.sort(key=lambda x: (x['grid_size'], x['score']), reverse=True)
        
        keep_masks = []
        for i, mask1 in enumerate(masks):
            keep = True
            for mask2 in keep_masks:
                iou = self._calculate_iou(mask1['segmentation'], mask2['segmentation'])
                if iou > iou_threshold:
                    # If IoU is high, keep the one with larger grid_size (coarser)
                    # or higher score if same grid_size
                    keep = False
                    break
            if keep:
                keep_masks.append(mask1)
        
        return keep_masks

    def _establish_parent_child_relationships(self, masks: List[dict]) -> List[dict]:
        """
        Establish parent-child relationships based on spatial containment
        """
        # Sort masks by area (descending) - larger masks first
        sorted_masks = sorted(masks, key=lambda x: x['area'], reverse=True)
        
        # Initialize relationship fields
        for i, mask in enumerate(sorted_masks):
            mask['id'] = i + 1
            mask['parent_id'] = None
            mask['child_ids'] = []
        
        # Find parent-child relationships
        for i, potential_child in enumerate(sorted_masks):
            child_mask = potential_child['segmentation']
            
            for j, potential_parent in enumerate(sorted_masks[:i]):  # Only check larger masks
                parent_mask = potential_parent['segmentation']
                
                # Check if child is contained within parent
                if self._is_mask_contained(child_mask, parent_mask):
                    potential_child['parent_id'] = potential_parent['id']
                    potential_parent['child_ids'].append(potential_child['id'])
                    break  # Only assign one parent (the first/largest suitable one)
        
        return sorted_masks

    def _is_mask_contained(self, child_mask: np.ndarray, parent_mask: np.ndarray, 
                          containment_threshold: float = 0.8) -> bool:
        """
        Check if child_mask is spatially contained within parent_mask
        
        Args:
            child_mask: Smaller mask to check
            parent_mask: Larger mask to check containment
            containment_threshold: Minimum ratio of child area that must be within parent
            
        Returns:
            True if child is contained within parent
        """
        # Calculate intersection
        intersection = np.logical_and(child_mask, parent_mask)
        intersection_area = np.sum(intersection)
        child_area = np.sum(child_mask)
        
        if child_area == 0:
            return False
        
        # Check if most of the child is contained within the parent
        containment_ratio = intersection_area / child_area
        return containment_ratio >= containment_threshold

    def _split_disconnected_masks(self, masks: List[dict]) -> List[dict]:
        """
        Split masks that contain disconnected components into separate masks
        """
        from scipy import ndimage
        from skimage.measure import label, regionprops
        
        split_masks = []
        
        for mask_dict in masks:
            mask = mask_dict['segmentation']
            
            # Find connected components
            labeled_mask = label(mask)
            regions = regionprops(labeled_mask)
            
            if len(regions) <= 1:
                # Single connected component
                split_masks.append(mask_dict)
            else:
                # Multiple connected components - split them
                for i, region in enumerate(regions):
                    if region.area < 100:  # Skip very small components
                        continue
                        
                    # Create new mask for this component
                    component_mask = (labeled_mask == region.label)
                    
                    new_mask_dict = {
                        'segmentation': component_mask,
                        'area': int(region.area),
                        'score': mask_dict['score'] * 0.9,  # Slightly lower score
                        'point': [int(region.centroid[1]), int(region.centroid[0])],
                        'bbox': [region.bbox[1], region.bbox[0], region.bbox[3], region.bbox[2]],
                        'grid_size': mask_dict['grid_size'],
                        'original_id': f"{mask_dict.get('original_id', '')}_split_{i}"
                    }
                    
                    split_masks.append(new_mask_dict)
        
        return split_masks

    def save_masks_coco_format_with_relations(self, masks: List[dict], output_path: str, 
                                            image_filename: str, image_id: int = 1,
                                            grid_sizes: List[int] = None):
        """
        Save masks with parent-child relationships in extended COCO format
        
        Args:
            masks: List of mask dictionaries
            output_path: Path to save the output file
            image_filename: Original image filename
            image_id: Image ID for COCO format
            grid_sizes: List of grid sizes used for multi-scale processing
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        h, w = self.current_image.shape[:2]
        
        # Extract unique grid sizes from masks if not provided
        if grid_sizes is None:
            grid_sizes = sorted(list(set([mask_dict['grid_size'] for mask_dict in masks])), reverse=True)
        
        # Extended COCO format with relationships
        coco_format = {
            "info": {
                "description": "SAM Multi-Scale Segmentation with Parent-Child Relations",
                "url": "https://github.com/facebookresearch/segment-anything",
                "version": "2.0",
                "year": 2024,
                "contributor": "SAM Everything with Relations",
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
                    "date_captured": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "grid_size": grid_sizes  # 사용된 그리드 크기들 추가
                }
            ],
            "annotations": [],
            "relationships": {
                "description": "Parent-child relationships between segmentation masks",
                "parent_children": {}
            }
        }
        
        # Convert masks to COCO annotations with relationships
        for mask_dict in masks:
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
            
            # Create extended COCO annotation
            annotation = {
                "id": mask_dict['id'],
                "image_id": image_id,
                "category_id": 1,
                "segmentation": rle,
                "area": area,
                "bbox": bbox,
                "iscrowd": 0,
                "score": mask_dict['score'],
                # Extended fields
                "grid": mask_dict['grid_size'],  # "grid_size"를 "grid"로 변경
                "parent_id": mask_dict['parent_id'],
                "child_ids": mask_dict['child_ids'],
                "complexity_ratio": mask_dict.get('complexity_ratio', 0),
                "solidity": mask_dict.get('solidity', 0),
                "original_id": mask_dict.get('original_id', '')
            }
            
            coco_format["annotations"].append(annotation)
        
        # Build parent-children relationships dictionary
        for mask_dict in masks:
            if mask_dict['child_ids']:  # 이 마스크가 부모인 경우
                parent_id = mask_dict['id']
                child_ids = mask_dict['child_ids']
                coco_format["relationships"]["parent_children"][str(parent_id)] = child_ids
        
        # Save extended COCO format JSON
        with open(output_path, 'w') as f:
            json.dump(coco_format, f, indent=2)
        
        # Print statistics
        total_masks = len(masks)
        parent_masks = len([m for m in masks if m['child_ids']])
        child_masks = len([m for m in masks if m['parent_id'] is not None])
        root_masks = len([m for m in masks if m['parent_id'] is None])
        
        print(f"Saved {total_masks} masks with relationships to {output_path}")
        print(f"Grid sizes used: {grid_sizes}")
        print(f"Statistics:")
        print(f"  - Root masks (no parent): {root_masks}")
        print(f"  - Parent masks (have children): {parent_masks}")
        print(f"  - Child masks (have parent): {child_masks}")
        print(f"  - Total relationships: {len(coco_format['relationships']['parent_children'])}")

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

    def visualize_masks_with_relations(self, masks: List[dict], alpha: float = 0.5, 
                                     show_relations: bool = True):
        """
        Visualize masks with parent-child relationships
        """
        if self.current_image is None:
            raise ValueError("No image set. Call set_image() first.")
        
        fig, axes = plt.subplots(1, 2, figsize=(20, 10))
        
        # Left: All masks
        axes[0].imshow(self.current_image)
        colors = plt.cm.tab20(np.linspace(0, 1, len(masks)))
        
        for i, mask_dict in enumerate(masks):
            mask = mask_dict['segmentation']
            color = colors[i][:3]  # RGB only
            
            colored_mask = np.zeros((*mask.shape, 3))
            colored_mask[mask] = color
            axes[0].imshow(colored_mask, alpha=alpha)
            
            # Add text annotation
            bbox = mask_dict['bbox']
            center_x = (bbox[0] + bbox[2]) / 2
            center_y = (bbox[1] + bbox[3]) / 2
            axes[0].text(center_x, center_y, str(mask_dict['id']), 
                        color='white', fontsize=8, ha='center', va='center',
                        bbox=dict(boxstyle="round,pad=0.1", facecolor='black', alpha=0.7))
        
        axes[0].set_title(f'All Masks ({len(masks)} total)')
        axes[0].axis('off')
        
        # Right: Parent-child relationships
        if show_relations:
            axes[1].imshow(self.current_image)
            
            # Color code by hierarchy level
            root_masks = [m for m in masks if m['parent_id'] is None]
            for i, root_mask in enumerate(root_masks):
                self._draw_hierarchy(axes[1], root_mask, masks, level=0, max_level=3, alpha=alpha)
            
            axes[1].set_title('Parent-Child Relationships (Color by Level)')
            axes[1].axis('off')
        
        plt.tight_layout()
        plt.show()

    def _draw_hierarchy(self, ax, mask_dict: dict, all_masks: List[dict], 
                       level: int, max_level: int, alpha: float):
        """
        Recursively draw mask hierarchy with different colors for each level
        """
        if level > max_level:
            return
        
        # Color based on hierarchy level
        level_colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange']
        color = level_colors[level % len(level_colors)]
        
        mask = mask_dict['segmentation']
        colored_mask = np.zeros((*mask.shape, 3))
        
        if color == 'red':
            colored_mask[mask] = [1, 0, 0]
        elif color == 'green':
            colored_mask[mask] = [0, 1, 0]
        elif color == 'blue':
            colored_mask[mask] = [0, 0, 1]
        elif color == 'yellow':
            colored_mask[mask] = [1, 1, 0]
        elif color == 'purple':
            colored_mask[mask] = [1, 0, 1]
        else:  # orange
            colored_mask[mask] = [1, 0.5, 0]
        
        ax.imshow(colored_mask, alpha=alpha)
        
        # Add text annotation
        bbox = mask_dict['bbox']
        center_x = (bbox[0] + bbox[2]) / 2
        center_y = (bbox[1] + bbox[3]) / 2
        ax.text(center_x, center_y, f"{mask_dict['id']}(L{level})", 
               color='white', fontsize=8, ha='center', va='center',
               bbox=dict(boxstyle="round,pad=0.1", facecolor='black', alpha=0.7))
        
        # Draw children
        for child_id in mask_dict['child_ids']:
            child_mask = next((m for m in all_masks if m['id'] == child_id), None)
            if child_mask:
                self._draw_hierarchy(ax, child_mask, all_masks, level+1, max_level, alpha)


# Example usage function
def demo_sam_everything_with_relations(input_path: str, 
                                     grid_sizes: List[int] = [32, 16, 8], 
                                     model_type: str = "vit_h"):
    """
    Demo function for multi-scale SAM with parent-child relationships
    
    Args:
        input_path: Path to input image
        grid_sizes: List of grid sizes for multi-scale processing
        model_type: SAM model type ("vit_h", "vit_l", "vit_b")
    """
    print(f"Starting SAM Everything with Relations demo")
    print(f"Model: {model_type}, Grid sizes: {grid_sizes}")
    
    # Initialize SAM Everything
    sam_everything = SAMEverything(model_type=model_type)
    
    # Load and set image
    image_path = input_path
    image_name = os.path.basename(image_path)

    if os.path.exists(image_path):
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        height, width = image.shape[:2]
        print(f"Image: {image_name}, Size: {width}x{height}")
        
        sam_everything.set_image(image)
        
        # Multi-scale segmentation with relationships
        print(f"Processing multi-scale segmentation...")
        masks_with_relations = sam_everything.segment_everything_multi_scale(
            grid_sizes=grid_sizes,
            min_mask_area=500,
            max_mask_area=width*height//8,
            max_complexity_ratio=4.0,
            min_solidity=0.4,
            iou_threshold=0.7
        )
        
        print(f"Final result: {len(masks_with_relations)} masks with relationships")
        
        # Print hierarchy statistics
        grid_stats = {}
        for mask in masks_with_relations:
            grid_size = mask['grid_size']
            if grid_size not in grid_stats:
                grid_stats[grid_size] = 0
            grid_stats[grid_size] += 1
        
        print("Masks by grid size:")
        for grid_size in sorted(grid_stats.keys(), reverse=True):
            print(f"  Grid {grid_size}: {grid_stats[grid_size]} masks")
        
        # Visualize results
        sam_everything.visualize_masks_with_relations(masks_with_relations)
        
        # Save results with relationships and grid_sizes
        output_filename = f"{image_name}_relations_{'-'.join(map(str, grid_sizes))}.json"
        sam_everything.save_masks_coco_format_with_relations(
            masks_with_relations, output_filename, image_name, image_id=1, grid_sizes=grid_sizes
        )
        
        print(f"Results saved to: {output_filename}")
        
    else:
        print(f"Image not found: {image_path}")


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
        
        # Segment everything with filtering
        print(f"Segmenting everything with grid_size={grid_size}...")
        masks = sam_everything.segment_everything(
            grid_size=grid_size, 
            min_mask_area=500,
            max_mask_area=width*height//8,  # 이미지 크기의 1/8 이하
            max_complexity_ratio=4.0,      # 원형에 비해 4배 이하의 복잡도
            min_solidity=0.4               # 40% 이상의 견고함
        )
        
        print(f"Found {len(masks)} masks (after filtering)")
        
        # Print mask statistics
        if masks:
            areas = [m['area'] for m in masks]
            complexities = [m['complexity_ratio'] for m in masks]
            solidities = [m['solidity'] for m in masks]
            
            print(f"Area range: {min(areas)} - {max(areas)}")
            print(f"Complexity ratio range: {min(complexities):.2f} - {max(complexities):.2f}")
            print(f"Solidity range: {min(solidities):.2f} - {max(solidities):.2f}")
        
        # Visualize results
        sam_everything.visualize_masks(masks)
        # Save in different formats
        sam_everything.save_masks_coco_format(masks, f"{image_name}_{model_type}_{grid_size}.json", 
                                            image_name, image_id=1)
        
    else:
        print(f"Image not found: {image_path}")


def process_folder_with_relations(input_folder: str, output_folder: str,
                                grid_sizes: List[int] = [32, 16, 8], 
                                model_type: str = "vit_h"):
    """
    Process all images in a folder with multi-scale SAM and parent-child relationships
    
    Args:
        input_folder: Path to input folder containing images
        output_folder: Path to output folder for JSON files
        grid_sizes: List of grid sizes for multi-scale processing
        model_type: SAM model type ("vit_h", "vit_l", "vit_b")
    """
    print(f"Starting folder processing with SAM Everything")
    print(f"Input folder: {input_folder}")
    print(f"Output folder: {output_folder}")
    print(f"Model: {model_type}, Grid sizes: {grid_sizes}")
    
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    # Initialize SAM Everything (only once for all images)
    print("Initializing SAM model...")
    sam_everything = SAMEverything(model_type=model_type)
    
    # Supported image extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'}
    
    # Get all image files in the input folder
    image_files = []
    for filename in os.listdir(input_folder):
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext in image_extensions:
            image_files.append(filename)
    
    if not image_files:
        print(f"No image files found in {input_folder}")
        return
    
    print(f"Found {len(image_files)} image files to process")
    
    # Process each image
    for i, image_filename in enumerate(image_files, 1):
        image_path = os.path.join(input_folder, image_filename)
        
        print(f"\n[{i}/{len(image_files)}] Processing: {image_filename}")
        
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                print(f"  Failed to load image: {image_path}")
                continue
                
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            height, width = image.shape[:2]
            print(f"  Image size: {width}x{height}")
            
            # Set image for SAM
            sam_everything.set_image(image)
            
            # Multi-scale segmentation with relationships
            print(f"  Processing multi-scale segmentation...")
            masks_with_relations = sam_everything.segment_everything_multi_scale(
                grid_sizes=grid_sizes,
                min_mask_area=500,
                max_mask_area=width*height//8,
                max_complexity_ratio=4.0,
                min_solidity=0.4,
                iou_threshold=0.7
            )
            
            print(f"  Found {len(masks_with_relations)} masks with relationships")
            
            # Generate output filename
            base_name = os.path.splitext(image_filename)[0]
            output_filename = f"{base_name}_relations_{'-'.join(map(str, grid_sizes))}.json"
            output_path = os.path.join(output_folder, output_filename)
            
            # Save results
            sam_everything.save_masks_coco_format_with_relations(
                masks_with_relations, output_path, image_filename, image_id=i, grid_sizes=grid_sizes
            )
            
            print(f"  Results saved to: {output_filename}")
            
            # Print statistics
            grid_stats = {}
            for mask in masks_with_relations:
                grid_size = mask['grid_size']
                if grid_size not in grid_stats:
                    grid_stats[grid_size] = 0
                grid_stats[grid_size] += 1
            
            print("  Masks by grid size:")
            for grid_size in sorted(grid_stats.keys(), reverse=True):
                print(f"    Grid {grid_size}: {grid_stats[grid_size]} masks")
            
        except Exception as e:
            print(f"  Error processing {image_filename}: {e}")
            continue
    
    print(f"\nFolder processing completed!")
    print(f"Processed {len(image_files)} images")
    print(f"Results saved to: {output_folder}")


def process_folder_simple(input_folder: str, output_folder: str,
                         grid_size: int = 64, model_type: str = "vit_h"):
    """
    Process all images in a folder with simple SAM segmentation
    
    Args:
        input_folder: Path to input folder containing images
        output_folder: Path to output folder for JSON files
        grid_size: Grid size for segmentation
        model_type: SAM model type ("vit_h", "vit_l", "vit_b")
    """
    print(f"Starting folder processing with SAM Everything (Simple)")
    print(f"Input folder: {input_folder}")
    print(f"Output folder: {output_folder}")
    print(f"Model: {model_type}, Grid size: {grid_size}")
    
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    # Initialize SAM Everything (only once for all images)
    print("Initializing SAM model...")
    sam_everything = SAMEverything(model_type=model_type)
    
    # Supported image extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'}
    
    # Get all image files in the input folder
    image_files = []
    for filename in os.listdir(input_folder):
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext in image_extensions:
            image_files.append(filename)
    
    if not image_files:
        print(f"No image files found in {input_folder}")
        return
    
    print(f"Found {len(image_files)} image files to process")
    
    # Process each image
    for i, image_filename in enumerate(image_files, 1):
        image_path = os.path.join(input_folder, image_filename)
        
        print(f"\n[{i}/{len(image_files)}] Processing: {image_filename}")
        
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                print(f"  Failed to load image: {image_path}")
                continue
                
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            height, width = image.shape[:2]
            print(f"  Image size: {width}x{height}")
            
            # Set image for SAM
            sam_everything.set_image(image)
            
            # Segment everything
            print(f"  Segmenting everything with grid_size={grid_size}...")
            masks = sam_everything.segment_everything(
                grid_size=grid_size, 
                min_mask_area=500,
                max_mask_area=width*height//8,
                max_complexity_ratio=4.0,
                min_solidity=0.4
            )
            
            print(f"  Found {len(masks)} masks")
            
            # Generate output filename
            base_name = os.path.splitext(image_filename)[0]
            output_filename = f"{base_name}_{model_type}_{grid_size}.json"
            output_path = os.path.join(output_folder, output_filename)
            
            # Save results
            sam_everything.save_masks_coco_format(masks, output_path, image_filename, image_id=i)
            
            print(f"  Results saved to: {output_filename}")
            
        except Exception as e:
            print(f"  Error processing {image_filename}: {e}")
            continue
    
    print(f"\nFolder processing completed!")
    print(f"Processed {len(image_files)} images")
    print(f"Results saved to: {output_folder}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='SAM Everything with Relations - Multi-scale segmentation with parent-child relationships')
    parser.add_argument('--input', type=str, required=True, help='Path to input image or folder')
    parser.add_argument('--output', type=str, default='./test', help='Path to output folder (default: ./test)')
    parser.add_argument('--grid_sizes', type=int, nargs='+', default=[32, 16, 8], 
                        help='Grid sizes for multi-scale processing (default: 32 16 8)')
    parser.add_argument('--model_type', type=str, default='vit_h', choices=['vit_h', 'vit_l', 'vit_b'], 
                        help='SAM model type (default: vit_h)')
    parser.add_argument('--relations', action='store_true', default=True,
                        help='Enable parent-child relationship processing (default: True)')
    parser.add_argument('--simple', action='store_true', default=False,
                        help='Use simple segmentation instead of multi-scale with relations')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("SAM Everything with Parent-Child Relations")
    print("=" * 60)
    print(f"Model: {args.model_type}")
    print(f"Input: {args.input}")
    print(f"Output: {args.output}")
    print(f"Grid sizes: {args.grid_sizes}")
    print(f"Relations: {args.relations}")
    print(f"Simple mode: {args.simple}")
    print("=" * 60)
    
    # Check if input is a file or folder
    if os.path.isfile(args.input):
        # Single file processing
        print("Processing single file...")
        if args.relations and not args.simple:
            demo_sam_everything_with_relations(args.input, args.grid_sizes, args.model_type)
        else:
            demo_sam_everything(args.input, args.grid_sizes[0], args.model_type)
    elif os.path.isdir(args.input):
        # Folder processing
        print("Processing folder...")
        if args.relations and not args.simple:
            process_folder_with_relations(args.input, args.output, args.grid_sizes, args.model_type)
        else:
            process_folder_simple(args.input, args.output, args.grid_sizes[0], args.model_type)
    else:
        print(f"Error: Input path '{args.input}' is neither a file nor a directory")
        exit(1)
