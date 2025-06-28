# OpenGraph Model Validator

A streamlined admin interface for validating ML model conversions and comparing Web2 TensorFlow models with their Sui On-chain twins.

## Overview

The OpenGraph Model Validator provides a focused Streamlit-based web interface that allows administrators to:

- Convert .h5 model files to OpenGraph schema format
- Compare Web2 TensorFlow inference with Sui On-chain inference
- Validate identical behavior between Web2 and Sui models
- Monitor system health and implementation status

## Features

### 🔄 Model Conversion
- **H5 to OpenGraph**: Convert Keras/TensorFlow .h5 models to OpenGraph schema
- **Schema Generation**: Generate JSON schema compatible with Sui Move contracts
- **Conversion Validation**: Validate successful conversion with basic checks
- **Architecture Analysis**: Display converted model structure and parameters

### 🧪 Model Validation
- **Inference Comparison**: Compare Web2 TensorFlow vs Sui On-chain inference results
- **Test Input Generation**: Generate random, custom, or sample dataset inputs
- **Result Analysis**: Analyze prediction differences and accuracy matches
- **Validation Reporting**: Detailed validation summary with success/failure rates

### ⚙️ System Monitoring
- **Implementation Status**: Track progress of Sui integration components
- **Environment Health**: Monitor TensorFlow, Streamlit, and dependency status
- **Connection Status**: Check Sui blockchain connection readiness

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
The validator interface consists of three main sections accessible via the sidebar:

1. **Model Conversion**: Convert .h5 models to OpenGraph schema format
2. **Model Validation**: Compare Web2 vs Sui On-chain inference results
3. **System Status**: Monitor system health and implementation progress

### Model Conversion Workflow

1. **Upload Model File**
   - Click "Browse files" to select a .h5 model file
   - View file information (name, size)

2. **Convert Model**
   - Click "Convert Model" to start the conversion process
   - Review conversion summary (layers, parameters, architecture)
   - Copy generated JSON schema for Sui contract usage

### Model Validation Workflow

1. **Load Converted Model**
   - Ensure you have a converted model from the previous step
   - Configure test input type and number of test cases

2. **Run Validation Tests**
   - Click "Run Validation Tests" to start inference comparison
   - View side-by-side results for Web2 vs Sui inference
   - Analyze differences and prediction matches

3. **Review Validation Summary**
   - Check overall success rate and identical result count
   - Review detailed test results table
   - Determine validation verdict (passed/partial/failed)

### Understanding Validation Results

#### Conversion Status
- ✅ **Success**: Model was successfully converted to OpenGraph format
- ❌ **Failed**: Conversion encountered errors (check error messages)
- **Metrics**: Layers, parameters, scale factor, and model architecture

#### Validation Results
- **Identical**: Web2 and Sui inference results are numerically identical (< 1e-6 difference)
- **Prediction Match**: Argmax predictions match but may have small numerical differences
- **Different**: Significant differences in inference results requiring investigation

#### Success Rates
- **100% Success**: All tests passed with identical results ✅
- **Partial Success**: Predictions match but with numerical differences ⚠️
- **Validation Failed**: Significant differences detected requiring debugging ❌

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