"""
TensorFlow Inference Service

This module provides inference capabilities for TensorFlow/Keras models
with image preprocessing and result analysis.
"""

import os
import logging
from typing import Dict, Any, List, Tuple, Optional, Union
import numpy as np
from pathlib import Path
import tempfile

import tensorflow as tf
from PIL import Image
import cv2

# Configure logging
logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """Handles image preprocessing for ML model inference."""
    
    @staticmethod
    def load_image(image_path_or_bytes: Union[str, bytes, np.ndarray]) -> np.ndarray:
        """
        Load image from various input types.
        
        Args:
            image_path_or_bytes: Image file path, bytes data, or numpy array
            
        Returns:
            Loaded image as numpy array
        """
        try:
            if isinstance(image_path_or_bytes, str):
                # Load from file path
                if not os.path.exists(image_path_or_bytes):
                    raise FileNotFoundError(f"Image file not found: {image_path_or_bytes}")
                
                image = Image.open(image_path_or_bytes)
                return np.array(image)
                
            elif isinstance(image_path_or_bytes, bytes):
                # Load from bytes
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                    tmp_file.write(image_path_or_bytes)
                    tmp_file.flush()
                    
                    image = Image.open(tmp_file.name)
                    result = np.array(image)
                    
                    # Clean up temporary file
                    os.unlink(tmp_file.name)
                    return result
                    
            elif isinstance(image_path_or_bytes, np.ndarray):
                # Already a numpy array
                return image_path_or_bytes
                
            else:
                raise ValueError(f"Unsupported input type: {type(image_path_or_bytes)}")
                
        except Exception as e:
            logger.error(f"Failed to load image: {str(e)}")
            raise
    
    @staticmethod
    def preprocess_for_model(
        image: np.ndarray,
        target_size: Tuple[int, int] = (224, 224),
        normalize: bool = True,
        scale_factor: float = 255.0,
        channel_order: str = 'RGB'
    ) -> np.ndarray:
        """
        Preprocess image for model inference.
        
        Args:
            image: Input image as numpy array
            target_size: Target size (height, width)
            normalize: Whether to normalize pixel values to [0, 1]
            scale_factor: Factor to divide pixel values by
            channel_order: Color channel order ('RGB' or 'BGR')
            
        Returns:
            Preprocessed image ready for model inference
        """
        try:
            # Convert to RGB if needed
            if len(image.shape) == 3 and image.shape[2] == 3:
                if channel_order == 'BGR':
                    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize image
            if target_size != image.shape[:2]:
                image = cv2.resize(image, target_size, interpolation=cv2.INTER_AREA)
            
            # Convert to float32
            image = image.astype(np.float32)
            
            # Normalize if requested
            if normalize:
                image = image / scale_factor
            
            # Add batch dimension
            image = np.expand_dims(image, axis=0)
            
            logger.info(f"Preprocessed image shape: {image.shape}")
            return image
            
        except Exception as e:
            logger.error(f"Failed to preprocess image: {str(e)}")
            raise
    
    @staticmethod
    def preprocess_for_dense_model(
        image: np.ndarray,
        target_size: Tuple[int, int] = (28, 28),
        flatten: bool = True,
        normalize: bool = True
    ) -> np.ndarray:
        """
        Preprocess image for dense/fully-connected models (like MNIST).
        
        Args:
            image: Input image as numpy array
            target_size: Target size (height, width)
            flatten: Whether to flatten the image
            normalize: Whether to normalize pixel values
            
        Returns:
            Preprocessed image ready for dense model inference
        """
        try:
            # Convert to grayscale if needed
            if len(image.shape) == 3:
                image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Resize image
            if target_size != image.shape[:2]:
                image = cv2.resize(image, target_size, interpolation=cv2.INTER_AREA)
            
            # Convert to float32
            image = image.astype(np.float32)
            
            # Normalize
            if normalize:
                image = image / 255.0
            
            # Flatten if requested
            if flatten:
                image = image.flatten()
            
            # Add batch dimension
            image = np.expand_dims(image, axis=0)
            
            logger.info(f"Preprocessed dense model input shape: {image.shape}")
            return image
            
        except Exception as e:
            logger.error(f"Failed to preprocess image for dense model: {str(e)}")
            raise


class TensorFlowInferenceService:
    """Service for running TensorFlow model inference."""
    
    def __init__(self):
        """Initialize the TensorFlow inference service."""
        self.model: Optional[tf.keras.Model] = None
        self.model_path: Optional[str] = None
        self.model_info: Dict[str, Any] = {}
        self.preprocessor = ImagePreprocessor()
        
        # Configure TensorFlow
        tf.get_logger().setLevel('ERROR')  # Reduce TF logging
    
    def load_model(self, model_path: str) -> Dict[str, Any]:
        """
        Load a TensorFlow/Keras model from file.
        
        Args:
            model_path: Path to the .h5 model file
            
        Returns:
            Dictionary containing model information
        """
        try:
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            logger.info(f"Loading TensorFlow model from: {model_path}")
            
            # Load the model
            self.model = tf.keras.models.load_model(model_path)
            self.model_path = model_path
            
            # Extract model information
            self.model_info = self._extract_model_info()
            
            logger.info(f"Successfully loaded model: {self.model_info}")
            return self.model_info
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def _extract_model_info(self) -> Dict[str, Any]:
        """Extract information from the loaded model."""
        if self.model is None:
            raise ValueError("No model loaded")
        
        try:
            # Get model summary information - safely
            try:
                input_shape = self.model.input_shape
            except Exception:
                try:
                    # Try alternative method
                    input_shape = self.model.layers[0].input_shape if self.model.layers else 'Unknown'
                except Exception:
                    input_shape = 'Unknown'
            
            try:
                output_shape = self.model.output_shape
            except Exception:
                try:
                    # Try alternative method
                    output_shape = self.model.layers[-1].output_shape if self.model.layers else 'Unknown'
                except Exception:
                    output_shape = 'Unknown'
            
            # Count parameters - safely
            try:
                total_params = self.model.count_params()
            except Exception:
                total_params = 0
            
            # Get layer information
            layers_info = []
            for i, layer in enumerate(self.model.layers):
                # Safely get output shape
                try:
                    if hasattr(layer, 'output_shape'):
                        output_shape = layer.output_shape
                    elif hasattr(layer, 'output'):
                        # Try to get shape from output tensor
                        if hasattr(layer.output, 'shape'):
                            output_shape = layer.output.shape
                        else:
                            output_shape = 'Unknown'
                    else:
                        output_shape = 'Unknown'
                except Exception:
                    output_shape = 'Unknown'
                
                # Safely get parameter count
                try:
                    params = layer.count_params()
                except Exception:
                    params = 0
                
                layer_info = {
                    'index': i,
                    'name': layer.name,
                    'type': type(layer).__name__,
                    'output_shape': output_shape,
                    'params': params
                }
                layers_info.append(layer_info)
            
            return {
                'input_shape': input_shape,
                'output_shape': output_shape,
                'total_params': total_params,
                'num_layers': len(self.model.layers),
                'layers': layers_info,
                'model_type': self._detect_model_type()
            }
            
        except Exception as e:
            logger.error(f"Failed to extract model info: {str(e)}")
            raise
    
    def _detect_model_type(self) -> str:
        """Detect the type of model (dense, convolutional, etc.)."""
        if self.model is None:
            return "unknown"
        
        layer_types = [type(layer).__name__ for layer in self.model.layers]
        
        if any('Conv' in layer_type for layer_type in layer_types):
            return "convolutional"
        elif any('Dense' in layer_type for layer_type in layer_types):
            return "dense"
        else:
            return "other"
    
    def predict_with_image(
        self,
        image_input: Union[str, bytes, np.ndarray],
        preprocessing_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Run inference on an image input.
        
        Args:
            image_input: Image file path, bytes data, or numpy array
            preprocessing_config: Configuration for image preprocessing
            
        Returns:
            Dictionary containing inference results
        """
        if self.model is None:
            raise ValueError("No model loaded. Call load_model() first.")
        
        try:
            # Default preprocessing config
            if preprocessing_config is None:
                preprocessing_config = self._get_default_preprocessing_config()
            
            # Load and preprocess image
            image = self.preprocessor.load_image(image_input)
            
            # Choose preprocessing based on model type
            if self.model_info.get('model_type') == 'dense':
                processed_image = self.preprocessor.preprocess_for_dense_model(
                    image,
                    target_size=preprocessing_config.get('target_size', (28, 28)),
                    flatten=preprocessing_config.get('flatten', True),
                    normalize=preprocessing_config.get('normalize', True)
                )
            else:
                processed_image = self.preprocessor.preprocess_for_model(
                    image,
                    target_size=preprocessing_config.get('target_size', (224, 224)),
                    normalize=preprocessing_config.get('normalize', True),
                    scale_factor=preprocessing_config.get('scale_factor', 255.0)
                )
            
            # Run inference
            logger.info("Running TensorFlow inference...")
            predictions = self.model.predict(processed_image, verbose=0)
            
            # Process results
            results = self._process_inference_results(predictions, processed_image)
            
            logger.info(f"Inference completed. Predicted class: {results['argmax']}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to run inference: {str(e)}")
            raise
    
    def _get_default_preprocessing_config(self) -> Dict[str, Any]:
        """Get default preprocessing configuration based on model type."""
        model_type = self.model_info.get('model_type', 'dense')
        input_shape = self.model_info.get('input_shape', [])
        
        # Safe handling of input_shape
        try:
            if model_type == 'dense':
                # For dense models - get exact input dimension from model
                target_size = self._get_dense_model_target_size()
                
                return {
                    'target_size': target_size,
                    'flatten': True,
                    'normalize': True
                }
            else:
                # For convolutional models
                if input_shape and input_shape != 'Unknown' and len(input_shape) >= 3:
                    try:
                        if isinstance(input_shape, (list, tuple)):
                            # input_shape is usually (None, height, width, channels)
                            height = input_shape[1] if len(input_shape) > 1 and input_shape[1] is not None else 224
                            width = input_shape[2] if len(input_shape) > 2 and input_shape[2] is not None else 224
                            target_size = (height, width)
                        else:
                            target_size = (224, 224)
                    except (IndexError, TypeError):
                        target_size = (224, 224)
                else:
                    target_size = (224, 224)
                
                return {
                    'target_size': target_size,
                    'normalize': True,
                    'scale_factor': 255.0
                }
        except Exception as e:
            logger.warning(f"Error in preprocessing config: {e}, using defaults")
            # Return safe defaults
            return {
                'target_size': (28, 28),
                'flatten': True,
                'normalize': True
            }
    
    def _get_dense_model_target_size(self) -> tuple:
        """Get the correct target size for dense models by analyzing the actual input dimension."""
        try:
            if self.model is None:
                return (28, 28)
            
            # Try to get the exact input dimension from the first layer
            input_dim = None
            
            # Method 1: Try from model.input_shape
            if hasattr(self.model, 'input_shape') and self.model.input_shape:
                input_shape = self.model.input_shape
                if isinstance(input_shape, (list, tuple)) and len(input_shape) >= 2:
                    input_dim = input_shape[-1]
            
            # Method 2: Try from first layer
            if input_dim is None and self.model.layers:
                first_layer = self.model.layers[0]
                if hasattr(first_layer, 'input_shape') and first_layer.input_shape:
                    input_shape = first_layer.input_shape
                    if isinstance(input_shape, (list, tuple)) and len(input_shape) >= 2:
                        input_dim = input_shape[-1]
                
                # Also try getting from weights
                if input_dim is None and hasattr(first_layer, 'get_weights'):
                    try:
                        weights = first_layer.get_weights()
                        if weights and len(weights) > 0:
                            # First weight matrix shape is (input_dim, output_dim)
                            input_dim = weights[0].shape[0]
                    except Exception:
                        pass
            
            # Calculate target size from input dimension
            if input_dim and isinstance(input_dim, (int, float)) and input_dim > 0:
                # Common input dimensions and their corresponding image sizes
                if input_dim == 784:  # 28x28
                    return (28, 28)
                elif input_dim == 196:  # 14x14
                    return (14, 14)
                elif input_dim == 1024:  # 32x32
                    return (32, 32)
                elif input_dim == 400:  # 20x20
                    return (20, 20)
                else:
                    # Try to find square root
                    sqrt_dim = int(np.sqrt(input_dim))
                    if sqrt_dim * sqrt_dim == input_dim:
                        return (sqrt_dim, sqrt_dim)
                    else:
                        # If not a perfect square, use closest reasonable size
                        logger.warning(f"Input dimension {input_dim} is not a perfect square, using default")
                        return (28, 28)
            
            logger.warning("Could not determine input dimension, using default (28, 28)")
            return (28, 28)
            
        except Exception as e:
            logger.error(f"Error determining target size: {e}")
            return (28, 28)
    
    def _process_inference_results(
        self,
        predictions: np.ndarray,
        input_image: np.ndarray
    ) -> Dict[str, Any]:
        """Process and format inference results."""
        try:
            # Ensure predictions is 2D (batch_size, num_classes)
            if len(predictions.shape) == 1:
                predictions = predictions.reshape(1, -1)
            
            # Get first prediction (batch size should be 1)
            pred = predictions[0]
            
            # Calculate metrics
            argmax_idx = int(np.argmax(pred))
            max_confidence = float(np.max(pred))
            
            # Apply softmax if not already applied (check if sum ≈ 1)
            if not np.isclose(np.sum(pred), 1.0, rtol=1e-3):
                # Apply softmax
                exp_pred = np.exp(pred - np.max(pred))
                softmax_pred = exp_pred / np.sum(exp_pred)
            else:
                softmax_pred = pred
            
            return {
                'raw_output': pred.tolist(),
                'softmax_output': softmax_pred.tolist(),
                'prediction': softmax_pred.tolist(),  # For compatibility
                'argmax': argmax_idx,
                'confidence': float(softmax_pred[argmax_idx]),
                'max_confidence': max_confidence,
                'input_shape': input_image.shape,
                'num_classes': len(pred),
                'class_probabilities': {
                    str(i): float(prob) for i, prob in enumerate(softmax_pred)
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to process inference results: {str(e)}")
            raise
    
    def predict_with_numpy_input(self, input_array: np.ndarray) -> Dict[str, Any]:
        """
        Run inference with direct numpy array input.
        
        Args:
            input_array: Direct input array for the model
            
        Returns:
            Dictionary containing inference results
        """
        if self.model is None:
            raise ValueError("No model loaded. Call load_model() first.")
        
        try:
            # Ensure correct shape (add batch dimension if needed)
            if len(input_array.shape) == 1:
                input_array = np.expand_dims(input_array, axis=0)
            
            logger.info(f"Running inference with input shape: {input_array.shape}")
            
            # Run inference
            predictions = self.model.predict(input_array, verbose=0)
            
            # Process results
            results = self._process_inference_results(predictions, input_array)
            
            logger.info(f"Inference completed. Predicted class: {results['argmax']}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to run inference with numpy input: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the currently loaded model."""
        if self.model is None:
            raise ValueError("No model loaded")
        
        return self.model_info.copy()
    
    def is_model_loaded(self) -> bool:
        """Check if a model is currently loaded."""
        return self.model is not None
    
    def unload_model(self):
        """Unload the current model to free memory."""
        if self.model is not None:
            del self.model
            self.model = None
            self.model_path = None
            self.model_info = {}
            logger.info("Model unloaded successfully")


class TensorFlowInferenceManager:
    """High-level manager for TensorFlow inference operations."""
    
    def __init__(self):
        """Initialize the inference manager."""
        self.service = TensorFlowInferenceService()
        self.current_model_path: Optional[str] = None
    
    def setup_model_for_inference(self, model_path: str) -> Dict[str, Any]:
        """
        Set up a model for inference testing.
        
        Args:
            model_path: Path to the .h5 model file
            
        Returns:
            Model information and setup status
        """
        try:
            # Load the model
            model_info = self.service.load_model(model_path)
            self.current_model_path = model_path
            
            return {
                'success': True,
                'model_info': model_info,
                'model_path': model_path,
                'setup_complete': True
            }
            
        except Exception as e:
            logger.error(f"Failed to setup model: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'model_path': model_path,
                'setup_complete': False
            }
    
    def run_inference_test(
        self,
        image_input: Union[str, bytes, np.ndarray, None] = None,
        numpy_input: Optional[np.ndarray] = None,
        preprocessing_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Run a comprehensive inference test.
        
        Args:
            image_input: Image input for inference
            numpy_input: Direct numpy array input (alternative to image)
            preprocessing_config: Image preprocessing configuration
            
        Returns:
            Comprehensive inference results
        """
        if not self.service.is_model_loaded():
            raise ValueError("No model loaded. Call setup_model_for_inference() first.")
        
        try:
            # Choose input type
            if numpy_input is not None:
                # Use direct numpy input
                results = self.service.predict_with_numpy_input(numpy_input)
                input_type = "numpy_array"
                input_info = {"shape": numpy_input.shape, "dtype": str(numpy_input.dtype)}
                
            elif image_input is not None:
                # Use image input
                results = self.service.predict_with_image(image_input, preprocessing_config)
                input_type = "image"
                input_info = {"input_shape": results.get('input_shape')}
                
            else:
                raise ValueError("Either image_input or numpy_input must be provided")
            
            # Add metadata
            results.update({
                'input_type': input_type,
                'input_info': input_info,
                'model_path': self.current_model_path,
                'model_info': self.service.get_model_info(),
                'inference_engine': 'tensorflow',
                'success': True
            })
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to run inference test: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'inference_engine': 'tensorflow'
            } 