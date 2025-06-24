"""
Model Conversion Service

This module handles the conversion of ML models to OpenGraph schema format
with enhanced metrics and error handling for the admin interface.
"""

import time
import traceback
from typing import Dict, Any, Optional
import json

from tensorflow.keras.models import load_model
from services.model_service import parse_model_file


class ConversionService:
    """Enhanced model conversion service with detailed metrics"""
    
    def __init__(self):
        self.schema_version = "1.0.0"
    
    def convert_model(self, file_path: str) -> Dict[str, Any]:
        """
        Convert model file to OpenGraph schema with detailed metrics
        
        Args:
            file_path: Path to the model file
            
        Returns:
            Dictionary containing conversion results and metrics
        """
        conversion_result = {
            'success': False,
            'converted_data': {},
            'metrics': {
                'conversion_time': 0.0,
                'layers_converted': 0,
                'parameters_converted': 0,
                'schema_version': self.schema_version
            },
            'error': None,
            'traceback': None
        }
        
        start_time = time.time()
        
        try:
            # Load and analyze the model first
            model = load_model(file_path)
            
            # Use existing conversion logic
            schema_data = parse_model_file(file_path)
            
            # Enhanced conversion with metrics
            conversion_result.update(
                self._enhance_conversion_with_metrics(model, schema_data)
            )
            
            conversion_result['success'] = True
            conversion_result['converted_data'] = schema_data
            
        except Exception as e:
            conversion_result['error'] = str(e)
            conversion_result['traceback'] = traceback.format_exc()
        
        finally:
            conversion_result['metrics']['conversion_time'] = time.time() - start_time
        
        return conversion_result
    
    def _enhance_conversion_with_metrics(self, model, schema_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance schema data with additional metrics and validation
        
        Args:
            model: Loaded Keras model
            schema_data: Basic schema data from conversion
            
        Returns:
            Enhanced metrics dictionary
        """
        metrics = {
            'layers_converted': 0,
            'parameters_converted': 0,
            'schema_version': self.schema_version
        }
        
        try:
            # Count layers and parameters
            if hasattr(model, 'layers'):
                dense_layers = [layer for layer in model.layers 
                              if 'Dense' in type(layer).__name__]
                metrics['layers_converted'] = len(dense_layers)
                
                # Count total parameters
                total_params = 0
                for layer in dense_layers:
                    if hasattr(layer, 'count_params'):
                        total_params += layer.count_params()
                
                metrics['parameters_converted'] = total_params
            
            # Add model metadata if missing
            schema_data = self._add_default_metadata(schema_data, model)
            
        except Exception as e:
            print(f"Error enhancing conversion: {e}")
        
        return {'metrics': metrics}
    
    def _add_default_metadata(self, schema_data: Dict[str, Any], model) -> Dict[str, Any]:
        """
        Add default metadata to schema if missing
        
        Args:
            schema_data: Schema data dictionary
            model: Loaded Keras model
            
        Returns:
            Enhanced schema data
        """
        # Set default name if missing
        if 'name' not in schema_data or not schema_data['name']:
            schema_data['name'] = "Converted Model"
        
        # Set default description if missing
        if 'description' not in schema_data or not schema_data['description']:
            layer_count = len(getattr(model, 'layers', []))
            param_count = model.count_params() if hasattr(model, 'count_params') else 0
            schema_data['description'] = (
                f"Neural network with {layer_count} layers and "
                f"{param_count:,} parameters, converted to OpenGraph format"
            )
        
        # Set default task type if missing
        if 'task_type' not in schema_data or not schema_data['task_type']:
            # Try to infer task type from output shape
            if hasattr(model, 'output_shape') and model.output_shape:
                output_dim = model.output_shape[-1] if model.output_shape[-1] else 1
                if output_dim == 1:
                    schema_data['task_type'] = "regression"
                else:
                    schema_data['task_type'] = "classification"
            else:
                schema_data['task_type'] = "unknown"
        
        # Ensure scale is set
        if 'scale' not in schema_data:
            schema_data['scale'] = 2  # Default scale
        
        return schema_data
    
    def validate_conversion_integrity(self, original_model_path: str, 
                                    converted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate the integrity of the conversion by comparing dimensions
        
        Args:
            original_model_path: Path to original model
            converted_data: Converted schema data
            
        Returns:
            Validation results
        """
        validation_result = {
            'is_valid': True,
            'checks': [],
            'errors': [],
            'warnings': []
        }
        
        try:
            model = load_model(original_model_path)
            
            # Check layer count consistency
            dense_layers = [layer for layer in model.layers 
                          if 'Dense' in type(layer).__name__]
            expected_layers = len(dense_layers)
            actual_layers = len(converted_data.get('layer_dimensions', []))
            
            if expected_layers != actual_layers:
                validation_result['errors'].append(
                    f"Layer count mismatch: expected {expected_layers}, got {actual_layers}"
                )
                validation_result['is_valid'] = False
            else:
                validation_result['checks'].append("Layer count matches")
            
            # Check parameter count consistency
            original_params = sum(layer.count_params() for layer in dense_layers 
                                if hasattr(layer, 'count_params'))
            
            converted_weights = converted_data.get('weightsMagnitudes', [])
            converted_biases = converted_data.get('biasesMagnitudes', [])
            converted_params = sum(len(w) for w in converted_weights) + sum(len(b) for b in converted_biases)
            
            if original_params != converted_params:
                validation_result['warnings'].append(
                    f"Parameter count difference: original {original_params}, converted {converted_params}"
                )
            else:
                validation_result['checks'].append("Parameter count matches")
            
            # Check dimensional consistency
            layer_dims = converted_data.get('layerDimensions', [])
            for i, layer in enumerate(dense_layers):
                if i < len(layer_dims):
                    expected_input = layer.input_shape[-1] if layer.input_shape else None
                    expected_output = layer.output_shape[-1] if layer.output_shape else None
                    actual_input, actual_output = layer_dims[i]
                    
                    if expected_input and expected_input != actual_input:
                        validation_result['errors'].append(
                            f"Layer {i} input dimension mismatch: expected {expected_input}, got {actual_input}"
                        )
                        validation_result['is_valid'] = False
                    
                    if expected_output and expected_output != actual_output:
                        validation_result['errors'].append(
                            f"Layer {i} output dimension mismatch: expected {expected_output}, got {actual_output}"
                        )
                        validation_result['is_valid'] = False
            
            if validation_result['is_valid'] and not validation_result['errors']:
                validation_result['checks'].append("All dimensional checks passed")
                
        except Exception as e:
            validation_result['errors'].append(f"Integrity validation error: {str(e)}")
            validation_result['is_valid'] = False
        
        return validation_result 