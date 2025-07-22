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
    
    def __init__(self, checkpoint_path: str = None, model_type: str = "vit_h", gpu_id: int = None):
        """
        Initialize SAM Everything with specified model
        
        Args:
            checkpoint_path: Path to SAM checkpoint file
            model_type: Type of SAM model ("vit_h", "vit_l", "vit_b") - default: "vit_h"
            gpu_id: GPU device ID to use (None for auto, -1 for CPU, 0, 1, 2, etc. for specific GPU)
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
        
        # GPU 설정
        self.device = self._setup_device(gpu_id)
        
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
    
    def _setup_device(self, gpu_id: int = None) -> torch.device:
        """
        Setup device (GPU/CPU) based on gpu_id parameter
        
        Args:
            gpu_id: GPU device ID (None for auto, -1 for CPU, 0, 1, 2, etc. for specific GPU)
            
        Returns:
            torch.device: Selected device
        """
        if gpu_id is None:
            # Auto selection: use first available GPU, fallback to CPU
            if torch.cuda.is_available():
                device = torch.device("cuda:0")
                print(f"Auto-selected GPU 0: {torch.cuda.get_device_name(0)}")
            else:
                device = torch.device("cpu")
                print("No GPU available, using CPU")
        elif gpu_id == -1:
            # Force CPU
            device = torch.device("cpu")
            print("Forced to use CPU")
        else:
            # Use specific GPU
            if not torch.cuda.is_available():
                print(f"GPU {gpu_id} requested but CUDA not available, falling back to CPU")
                device = torch.device("cpu")
            elif gpu_id >= torch.cuda.device_count():
                print(f"GPU {gpu_id} not available (only {torch.cuda.device_count()} GPUs), using GPU 0")
                device = torch.device("cuda:0")
            else:
                device = torch.device(f"cuda:{gpu_id}")
                print(f"Using GPU {gpu_id}: {torch.cuda.get_device_name(gpu_id)}")
        
        # Print GPU information if using CUDA
        if device.type == "cuda":
            print(f"GPU Memory: {torch.cuda.get_device_properties(device).total_memory / 1024**3:.1f} GB")
            print(f"Available GPU Memory: {torch.cuda.memory_allocated(device) / 1024**3:.1f} GB allocated")
        
        return device

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
        
        # Process each point with progress tracking and memory management
        print(f"Processing {len(points)} points with grid_size={grid_size}...")
        
        # Process points in batches to manage memory
        batch_size = 500  # 한 번에 50개씩 처리
        
        for batch_start in range(0, len(points), batch_size):
            batch_end = min(batch_start + batch_size, len(points))
            batch_points = points[batch_start:batch_end]
            
            print(f"  Processing batch {batch_start//batch_size + 1}/{(len(points) + batch_size - 1)//batch_size} (points {batch_start}-{batch_end-1})")
            
            for i, point in enumerate(batch_points):
                global_point_idx = batch_start + i
                # Progress tracking every 100 points with memory monitoring
                if global_point_idx % 100 == 0:
                    # GPU memory monitoring
                    gpu_memory_info = ""
                    if self.device.type == "cuda":
                        allocated = torch.cuda.memory_allocated(self.device) / 1024**3
                        reserved = torch.cuda.memory_reserved(self.device) / 1024**3
                        gpu_memory_info = f", GPU: {allocated:.1f}GB allocated, {reserved:.1f}GB reserved"
                    
                    # RAM monitoring
                    import psutil
                    ram_usage = psutil.virtual_memory()
                    ram_info = f", RAM: {ram_usage.percent:.1f}% used ({ram_usage.used/1024**3:.1f}GB/{ram_usage.total/1024**3:.1f}GB)"
                    
                    print(f"  Progress: {global_point_idx}/{len(points)} points processed{gpu_memory_info}{ram_info}")
                    
                    # Clear GPU cache every 500 points to prevent memory buildup
                    if global_point_idx % 500 == 0 and global_point_idx > 0 and self.device.type == "cuda":
                        torch.cuda.empty_cache()
                        print(f"    GPU cache cleared at point {global_point_idx}")
                
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
                    
                    # Calculate bounding box first to filter out masks that are too large
                    bbox = self._mask_to_bbox(best_mask)
                    bbox_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                    
                    # Filter by bounding box area to reduce memory usage
                    if bbox_area > max_mask_area:
                        continue
                    
                    # Store mask in sparse format to save memory
                    # Only store the coordinates where mask is True
                    mask_coords = np.where(best_mask)
                    if len(mask_coords[0]) == 0:
                        continue
                    
                    # Use numpy arrays instead of Python lists for efficiency
                    mask_dict = {
                        'segmentation_sparse': {
                            'rows': mask_coords[0],  # numpy array (더 효율적)
                            'cols': mask_coords[1],  # numpy array (더 효율적)
                            'shape': best_mask.shape
                        },
                        'area': mask_area,
                        'score': float(best_score),
                        'point': point,
                        'bbox': bbox,
                        # Defer these calculations to save memory during processing
                        'complexity_ratio': None,  # Will be calculated later
                        'solidity': None,  # Will be calculated later
                        'needs_computation': True  # Flag to indicate computation is needed
                    }
                    all_masks.append(mask_dict)
                        
                except Exception as e:
                    print(f"Error processing point {point}: {e}")
                    continue
            
            # Memory cleanup after each batch
            import gc
            gc.collect()  # Python garbage collection
            if self.device.type == "cuda":
                torch.cuda.empty_cache()  # GPU cache cleanup
            
            # RAM monitoring after batch
            import psutil
            ram_usage = psutil.virtual_memory()
            print(f"    Batch completed. RAM: {ram_usage.percent:.1f}% used ({ram_usage.used/1024**3:.1f}GB/{ram_usage.total/1024**3:.1f}GB)")
            

        
        # Now compute complexity metrics for all masks at once
        print(f"Computing complexity metrics for {len(all_masks)} masks...")
        
        # Batch processing for complexity computation
        complexity_batch_size = 50
        for batch_start in range(0, len(all_masks), complexity_batch_size):
            batch_end = min(batch_start + complexity_batch_size, len(all_masks))
            batch_masks = all_masks[batch_start:batch_end]
            
            print(f"  Computing complexity for batch {batch_start//complexity_batch_size + 1}/{(len(all_masks) + complexity_batch_size - 1)//complexity_batch_size}")
            
            for i, mask_dict in enumerate(batch_masks):
                global_mask_idx = batch_start + i
                
                if mask_dict.get('needs_computation', False):
                    mask = mask_dict['segmentation_sparse'] # Use sparse mask
                    mask_dict['complexity_ratio'] = self._calculate_complexity_ratio(mask)
                    mask_dict['solidity'] = self._calculate_solidity(mask)
                    mask_dict['needs_computation'] = False
                
                # Progress tracking every 10 masks
                if global_mask_idx % 10 == 0:
                    print(f"    Complexity computation progress: {global_mask_idx}/{len(all_masks)}")
            
            # Memory cleanup after each complexity batch
            import gc
            gc.collect()
            if self.device.type == "cuda":
                torch.cuda.empty_cache()
        
        # Filter by complexity after computation
        print("Filtering masks by complexity...")
        filtered_masks = []
        for mask_dict in all_masks:
            complexity_ratio = mask_dict['complexity_ratio']
            solidity = mask_dict['solidity']
            
            if complexity_ratio <= max_complexity_ratio and solidity >= min_solidity:
                filtered_masks.append(mask_dict)
        
        # Remove duplicate masks
        all_masks = self._remove_duplicate_masks(filtered_masks)
        
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
                iou = self._calculate_iou(mask1['segmentation_sparse'], mask2['segmentation_sparse'])
                if iou > iou_threshold:
                    keep = False
                    break
            if keep:
                keep_masks.append(mask1)
        
        return keep_masks
    
    def _calculate_iou(self, mask1: np.ndarray, mask2: np.ndarray) -> float:
        """Calculate IoU between two masks"""
        # Convert sparse masks to dense if needed
        if isinstance(mask1, dict) and 'rows' in mask1:
            mask1 = self._sparse_to_dense_mask(mask1)
        if isinstance(mask2, dict) and 'rows' in mask2:
            mask2 = self._sparse_to_dense_mask(mask2)
        
        intersection = np.logical_and(mask1, mask2).sum()
        union = np.logical_or(mask1, mask2).sum()
        
        if union == 0:
            return 0.0
        
        return intersection / union

    def _sparse_to_dense_mask(self, sparse_mask):
        """Convert sparse mask format to dense numpy array"""
        if isinstance(sparse_mask, dict) and 'rows' in sparse_mask:
            # Sparse format
            rows = sparse_mask['rows']
            cols = sparse_mask['cols']
            shape = sparse_mask['shape']
            
            dense_mask = np.zeros(shape, dtype=bool)
            dense_mask[rows, cols] = True
            return dense_mask
        else:
            # Already dense format
            return sparse_mask
    
    def _calculate_complexity_ratio(self, mask: np.ndarray) -> float:
        """
        Calculate complexity ratio (perimeter^2 / area) to identify complex shapes
        Higher values indicate more complex/irregular shapes
        """
        import cv2
        
        # Convert sparse mask to dense if needed
        if isinstance(mask, dict) and 'rows' in mask:
            mask = self._sparse_to_dense_mask(mask)
        
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
        
        # Convert sparse mask to dense if needed
        if isinstance(mask, dict) and 'rows' in mask:
            mask = self._sparse_to_dense_mask(mask)
        
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
                min_mask_area=min_mask_area*grid_size,
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
                iou = self._calculate_iou(mask1['segmentation_sparse'], mask2['segmentation_sparse'])
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
            child_mask = potential_child['segmentation_sparse'] # Use sparse mask
            
            for j, potential_parent in enumerate(sorted_masks[:i]):  # Only check larger masks
                parent_mask = potential_parent['segmentation_sparse'] # Use sparse mask
                
                # Check if child is contained within parent
                if self._is_mask_contained(child_mask, parent_mask):
                    potential_child['parent_id'] = potential_parent['id']
                    potential_parent['child_ids'].append(potential_child['id'])
                    break  # Only assign one parent (the first/largest suitable one)
        
        return sorted_masks

    def _is_mask_contained(self, child_mask, parent_mask, 
                          containment_threshold: float = 0.8) -> bool:
        """
        Check if child_mask is spatially contained within parent_mask
        
        Args:
            child_mask: Smaller mask to check (can be sparse dict or dense array)
            parent_mask: Larger mask to check containment (can be sparse dict or dense array)
            containment_threshold: Minimum ratio of child area that must be within parent
            
        Returns:
            True if child is contained within parent
        """
        # Convert sparse masks to dense if needed
        if isinstance(child_mask, dict) and 'rows' in child_mask:
            child_mask = self._sparse_to_dense_mask(child_mask)
        if isinstance(parent_mask, dict) and 'rows' in parent_mask:
            parent_mask = self._sparse_to_dense_mask(parent_mask)
        
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
            # Convert sparse mask to dense for processing
            sparse_mask = mask_dict['segmentation_sparse']
            mask = self._sparse_to_dense_mask(sparse_mask)
            
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
                    
                    # Convert back to sparse format
                    component_coords = np.where(component_mask)
                    new_mask_dict = {
                        'segmentation_sparse': {
                            'rows': component_coords[0],  # numpy array
                            'cols': component_coords[1],  # numpy array
                            'shape': component_mask.shape
                        },
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
            # Convert sparse mask to dense for COCO format
            sparse_mask = mask_dict['segmentation_sparse']
            dense_mask = self._sparse_to_dense_mask(sparse_mask)
            
            # Convert mask to COCO RLE format
            mask_uint8 = dense_mask.astype(np.uint8)
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
            # Convert sparse mask to dense for visualization
            sparse_mask = mask_dict['segmentation_sparse']
            dense_mask = self._sparse_to_dense_mask(sparse_mask)
            color = colors[i]
            
            # Create colored mask
            colored_mask = np.zeros((*dense_mask.shape, 3))
            colored_mask[dense_mask] = color
            
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
            # Convert sparse mask to dense and then to list
            sparse_mask = mask_dict['segmentation_sparse']
            dense_mask = self._sparse_to_dense_mask(sparse_mask)
            
            serializable_dict = {
                'segmentation': dense_mask.tolist(),  # Convert to list for JSON
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
            # Convert sparse mask to dense for COCO format
            sparse_mask = mask_dict['segmentation_sparse']
            dense_mask = self._sparse_to_dense_mask(sparse_mask)
            
            # Convert mask to COCO RLE format
            mask_uint8 = dense_mask.astype(np.uint8)
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
            # Convert sparse mask to dense for polygon format
            sparse_mask = mask_dict['segmentation_sparse']
            dense_mask = self._sparse_to_dense_mask(sparse_mask)
            
            # Convert mask to polygon format
            polygons = self._mask_to_polygons(dense_mask)
            
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
            # Convert sparse mask to dense for visualization
            sparse_mask = mask_dict['segmentation_sparse']
            dense_mask = self._sparse_to_dense_mask(sparse_mask)
            color = colors[i][:3]  # RGB only
            
            colored_mask = np.zeros((*dense_mask.shape, 3))
            colored_mask[dense_mask] = color
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
        
        # Convert sparse mask to dense for visualization
        sparse_mask = mask_dict['segmentation_sparse']
        dense_mask = self._sparse_to_dense_mask(sparse_mask)
        colored_mask = np.zeros((*dense_mask.shape, 3))
        
        if color == 'red':
            colored_mask[dense_mask] = [1, 0, 0]
        elif color == 'green':
            colored_mask[dense_mask] = [0, 1, 0]
        elif color == 'blue':
            colored_mask[dense_mask] = [0, 0, 1]
        elif color == 'yellow':
            colored_mask[dense_mask] = [1, 1, 0]
        elif color == 'purple':
            colored_mask[dense_mask] = [1, 0, 1]
        else:  # orange
            colored_mask[dense_mask] = [1, 0.5, 0]
        
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




def process_folder_with_relations(input_folder: str, output_folder: str,
                                model_type: str = "vit_h",
                                gpu_id: int = None):
    """
    Process all images in a folder with multi-scale SAM and parent-child relationships
    Supports recursive processing of subdirectories
    
    Args:
        input_folder: Path to input folder containing images
        output_folder: Path to output folder for JSON files
        grid_sizes: List of grid sizes for multi-scale processing
        model_type: SAM model type ("vit_h", "vit_l", "vit_b")
        gpu_id: GPU device ID to use
    """
    print(f"Starting folder processing with SAM Everything")
    print(f"Input folder: {input_folder}")
    print(f"Output folder: {output_folder}")
    
    # Get the last folder name from input_folder
    input_folder_name = os.path.basename(input_folder)
    
    # Create output folder with input folder name
    final_output_folder = os.path.join(output_folder, input_folder_name)
    os.makedirs(final_output_folder, exist_ok=True)
    
    print(f"Final output folder: {final_output_folder}")
    
    # Initialize SAM Everything (only once for all images)
    print("Initializing SAM model...")
    sam_everything = SAMEverything(model_type=model_type, gpu_id=gpu_id)
    
    # Supported image extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'}
    
    # Get all image files recursively using os.walk
    image_files = []
    for root, dirs, files in os.walk(input_folder):
        for filename in files:
            file_ext = os.path.splitext(filename)[1].lower()
            if file_ext in image_extensions:
                # Get relative path from input_folder
                rel_path = os.path.relpath(root, input_folder)
                image_files.append((os.path.join(root, filename), rel_path, filename))
    
    if not image_files:
        print(f"No image files found in {input_folder}")
        return
    
    print(f"Found {len(image_files)} image files to process")
    
    # Process each image
    for i, (image_path, rel_path, image_filename) in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}] Processing: {image_path}")
        
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                print(f"  Failed to load image: {image_path}")
                continue
                
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            height, width = image.shape[:2]

            # 이미지 크기 출력
            # height와 width 중 큰 값의 제곱근 정수 부분 계산
            max_dimension = max(height, width)
            sqrt_max_dimension = int(max_dimension / 10)

            grid_sizes = [sqrt_max_dimension, sqrt_max_dimension//2, sqrt_max_dimension//4]
            print(f"  Image size: {width}x{height}")
            print(f"  Grid sizes: {grid_sizes}")



            print(f"  Image size: {width}x{height}")
            
            # Set image for SAM
            sam_everything.set_image(image)
            
            # Multi-scale segmentation with relationships
            print(f"  Processing multi-scale segmentation...")
            masks_with_relations = sam_everything.segment_everything_multi_scale(
                grid_sizes=grid_sizes,
                min_mask_area=2,
                max_mask_area=width*height//1.5,
                max_complexity_ratio=5.0,
                min_solidity=0.4,
                iou_threshold=0.7
            )
            
            print(f"  Found {len(masks_with_relations)} masks with relationships")
            
            # Create output directory structure matching input
            if rel_path == '.':
                # Image is in the root folder
                output_subdir = final_output_folder
            else:
                # Image is in a subfolder
                output_subdir = os.path.join(final_output_folder, rel_path)
                os.makedirs(output_subdir, exist_ok=True)
            
            # Generate output filename
            base_name = os.path.splitext(image_filename)[0]
            output_filename = f"{base_name}_relations_{'-'.join(map(str, grid_sizes))}.json"
            output_path = os.path.join(output_subdir, output_filename)
            
            # Create relative path for file_name in COCO format
            if rel_path == '.':
                coco_file_name = image_filename
            else:
                coco_file_name = os.path.join(rel_path, image_filename)
            
            # Save results
            sam_everything.save_masks_coco_format_with_relations(
                masks_with_relations, output_path, coco_file_name, image_id=i, grid_sizes=grid_sizes
            )
            
            print(f"  Results saved to: {output_path}")
            
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
            print(f"  Error processing {image_path}: {e}")
            continue
    
    print(f"\nFolder processing completed!")
    print(f"Processed {len(image_files)} images")
    print(f"Results saved to: {final_output_folder}")


def process_folder_simple(input_folder: str, output_folder: str,
                         grid_size: int = 64, model_type: str = "vit_h",
                         gpu_id: int = None):
    """
    Process all images in a folder with simple SAM segmentation
    Supports recursive processing of subdirectories
    
    Args:
        input_folder: Path to input folder containing images
        output_folder: Path to output folder for JSON files
        grid_size: Grid size for segmentation
        model_type: SAM model type ("vit_h", "vit_l", "vit_b")
        gpu_id: GPU device ID to use
    """
    print(f"Starting folder processing with SAM Everything (Simple)")
    print(f"Input folder: {input_folder}")
    print(f"Output folder: {output_folder}")
    print(f"Model: {model_type}, Grid size: {grid_size}")
    
    # Get the last folder name from input_folder
    input_folder_name = os.path.basename(input_folder)
    
    # Create output folder with input folder name
    final_output_folder = os.path.join(output_folder, input_folder_name)
    os.makedirs(final_output_folder, exist_ok=True)
    
    print(f"Final output folder: {final_output_folder}")
    
    # Initialize SAM Everything (only once for all images)
    print("Initializing SAM model...")
    sam_everything = SAMEverything(model_type=model_type, gpu_id=gpu_id)
    
    # Supported image extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'}
    
    # Get all image files recursively using os.walk
    image_files = []
    for root, dirs, files in os.walk(input_folder):
        for filename in files:
            file_ext = os.path.splitext(filename)[1].lower()
            if file_ext in image_extensions:
                # Get relative path from input_folder
                rel_path = os.path.relpath(root, input_folder)
                image_files.append((os.path.join(root, filename), rel_path, filename))
    
    if not image_files:
        print(f"No image files found in {input_folder}")
        return
    
    print(f"Found {len(image_files)} image files to process")
    
    # Process each image
    for i, (image_path, rel_path, image_filename) in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}] Processing: {image_path}")
        
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
            
            # Create output directory structure matching input
            if rel_path == '.':
                # Image is in the root folder
                output_subdir = final_output_folder
            else:
                # Image is in a subfolder
                output_subdir = os.path.join(final_output_folder, rel_path)
                os.makedirs(output_subdir, exist_ok=True)
            
            # Generate output filename
            base_name = os.path.splitext(image_filename)[0]
            output_filename = f"{base_name}_{model_type}_{grid_size}.json"
            output_path = os.path.join(output_subdir, output_filename)
            
            # Create relative path for file_name in COCO format
            if rel_path == '.':
                coco_file_name = image_filename
            else:
                coco_file_name = os.path.join(rel_path, image_filename)
            
            # Save results
            sam_everything.save_masks_coco_format(masks, output_path, coco_file_name, image_id=i)
            
            print(f"  Results saved to: {output_path}")
            
        except Exception as e:
            print(f"  Error processing {image_path}: {e}")
            continue
    
    print(f"\nFolder processing completed!")
    print(f"Processed {len(image_files)} images")
    print(f"Results saved to: {final_output_folder}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='SAM Everything with Relations - Multi-scale segmentation with parent-child relationships')
    parser.add_argument('--input', type=str, required=True, help='Path to input image or folder')
    parser.add_argument('--output', type=str, default='./test', help='Path to output folder (default: ./test)')
    parser.add_argument('--model_type', type=str, default='vit_h', choices=['vit_h', 'vit_l', 'vit_b'], 
                        help='SAM model type (default: vit_h)')
    parser.add_argument('--relations', action='store_true', default=True,
                        help='Enable parent-child relationship processing (default: True)')
    parser.add_argument('--gpu', type=int, default=None, 
                        help='GPU device ID to use (None for auto, -1 for CPU, 0, 1, 2, etc. for specific GPU)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("SAM Everything with Parent-Child Relations")
    print("=" * 60)
    print(f"Model: {args.model_type}")
    print(f"Input: {args.input}")
    print(f"Output: {args.output}")
    print(f"Relations: {args.relations}")
    print(f"GPU ID: {args.gpu}")
    print("=" * 60)
    
    # Debug: Check current working directory and input path
    print(f"Current working directory: {os.getcwd()}")
    print(f"Input path exists: {os.path.exists(args.input)}")
    print(f"Input path is file: {os.path.isfile(args.input)}")
    print(f"Input path is directory: {os.path.isdir(args.input)}")
    
    if os.path.isdir(args.input):
        print(f"Contents of input directory:")
        try:
            files = os.listdir(args.input)
            print(f"  Total files: {len(files)}")
            for i, file in enumerate(files[:10]):  # Show first 10 files
                print(f"    {i+1}: {file}")
            if len(files) > 10:
                print(f"    ... and {len(files) - 10} more files")
        except Exception as e:
            print(f"  Error listing directory: {e}")
    
    if os.path.isdir(args.input):
        # Folder processing
        print("Processing folder...")
        process_folder_with_relations(args.input, args.output, args.model_type, args.gpu)

    else:
        print(f"Error: Input path '{args.input}' is neither a file nor a directory")
        print(f"Please check if the path exists and you have permission to access it.")
        exit(1)
                    