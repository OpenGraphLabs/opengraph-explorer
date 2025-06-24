# OpenGraph Model Converter

This module converts TensorFlow/Keras models into a format suitable for use in the OpenGraph blockchain environment.

## Overview

OpenGraph is an innovative platform that enables machine learning models to run completely on-chain. This converter transforms existing .h5 Keras models into our proprietary schema format, allowing direct inference execution on the Sui blockchain.

## Key Features

- **.h5 File Parsing**: Read and analyze .h5 model files saved by TensorFlow/Keras
- **Weight Extraction**: Extract model weights and biases and convert them to fixed-point format
- **Schema Conversion**: Convert to JSON schema usable by OpenGraph blockchain contracts
- **API Interface**: RESTful API interface via FastAPI
- **🆕 Admin Interface**: Comprehensive web-based admin UI for validation and testing

## Installation and Setup

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run the API Server
```bash
python main.py
```

The server runs on port 3000 by default.

### 🆕 Run the Admin Interface
```bash
python admin/run_admin.py
```

The admin interface runs on port 8501 by default and provides:
- Model upload and validation
- Real-time conversion testing
- Schema validation and compliance checking
- Visual analysis and reporting
- System health monitoring

## API Usage

### Model Upload and Conversion

```bash
curl -X POST "http://localhost:3000/api/v1/models/parse" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@your_model.h5"
```

### Response Example

```json
{
  "layerDimensions": [
    [784, 128],
    [128, 64], 
    [64, 10]
  ],
  "weightsMagnitudes": [...],
  "weightsSigns": [...],
  "biasesMagnitudes": [...],
  "biasesSigns": [...],
  "scale": 2
}
```

## Project Structure

```
converter/
├── main.py                    # FastAPI server main file
├── requirements.txt           # Python dependencies
├── admin/                     # 🆕 Admin interface module
│   ├── __init__.py
│   ├── admin_app.py          # Main Streamlit application
│   ├── validation_service.py  # Model validation logic
│   ├── conversion_service.py  # Enhanced conversion with metrics
│   ├── utils.py              # Admin utility functions
│   ├── run_admin.py          # Admin launcher script
│   └── README.md             # Admin documentation
├── models/
│   └── model.py              # Pydantic model schema
├── services/
│   └── model_service.py      # Model conversion logic
├── routers/
│   └── model_router.py       # API router
├── utils/
│   ├── read_h5.py           # H5 file reading utilities
│   └── convert_mag_sign.py  # Sign/magnitude conversion utilities
└── uploads/                  # Uploaded file storage
```

## Conversion Process

1. **Model Loading**: Load .h5 file using TensorFlow/Keras
2. **Layer Analysis**: Extract weights and biases from Dense layers
3. **Fixed-Point Conversion**: Convert floating-point values to (sign, magnitude) pairs
4. **Schema Generation**: Create JSON in OpenGraph blockchain contract format

## Admin Interface Features

### 🔍 Model Validation
- File format validation and compatibility checking
- Model structure analysis and parameter counting
- Layer type compatibility verification

### 🔄 Conversion Testing
- Real-time model conversion with detailed metrics
- Error handling and comprehensive reporting
- Performance monitoring and timing analysis

### ✅ Schema Validation
- Schema compliance checking against OpenGraph format
- Data integrity verification and consistency checking
- Field validation and completeness scoring

### 📊 Visualization & Analysis
- Interactive model architecture visualization
- Parameter distribution analysis across layers
- Conversion history tracking and system health monitoring

## Supported Model Types

Currently supports the following model structures:
- **Dense Layers**: Fully connected layers
- **Sequential Models**: Sequential layer structures

## Limitations

- Currently supports Dense layers only (Conv2D, LSTM, etc. planned for future releases)
- Model size limit: 500MB or less
- Supported format: .h5 files only

## Usage Examples

### Using the API
For production integration, use the FastAPI endpoints to convert models programmatically.

### Using the Admin Interface
For testing, validation, and development, use the admin interface:

1. Start the admin interface: `python admin/run_admin.py`
2. Open your browser to `http://localhost:8501`
3. Upload a .h5 model file
4. Review validation results and conversion metrics
5. Download conversion reports for documentation

## Troubleshooting

### Common Errors

#### "Cannot load model" Error
- Verify the file is a valid Keras model
- Check TensorFlow version compatibility

#### "Unsupported layer type" Warning
- Currently only Dense layers are fully supported
- Other layer types are ignored

#### "Missing dependencies" Error (Admin)
- Run: `pip install -r requirements.txt`
- Verify all admin dependencies are installed

### Admin Interface Issues
- Check the admin README: `admin/README.md`
- Use system health monitoring in the admin interface
- Run with `--skip-checks` flag to bypass system validation

## Development Guide

### Adding New Layer Types
1. Add layer processing logic in `utils/read_h5.py`
2. Extend schema in `models/model.py`
3. Write test cases

### Custom Conversion Logic
Modify the `parse_model_file` function in `services/model_service.py` to add custom conversion logic.

### Extending the Admin Interface
- Add new validation rules in `admin/validation_service.py`
- Extend metrics collection in `admin/conversion_service.py`
- Add new UI components in `admin/admin_app.py`

## API Documentation

FastAPI automatically generates API documentation available at:
- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

## License

This project is part of the OpenGraph project and follows the same licensing terms. 