"""
Model Validation Service

This module provides comprehensive validation for ML models and converted schemas.
"""

import os
import time
from typing import Dict, Any, List, Optional
import traceback

import h5py
import tensorflow as tf
from tensorflow.keras.models import load_model


class ModelValidator:
    """Validates ML models and conversion results"""
    
    def __init__(self):
        self.supported_formats = ['.h5']
        self.required_schema_fields = [
            'layerDimensions', 'weightsMagnitudes', 'weightsSigns', 
            'biasesMagnitudes', 'biasesSigns', 'scale'
        ]
        # Optional fields that will be added by conversion service if missing
        self.optional_fields = ['name', 'description', 'task_type']
    
    def validate_file(self, file_path: str) -> Dict[str, Any]:
        """
        Validate uploaded model file
        
        Args:
            file_path: Path to the uploaded file
            
        Returns:
            Dictionary containing validation results
        """
        validation_result = {
            'is_valid': False,
            'file_size': 0,
            'errors': [],
            'warnings': []
        }
        
        try:
            # Check file existence
            if not os.path.exists(file_path):
                validation_result['errors'].append("File does not exist")
                return validation_result
            
            # Check file size
            file_size = os.path.getsize(file_path)
            validation_result['file_size'] = self._format_file_size(file_size)
            
            if file_size == 0:
                validation_result['errors'].append("File is empty")
                return validation_result
            
            if file_size > 500 * 1024 * 1024:  # 500MB limit
                validation_result['warnings'].append("File is larger than 500MB")
            
            # Check file format
            if not file_path.lower().endswith('.h5'):
                validation_result['errors'].append("Unsupported file format. Only .h5 files are supported")
                return validation_result
            
            # Try to open as HDF5 file
            try:
                with h5py.File(file_path, 'r') as f:
                    # Basic HDF5 structure validation
                    if 'model_weights' not in f and 'model_config' not in f:
                        validation_result['warnings'].append("File may not be a valid Keras model")
            except Exception as e:
                validation_result['errors'].append(f"Cannot read HDF5 file: {str(e)}")
                return validation_result
            
            # Try to load as Keras model
            try:
                model = load_model(file_path)
                validation_result['model_info'] = self._extract_model_info(model)
                validation_result['is_valid'] = True
                
                # Additional validations
                self._validate_model_structure(model, validation_result)
                
            except Exception as e:
                validation_result['errors'].append(f"Cannot load as Keras model: {str(e)}")
                return validation_result
                
        except Exception as e:
            validation_result['errors'].append(f"Unexpected error during validation: {str(e)}")
        
        return validation_result
    
    def validate_converted_schema(self, schema_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate converted schema data
        
        Args:
            schema_data: Converted schema data
            
        Returns:
            Dictionary containing validation results
        """
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'metrics': {
                'fields_validated': 0,
                'required_fields_present': 0,
                'integrity_score': 0.0
            }
        }
        
        try:
            # Check required fields
            missing_fields = []
            for field in self.required_schema_fields:
                if field not in schema_data:
                    missing_fields.append(field)
                else:
                    validation_result['metrics']['required_fields_present'] += 1
            
            validation_result['metrics']['fields_validated'] = len(self.required_schema_fields)
            
            if missing_fields:
                validation_result['is_valid'] = False
                validation_result['errors'].append(f"Missing required fields: {', '.join(missing_fields)}")
            
            # Validate field types and values
            self._validate_schema_fields(schema_data, validation_result)
            
            # Calculate integrity score
            total_checks = len(self.required_schema_fields) + 10  # Additional integrity checks
            passed_checks = validation_result['metrics']['required_fields_present']
            passed_checks += self._count_integrity_checks(schema_data)
            
            validation_result['metrics']['integrity_score'] = passed_checks / total_checks
            
        except Exception as e:
            validation_result['is_valid'] = False
            validation_result['errors'].append(f"Schema validation error: {str(e)}")
        
        return validation_result
    
    def _extract_model_info(self, model) -> Dict[str, Any]:
        """Extract basic information from loaded model"""
        info = {
            'type': type(model).__name__,
            'input_shape': None,
            'output_shape': None,
            'total_params': 0,
            'trainable_params': 0,
            'non_trainable_params': 0,
            'layers': []
        }
        
        try:
            # Get input/output shapes
            if hasattr(model, 'input_shape'):
                info['input_shape'] = model.input_shape
            if hasattr(model, 'output_shape'):
                info['output_shape'] = model.output_shape
            
            # Count parameters
            if hasattr(model, 'count_params'):
                info['total_params'] = model.count_params()
            
            # Get layer information
            if hasattr(model, 'layers'):
                for i, layer in enumerate(model.layers):
                    layer_info = {
                        'index': i,
                        'name': layer.name,
                        'type': type(layer).__name__,
                        'trainable': getattr(layer, 'trainable', True),
                        'params': layer.count_params() if hasattr(layer, 'count_params') else 0
                    }
                    info['layers'].append(layer_info)
                    
                    if layer_info['trainable']:
                        info['trainable_params'] += layer_info['params']
                    else:
                        info['non_trainable_params'] += layer_info['params']
                        
        except Exception as e:
            print(f"Error extracting model info: {e}")
        
        return info
    
    def _validate_model_structure(self, model, validation_result: Dict[str, Any]):
        """Validate model structure for conversion compatibility"""
        try:
            # Check if model has dense layers (currently supported)
            dense_layers = [layer for layer in model.layers if 'Dense' in type(layer).__name__]
            
            if not dense_layers:
                validation_result['warnings'].append("No Dense layers found. Model may not be fully supported.")
            
            # Check for unsupported layer types
            unsupported_layers = []
            for layer in model.layers:
                layer_type = type(layer).__name__
                if layer_type not in ['Dense', 'InputLayer', 'Flatten', 'Dropout']:
                    unsupported_layers.append(layer_type)
            
            if unsupported_layers:
                validation_result['warnings'].append(
                    f"Potentially unsupported layer types: {', '.join(set(unsupported_layers))}"
                )
                
        except Exception as e:
            validation_result['warnings'].append(f"Could not validate model structure: {str(e)}")
    
    def _validate_schema_fields(self, schema_data: Dict[str, Any], validation_result: Dict[str, Any]):
        """Validate individual schema fields"""
        try:
            # Validate layer dimensions (camelCase)
            layer_dims = schema_data.get('layerDimensions', [])
            if not isinstance(layer_dims, list):
                validation_result['errors'].append("layerDimensions must be a list")
            else:
                for i, dim_pair in enumerate(layer_dims):
                    if not isinstance(dim_pair, list) or len(dim_pair) != 2:
                        validation_result['errors'].append(f"Layer {i} dimensions must be [input_dim, output_dim]")
                    elif not all(isinstance(d, int) and d > 0 for d in dim_pair):
                        validation_result['errors'].append(f"Layer {i} dimensions must be positive integers")
            
            # Validate weights and biases structure (camelCase)
            weights_mags = schema_data.get('weightsMagnitudes', [])
            weights_signs = schema_data.get('weightsSigns', [])
            biases_mags = schema_data.get('biasesMagnitudes', [])
            biases_signs = schema_data.get('biasesSigns', [])
            
            if len(weights_mags) != len(layer_dims):
                validation_result['errors'].append("weightsMagnitudes length must match layerDimensions")
            
            if len(weights_signs) != len(layer_dims):
                validation_result['errors'].append("weightsSigns length must match layerDimensions")
            
            if len(biases_mags) != len(layer_dims):
                validation_result['errors'].append("biasesMagnitudes length must match layerDimensions")
            
            if len(biases_signs) != len(layer_dims):
                validation_result['errors'].append("biasesSigns length must match layerDimensions")
            
            # Validate scale
            scale = schema_data.get('scale', 0)
            if not isinstance(scale, int) or scale <= 0:
                validation_result['errors'].append("scale must be a positive integer")
                
        except Exception as e:
            validation_result['errors'].append(f"Field validation error: {str(e)}")
    
    def _count_integrity_checks(self, schema_data: Dict[str, Any]) -> int:
        """Count additional integrity checks that pass"""
        checks_passed = 0
        
        try:
            # Check if dimensions are consistent (camelCase)
            layer_dims = schema_data.get('layerDimensions', [])
            if layer_dims:
                # Check dimensional consistency
                for i in range(len(layer_dims) - 1):
                    if layer_dims[i][1] == layer_dims[i + 1][0]:
                        checks_passed += 1
                
                # Check if weights/biases match dimensions (camelCase)
                weights_mags = schema_data.get('weightsMagnitudes', [])
                biases_mags = schema_data.get('biasesMagnitudes', [])
                
                for i, (in_dim, out_dim) in enumerate(layer_dims):
                    if i < len(weights_mags):
                        expected_weight_count = in_dim * out_dim
                        if len(weights_mags[i]) == expected_weight_count:
                            checks_passed += 1
                    
                    if i < len(biases_mags):
                        if len(biases_mags[i]) == out_dim:
                            checks_passed += 1
            
            # Check if name and description are not empty
            if schema_data.get('name', '').strip():
                checks_passed += 1
            
            if schema_data.get('description', '').strip():
                checks_passed += 1
                
        except Exception:
            pass
        
        return checks_passed
    
    def _format_file_size(self, size_bytes: int) -> str:
        """Format file size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB" 