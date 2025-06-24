# OpenGraph Converter Admin

A comprehensive admin interface for validating and testing ML model conversions to OpenGraph schema format.

## Overview

The OpenGraph Converter Admin provides a user-friendly Streamlit-based web interface that allows administrators to:

- Upload and validate .h5 model files
- Test conversion to OpenGraph schema format
- View detailed conversion statistics and metrics
- Monitor system health and status
- Generate comprehensive conversion reports

## Features

### 🔍 Model Validation
- **File Validation**: Validates uploaded .h5 files for format correctness
- **Model Structure Analysis**: Analyzes model architecture and parameters
- **Compatibility Checking**: Verifies model compatibility with OpenGraph conversion

### 🔄 Conversion Testing
- **Real-time Conversion**: Converts models using the same logic as the production system
- **Detailed Metrics**: Provides comprehensive conversion statistics
- **Error Handling**: Captures and displays detailed error information
- **Performance Monitoring**: Tracks conversion time and resource usage

### ✅ Schema Validation
- **Schema Compliance**: Validates converted data against OpenGraph schema
- **Data Integrity**: Checks for data consistency and completeness
- **Field Validation**: Ensures all required fields are present and correctly formatted

### 📊 Visualization & Analysis
- **Layer Structure Visualization**: Interactive charts showing model architecture
- **Parameter Distribution**: Visual analysis of parameter distribution across layers
- **Conversion History**: Track and review past conversion attempts
- **System Health Dashboard**: Monitor system status and dependencies

## Installation

### Prerequisites
- Python 3.8+
- TensorFlow 2.x
- All dependencies listed in `requirements.txt`

### Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Verify installation:
   ```bash
   python admin/run_admin.py --skip-checks
   ```

## Usage

### Starting the Admin Interface

#### Basic Usage
```bash
python admin/run_admin.py
```

#### Custom Configuration
```bash
python admin/run_admin.py --port 8502 --host 0.0.0.0
```

#### Skip System Checks
```bash
python admin/run_admin.py --skip-checks
```

### Command Line Options
- `--port`: Specify the port to run the admin on (default: 8501)
- `--host`: Specify the host address (default: localhost)
- `--skip-checks`: Skip dependency and system health checks

### Accessing the Interface

Once started, open your web browser and navigate to:
```
http://localhost:8501
```

## Interface Guide

### Main Navigation
The admin interface consists of three main sections accessible via the sidebar:

1. **Model Upload & Validation**: Primary interface for testing model conversions
2. **Conversion History**: View historical conversion records and statistics
3. **System Status**: Monitor system health and environment information

### Model Upload & Validation Workflow

1. **Upload Model File**
   - Click "Browse files" to select a .h5 model file
   - View file information (name, size, type)

2. **Run Conversion & Validation**
   - Click "Convert & Validate Model" to start the process
   - Monitor progress through the 4-step validation process

3. **Review Results**
   - **Step 1**: File validation results and model information
   - **Step 2**: Conversion metrics and success status
   - **Step 3**: Schema validation and compliance checking
   - **Step 4**: Model analysis and visualization

### Understanding Validation Results

#### File Validation
- ✅ **Passed**: File is valid and can be processed
- ❌ **Failed**: File has issues that prevent processing
- ⚠️ **Warnings**: File is processable but has potential issues

#### Conversion Results
- **Success**: Model was successfully converted to OpenGraph format
- **Failed**: Conversion encountered errors
- **Metrics**: Time taken, layers converted, parameters processed

#### Schema Validation
- **Compliance**: All required fields present and correctly formatted
- **Integrity Score**: Percentage indicating data completeness and consistency
- **Field Validation**: Detailed validation of individual schema components

## Architecture

### Module Structure
```
admin/
├── __init__.py              # Module initialization
├── admin_app.py             # Main Streamlit application
├── validation_service.py    # Model validation logic
├── conversion_service.py    # Enhanced conversion with metrics
├── utils.py                 # Utility functions and helpers
├── run_admin.py            # Application launcher script
└── README.md               # This documentation
```

### Key Components

#### ValidationService
- File format validation
- Model structure analysis
- Schema compliance checking
- Data integrity verification

#### ConversionService
- Enhanced model conversion with metrics
- Error handling and reporting
- Performance monitoring
- Metadata enhancement

#### Utility Functions
- File size formatting
- Statistical analysis
- System health checking
- Report generation

## Configuration

### Environment Variables
The admin interface uses the same environment configuration as the main converter service.

### Customization
- **Theme**: The Streamlit theme can be customized in `run_admin.py`
- **Validation Rules**: Modify validation criteria in `validation_service.py`
- **Metrics**: Add custom metrics in `conversion_service.py`

## Troubleshooting

### Common Issues

#### "Missing dependencies" Error
```bash
pip install -r requirements.txt
```

#### "Upload directory not found" Warning
```bash
mkdir -p uploads
chmod 755 uploads
```

#### "Cannot load model" Error
- Ensure the uploaded file is a valid Keras .h5 model
- Check that TensorFlow version is compatible
- Verify the model was saved correctly

### Debugging

#### Enable Verbose Logging
Add debug prints in service modules for detailed troubleshooting.

#### Check System Health
Use the "System Status" tab to identify configuration issues.

#### Validate Dependencies
Run the dependency check manually:
```python
from admin.utils import validate_admin_dependencies
print(validate_admin_dependencies())
```

## Development

### Adding New Features

#### New Validation Rules
1. Extend the `ModelValidator` class in `validation_service.py`
2. Add corresponding UI elements in `admin_app.py`
3. Update the validation workflow as needed

#### Custom Metrics
1. Enhance the `ConversionService` class in `conversion_service.py`
2. Add visualization components in the main app
3. Update the metrics display logic

#### Additional File Formats
1. Extend the validation logic to support new formats
2. Update the file upload component configuration
3. Add format-specific conversion logic

### Testing

#### Manual Testing
1. Start the admin interface
2. Upload various model files (valid and invalid)
3. Verify all validation steps work correctly
4. Check error handling and reporting

#### Unit Testing
Create unit tests for individual service components:
```python
from admin.validation_service import ModelValidator
from admin.conversion_service import ConversionService

# Test validation logic
validator = ModelValidator()
result = validator.validate_file("test_model.h5")

# Test conversion logic
converter = ConversionService()
result = converter.convert_model("test_model.h5")
```

## Security Considerations

- **File Upload Security**: Only .h5 files are accepted
- **Size Limits**: File uploads are limited to 500MB
- **Temporary Files**: Uploaded files are automatically cleaned up
- **Access Control**: Consider adding authentication for production use

## Performance Optimization

- **Large Models**: For very large models, consider implementing streaming processing
- **Concurrent Uploads**: The interface handles one upload at a time by design
- **Memory Management**: Temporary files are cleaned up after processing

## License

This admin interface is part of the OpenGraph project and follows the same licensing terms.

## Support

For issues, questions, or feature requests related to the admin interface:
1. Check this documentation first
2. Review the troubleshooting section
3. Check system health and dependencies
4. Consult the main OpenGraph project documentation 