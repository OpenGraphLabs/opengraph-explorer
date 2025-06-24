"""
Admin Utility Functions

This module provides utility functions for the admin interface.
"""

import os
from typing import Dict, Any, List, Optional


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human readable format
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        Formatted size string
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} PB"


def get_model_stats(converted_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract statistical information from converted model data
    
    Args:
        converted_data: Converted schema data
        
    Returns:
        Dictionary containing model statistics
    """
    stats = {
        'total_layers': 0,
        'total_parameters': 0,
        'total_weights': 0,
        'total_biases': 0,
        'average_layer_size': 0,
        'largest_layer_size': 0,
        'smallest_layer_size': float('inf'),
        'parameter_distribution': []
    }
    
    try:
        layer_dims = converted_data.get('layerDimensions', [])
        weights_mags = converted_data.get('weightsMagnitudes', [])
        biases_mags = converted_data.get('biasesMagnitudes', [])
        
        stats['total_layers'] = len(layer_dims)
        
        layer_sizes = []
        for i, (in_dim, out_dim) in enumerate(layer_dims):
            layer_params = in_dim * out_dim + out_dim  # weights + biases
            layer_sizes.append(layer_params)
            
            stats['parameter_distribution'].append({
                'layer': i,
                'input_dim': in_dim,
                'output_dim': out_dim,
                'weights': in_dim * out_dim,
                'biases': out_dim,
                'total': layer_params
            })
        
        if layer_sizes:
            stats['total_parameters'] = sum(layer_sizes)
            stats['average_layer_size'] = sum(layer_sizes) / len(layer_sizes)
            stats['largest_layer_size'] = max(layer_sizes)
            stats['smallest_layer_size'] = min(layer_sizes)
        
        # Count actual weights and biases from converted data
        stats['total_weights'] = sum(len(w) for w in weights_mags)
        stats['total_biases'] = sum(len(b) for b in biases_mags)
        
    except Exception as e:
        print(f"Error calculating model stats: {e}")
    
    return stats


def validate_admin_dependencies() -> Dict[str, bool]:
    """
    Validate that all required dependencies for admin are available
    
    Returns:
        Dictionary indicating which dependencies are available
    """
    dependencies = {
        'streamlit': False,
        'plotly': False,
        'pandas': False,
        'tensorflow': False,
        'h5py': False
    }
    
    # Check streamlit
    try:
        import streamlit
        dependencies['streamlit'] = True
    except ImportError:
        pass
    
    # Check plotly
    try:
        import plotly
        dependencies['plotly'] = True
    except ImportError:
        pass
    
    # Check pandas
    try:
        import pandas
        dependencies['pandas'] = True
    except ImportError:
        pass
    
    # Check tensorflow
    try:
        import tensorflow
        dependencies['tensorflow'] = True
    except ImportError:
        pass
    
    # Check h5py
    try:
        import h5py
        dependencies['h5py'] = True
    except ImportError:
        pass
    
    return dependencies


def create_sample_data() -> Dict[str, Any]:
    """
    Create sample model data for testing purposes
    
    Returns:
        Sample model data in OpenGraph schema format
    """
    sample_data = {
        "name": "Sample MNIST Classifier",
        "description": "A simple neural network for MNIST digit classification",
        "task_type": "classification",
        "layer_dimensions": [
            [784, 128],  # Input layer: 28x28 = 784 inputs, 128 outputs
            [128, 64],   # Hidden layer: 128 inputs, 64 outputs
            [64, 10]     # Output layer: 64 inputs, 10 outputs (digits 0-9)
        ],
        "weights_magnitudes": [
            [100] * (784 * 128),  # First layer weights
            [100] * (128 * 64),   # Second layer weights
            [100] * (64 * 10)     # Third layer weights
        ],
        "weights_signs": [
            [0] * (784 * 128),    # First layer weight signs
            [0] * (128 * 64),     # Second layer weight signs
            [0] * (64 * 10)       # Third layer weight signs
        ],
        "biases_magnitudes": [
            [50] * 128,           # First layer biases
            [50] * 64,            # Second layer biases
            [50] * 10             # Third layer biases
        ],
        "biases_signs": [
            [0] * 128,            # First layer bias signs
            [0] * 64,             # Second layer bias signs
            [0] * 10              # Third layer bias signs
        ],
        "scale": 2,
        "training_dataset_id": None,
        "test_dataset_ids": None
    }
    
    return sample_data


def generate_conversion_report(validation_result: Dict[str, Any], 
                             conversion_result: Dict[str, Any],
                             schema_validation: Dict[str, Any]) -> str:
    """
    Generate a comprehensive conversion report
    
    Args:
        validation_result: File validation results
        conversion_result: Model conversion results
        schema_validation: Schema validation results
        
    Returns:
        Formatted report string
    """
    report_lines = []
    report_lines.append("# OpenGraph Model Conversion Report")
    report_lines.append("=" * 50)
    report_lines.append("")
    
    # File validation section
    report_lines.append("## File Validation")
    if validation_result.get('is_valid', False):
        report_lines.append("✅ **Status**: PASSED")
    else:
        report_lines.append("❌ **Status**: FAILED")
    
    report_lines.append(f"**File Size**: {validation_result.get('file_size', 'Unknown')}")
    
    if 'model_info' in validation_result:
        info = validation_result['model_info']
        report_lines.append(f"**Model Type**: {info.get('type', 'Unknown')}")
        report_lines.append(f"**Total Parameters**: {info.get('total_params', 0):,}")
        report_lines.append(f"**Input Shape**: {info.get('input_shape', 'Unknown')}")
        report_lines.append(f"**Output Shape**: {info.get('output_shape', 'Unknown')}")
    
    if validation_result.get('errors'):
        report_lines.append("\n**Errors:**")
        for error in validation_result['errors']:
            report_lines.append(f"- {error}")
    
    if validation_result.get('warnings'):
        report_lines.append("\n**Warnings:**")
        for warning in validation_result['warnings']:
            report_lines.append(f"- {warning}")
    
    report_lines.append("")
    
    # Conversion section
    report_lines.append("## Model Conversion")
    if conversion_result.get('success', False):
        report_lines.append("✅ **Status**: SUCCESS")
        
        metrics = conversion_result.get('metrics', {})
        report_lines.append(f"**Conversion Time**: {metrics.get('conversion_time', 0):.2f} seconds")
        report_lines.append(f"**Layers Converted**: {metrics.get('layers_converted', 0)}")
        report_lines.append(f"**Parameters Converted**: {metrics.get('parameters_converted', 0):,}")
        report_lines.append(f"**Schema Version**: {metrics.get('schema_version', 'Unknown')}")
    else:
        report_lines.append("❌ **Status**: FAILED")
        if conversion_result.get('error'):
            report_lines.append(f"**Error**: {conversion_result['error']}")
    
    report_lines.append("")
    
    # Schema validation section
    report_lines.append("## Schema Validation")
    if schema_validation.get('is_valid', False):
        report_lines.append("✅ **Status**: PASSED")
    else:
        report_lines.append("❌ **Status**: FAILED")
    
    if 'metrics' in schema_validation:
        metrics = schema_validation['metrics']
        report_lines.append(f"**Fields Validated**: {metrics.get('fields_validated', 0)}")
        report_lines.append(f"**Required Fields Present**: {metrics.get('required_fields_present', 0)}")
        report_lines.append(f"**Data Integrity Score**: {metrics.get('integrity_score', 0):.1%}")
    
    if schema_validation.get('errors'):
        report_lines.append("\n**Schema Errors:**")
        for error in schema_validation['errors']:
            report_lines.append(f"- {error}")
    
    if schema_validation.get('warnings'):
        report_lines.append("\n**Schema Warnings:**")
        for warning in schema_validation['warnings']:
            report_lines.append(f"- {warning}")
    
    report_lines.append("")
    report_lines.append("---")
    report_lines.append("*Report generated by OpenGraph Converter Admin*")
    
    return "\n".join(report_lines)


def check_system_health() -> Dict[str, Any]:
    """
    Check the health of the conversion system
    
    Returns:
        System health status
    """
    health_status = {
        'overall_status': 'healthy',
        'components': {},
        'warnings': [],
        'errors': []
    }
    
    # Check dependencies
    deps = validate_admin_dependencies()
    health_status['components']['dependencies'] = {
        'status': 'healthy' if all(deps.values()) else 'warning',
        'details': deps
    }
    
    if not all(deps.values()):
        missing = [dep for dep, available in deps.items() if not available]
        health_status['warnings'].append(f"Missing dependencies: {', '.join(missing)}")
        health_status['overall_status'] = 'warning'
    
    # Check upload directory
    upload_dir = "uploads"
    if os.path.exists(upload_dir):
        health_status['components']['storage'] = {
            'status': 'healthy',
            'upload_dir_exists': True,
            'upload_dir_writable': os.access(upload_dir, os.W_OK)
        }
        
        if not os.access(upload_dir, os.W_OK):
            health_status['errors'].append("Upload directory is not writable")
            health_status['overall_status'] = 'error'
    else:
        health_status['components']['storage'] = {
            'status': 'warning',
            'upload_dir_exists': False,
            'upload_dir_writable': False
        }
        health_status['warnings'].append("Upload directory does not exist")
        if health_status['overall_status'] == 'healthy':
            health_status['overall_status'] = 'warning'
    
    return health_status 