"""
OpenGraph Model Converter Admin Dashboard

This Streamlit application provides a user interface for validating and testing
ML model conversions to OpenGraph schema format.
"""

import os
import sys
import tempfile
import traceback
from typing import Dict, Any, Optional, Tuple
import json

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from services.model_service import parse_model_file
from admin.validation_service import ModelValidator
from admin.conversion_service import ConversionService
from admin.utils import format_file_size, get_model_stats


def setup_page():
    """Configure Streamlit page settings"""
    st.set_page_config(
        page_title="OpenGraph Model Converter Admin",
        page_icon="🧠",
        layout="wide",
        initial_sidebar_state="expanded"
    )


def render_header():
    """Render the application header"""
    st.title("🧠 OpenGraph Model Converter Admin")
    st.markdown("### Validate and test ML model conversions to OpenGraph schema")
    st.divider()


def render_sidebar():
    """Render the sidebar with navigation and info"""
    with st.sidebar:
        st.header("Navigation")
        tab = st.radio(
            "Select Function",
            ["Model Upload & Validation", "Conversion History", "System Status"]
        )
        
        st.divider()
        
        st.header("About")
        st.markdown("""
        **OpenGraph Converter Admin** helps you:
        - Upload and validate .h5 model files
        - Test conversion to OpenGraph schema
        - View conversion statistics
        - Monitor system health
        """)
        
        st.divider()
        
        st.header("Supported Formats")
        st.markdown("""
        - **Input**: .h5 (Keras/TensorFlow)
        - **Output**: OpenGraph Schema JSON
        """)
        
    return tab


def render_upload_validation_tab():
    """Render the main upload and validation interface"""
    st.header("Model Upload & Validation")
    
    # File upload section
    uploaded_file = st.file_uploader(
        "Upload .h5 Model File",
        type=['h5'],
        help="Upload a Keras/TensorFlow .h5 model file for validation"
    )
    
    if uploaded_file is not None:
        # Display file info
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("File Name", uploaded_file.name)
        with col2:
            st.metric("File Size", format_file_size(uploaded_file.size))
        with col3:
            st.metric("File Type", uploaded_file.type)
        
        st.divider()
        
        # Process the uploaded file
        if st.button("🔄 Convert & Validate Model", type="primary"):
            process_uploaded_model(uploaded_file)


def process_uploaded_model(uploaded_file):
    """Process the uploaded model file and run validation"""
    with st.spinner("Processing model file..."):
        try:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.h5') as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_file_path = tmp_file.name
            
            # Initialize services
            validator = ModelValidator()
            conversion_service = ConversionService()
            
            # Step 1: Basic file validation
            st.subheader("📋 Step 1: Basic File Validation")
            with st.expander("File Validation Results", expanded=True):
                file_validation = validator.validate_file(tmp_file_path)
                render_validation_results(file_validation)
            
            if not file_validation.get('is_valid', False):
                st.error("File validation failed. Cannot proceed with conversion.")
                return
            
            # Step 2: Model conversion
            st.subheader("🔄 Step 2: Model Conversion")
            with st.expander("Conversion Results", expanded=True):
                conversion_result = conversion_service.convert_model(tmp_file_path)
                render_conversion_results(conversion_result)
            
            if not conversion_result.get('success', False):
                st.error("Model conversion failed.")
                return
            
            # Step 3: Schema validation
            st.subheader("✅ Step 3: Schema Validation")
            with st.expander("Schema Validation Results", expanded=True):
                schema_validation = validator.validate_converted_schema(
                    conversion_result.get('converted_data', {})
                )
                render_schema_validation_results(schema_validation)
            
            # Step 4: Model analysis and JSON schema
            st.subheader("📊 Step 4: Model Analysis & Schema")
            
            # Create tabs for different views
            analysis_tab, json_tab = st.tabs(["📈 Model Analysis", "📄 JSON Schema"])
            
            with analysis_tab:
                render_model_analysis(conversion_result.get('converted_data', {}))
            
            with json_tab:
                render_json_schema_view(conversion_result.get('converted_data', {}))
            
            # Clean up temporary file
            os.unlink(tmp_file_path)
            
        except Exception as e:
            st.error(f"An error occurred during processing: {str(e)}")
            st.code(traceback.format_exc(), language="python")


def render_validation_results(validation_result: Dict[str, Any]):
    """Render file validation results"""
    col1, col2 = st.columns(2)
    
    with col1:
        if validation_result.get('is_valid', False):
            st.success("✅ File validation passed")
        else:
            st.error("❌ File validation failed")
    
    with col2:
        st.info(f"File size: {validation_result.get('file_size', 'Unknown')}")
    
    if 'model_info' in validation_result:
        model_info = validation_result['model_info']
        
        st.markdown("**Model Information:**")
        info_df = pd.DataFrame([
            {"Property": "Model Type", "Value": model_info.get('type', 'Unknown')},
            {"Property": "Input Shape", "Value": str(model_info.get('input_shape', 'Unknown'))},
            {"Property": "Output Shape", "Value": str(model_info.get('output_shape', 'Unknown'))},
            {"Property": "Total Parameters", "Value": f"{model_info.get('total_params', 0):,}"},
            {"Property": "Trainable Parameters", "Value": f"{model_info.get('trainable_params', 0):,}"},
        ])
        st.dataframe(info_df, use_container_width=True)
    
    if 'errors' in validation_result and validation_result['errors']:
        st.warning("Validation Warnings/Errors:")
        for error in validation_result['errors']:
            st.warning(f"• {error}")


def render_conversion_results(conversion_result: Dict[str, Any]):
    """Render model conversion results"""
    if conversion_result.get('success', False):
        st.success("✅ Model conversion successful")
        
        # Show conversion metrics
        metrics = conversion_result.get('metrics', {})
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Conversion Time", f"{metrics.get('conversion_time', 0):.2f}s")
        with col2:
            st.metric("Layers Converted", metrics.get('layers_converted', 0))
        with col3:
            st.metric("Parameters Converted", f"{metrics.get('parameters_converted', 0):,}")
        with col4:
            st.metric("Schema Version", metrics.get('schema_version', 'Unknown'))
        
        # Show converted data preview
        if 'converted_data' in conversion_result:
            st.markdown("**Converted Schema Preview:**")
            preview_data = conversion_result['converted_data']
            
            # Show basic structure
            structure_info = {
                "Model Name": preview_data.get('name', 'Unknown'),
                "Description": preview_data.get('description', 'No description'),
                "Task Type": preview_data.get('task_type', 'Unknown'),
                "Scale": preview_data.get('scale', 'Unknown'),
                "Number of Layers": len(preview_data.get('layerDimensions', []))
            }
            
            st.json(structure_info, expanded=False)
    else:
        st.error("❌ Model conversion failed")
        
        if 'error' in conversion_result:
            st.error(f"Error: {conversion_result['error']}")
        
        if 'traceback' in conversion_result:
            st.code(conversion_result['traceback'], language="python")


def render_schema_validation_results(validation_result: Dict[str, Any]):
    """Render schema validation results"""
    if validation_result.get('is_valid', False):
        st.success("✅ Schema validation passed")
        
        # Show validation metrics
        metrics = validation_result.get('metrics', {})
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Fields Validated", metrics.get('fields_validated', 0))
        with col2:
            st.metric("Required Fields", metrics.get('required_fields_present', 0))
        with col3:
            st.metric("Data Integrity", f"{metrics.get('integrity_score', 0):.1%}")
        
    else:
        st.error("❌ Schema validation failed")
        
        if 'errors' in validation_result:
            st.error("Validation Errors:")
            for error in validation_result['errors']:
                st.error(f"• {error}")
        
        if 'warnings' in validation_result:
            st.warning("Validation Warnings:")
            for warning in validation_result['warnings']:
                st.warning(f"• {warning}")


def render_model_analysis(converted_data: Dict[str, Any]):
    """Render model analysis and visualization"""
    if not converted_data:
        st.warning("No converted data available for analysis")
        return
    
    # Model structure visualization
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**Layer Dimensions**")
        layer_dims = converted_data.get('layerDimensions', [])
        if layer_dims:
            layer_df = pd.DataFrame([
                {"Layer": i, "Input Dim": dim[0], "Output Dim": dim[1]}
                for i, dim in enumerate(layer_dims)
            ])
            st.dataframe(layer_df, use_container_width=True)
            
            # Create layer dimension visualization
            fig = px.bar(
                layer_df, 
                x='Layer', 
                y=['Input Dim', 'Output Dim'],
                title="Layer Dimensions",
                barmode='group'
            )
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("**Parameter Distribution**")
        weights_mags = converted_data.get('weightsMagnitudes', [])
        if weights_mags:
            param_counts = [len(layer_weights) for layer_weights in weights_mags]
            layer_names = [f"Layer {i}" for i in range(len(param_counts))]
            
            fig = px.pie(
                values=param_counts,
                names=layer_names,
                title="Parameters per Layer"
            )
            st.plotly_chart(fig, use_container_width=True)


def render_json_schema_view(converted_data: Dict[str, Any]):
    """Render JSON schema view with various options"""
    if not converted_data:
        st.warning("No converted data available to display")
        return
    
    st.markdown("### 🔍 OpenGraph JSON Schema")
    st.markdown("This is the complete JSON schema that will be used in the OpenGraph blockchain contract.")
    
    # Create columns for different views
    col1, col2 = st.columns([2, 1])
    
    with col2:
        st.markdown("**Actions:**")
        
        # Format JSON for display
        formatted_json = json.dumps(converted_data, indent=2, ensure_ascii=False)
        
        # Download button
        st.download_button(
            label="📥 Download JSON",
            data=formatted_json,
            file_name="opengraph_model_schema.json",
            mime="application/json"
        )
        
        # Copy to clipboard info
        st.info("💡 **Tip**: You can copy the JSON from the code block below")
        
        # Schema overview
        st.markdown("**Schema Overview:**")
        overview_data = {
            "Fields": len(converted_data.keys()),
            "Layers": len(converted_data.get('layerDimensions', [])),
            "Total Weights": sum(len(w) for w in converted_data.get('weightsMagnitudes', [])),
            "Total Biases": sum(len(b) for b in converted_data.get('biasesMagnitudes', [])),
            "Scale Factor": converted_data.get('scale', 'N/A')
        }
        
        for key, value in overview_data.items():
            st.metric(key, value)
    
    with col1:
        st.markdown("**Complete JSON Schema:**")
        
        # Show formatted JSON
        st.code(formatted_json, language="json")
        
        # Add expandable sections for detailed field explanations
        with st.expander("📚 Field Descriptions", expanded=False):
            render_schema_field_descriptions()
        
        # Add layer-by-layer breakdown
        with st.expander("🏗️ Layer-by-Layer Breakdown", expanded=False):
            render_schema_structure_breakdown(converted_data)
        
        # Add value conversion examples
        with st.expander("🔄 Value Conversion Examples", expanded=False):
            render_value_conversion_examples(converted_data)


def render_schema_field_descriptions():
    """Render detailed descriptions of schema fields"""
    st.markdown("""
    ### OpenGraph Schema Field Descriptions
    
    **`layerDimensions`**: Array of [input_dimension, output_dimension] pairs for each layer
    - Example: `[[784, 128], [128, 10]]` means first layer has 784 inputs → 128 outputs, second layer has 128 inputs → 10 outputs
    
    **`weightsMagnitudes`**: 2D array containing the magnitude (absolute value) of weights for each layer
    - Each inner array contains flattened weight magnitudes for one layer
    - Values are scaled by the scale factor (multiplied by 10^scale)
    
    **`weightsSigns`**: 2D array containing the sign bits of weights for each layer
    - `0` = positive weight, `1` = negative weight
    - Same structure as weightsMagnitudes but with binary values
    
    **`biasesMagnitudes`**: 2D array containing the magnitude (absolute value) of biases for each layer
    - Each inner array contains bias magnitudes for one layer's output neurons
    - Values are scaled by the scale factor
    
    **`biasesSigns`**: 2D array containing the sign bits of biases for each layer
    - `0` = positive bias, `1` = negative bias
    - Same structure as biasesMagnitudes but with binary values
    
    **`scale`**: Integer representing the fixed-point scale factor
    - All weight and bias values are multiplied by 10^scale before conversion to integers
    - Example: scale=2 means values are multiplied by 100
    
    ### Usage in Sui Blockchain
    
    This JSON schema is designed to be directly used with the OpenGraph Sui Move contract's `new_model` function:
    
    ```move
    entry public fun new_model(
        name: String,
        description: String,
        task_type: String,
        layer_dimensions: vector<vector<u64>>,
        weights_magnitudes: vector<vector<u64>>,
        weights_signs: vector<vector<u64>>,
        biases_magnitudes: vector<vector<u64>>,
        biases_signs: vector<vector<u64>>,
        scale: u64,
        // ... other parameters
    )
    ```
    """)


def render_schema_structure_breakdown(converted_data: Dict[str, Any]):
    """Render a detailed breakdown of the schema structure"""
    st.markdown("### 🏗️ Schema Structure Breakdown")
    
    layer_dims = converted_data.get('layerDimensions', [])
    weights_mags = converted_data.get('weightsMagnitudes', [])
    weights_signs = converted_data.get('weightsSigns', [])
    biases_mags = converted_data.get('biasesMagnitudes', [])
    biases_signs = converted_data.get('biasesSigns', [])
    
    if not layer_dims:
        st.warning("No layer dimensions found in schema")
        return
    
    # Create expandable sections for each layer
    for i, (input_dim, output_dim) in enumerate(layer_dims):
        with st.expander(f"🔍 Layer {i} Details", expanded=i == 0):
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Input Dimension", input_dim)
                st.metric("Output Dimension", output_dim)
                st.metric("Expected Weights", input_dim * output_dim)
                st.metric("Expected Biases", output_dim)
            
            with col2:
                if i < len(weights_mags):
                    actual_weights = len(weights_mags[i])
                    st.metric("Actual Weights", actual_weights)
                    weight_match = "✅" if actual_weights == input_dim * output_dim else "❌"
                    st.markdown(f"**Weight Count Match**: {weight_match}")
                
                if i < len(biases_mags):
                    actual_biases = len(biases_mags[i])
                    st.metric("Actual Biases", actual_biases)
                    bias_match = "✅" if actual_biases == output_dim else "❌"
                    st.markdown(f"**Bias Count Match**: {bias_match}")
            
            with col3:
                if i < len(weights_mags) and weights_mags[i]:
                    # Show weight statistics
                    weights = weights_mags[i]
                    st.markdown("**Weight Statistics:**")
                    st.write(f"Min: {min(weights)}")
                    st.write(f"Max: {max(weights)}")
                    st.write(f"Avg: {sum(weights)/len(weights):.2f}")
                    
                    # Count positive/negative weights
                    if i < len(weights_signs):
                        signs = weights_signs[i]
                        positive_count = signs.count(0)
                        negative_count = signs.count(1)
                        st.write(f"Positive: {positive_count}")
                        st.write(f"Negative: {negative_count}")
            
            # Show sample data (first few weights and biases)
            if i < len(weights_mags) and weights_mags[i]:
                st.markdown("**Sample Weight Data (first 10):**")
                sample_weights = []
                for j in range(min(10, len(weights_mags[i]))):
                    mag = weights_mags[i][j]
                    sign = weights_signs[i][j] if i < len(weights_signs) and j < len(weights_signs[i]) else 0
                    actual_value = -mag if sign == 1 else mag
                    sample_weights.append(f"{actual_value}")
                
                st.code(", ".join(sample_weights))
            
            if i < len(biases_mags) and biases_mags[i]:
                st.markdown("**Sample Bias Data:**")
                sample_biases = []
                for j in range(min(len(biases_mags[i]), 10)):
                    mag = biases_mags[i][j]
                    sign = biases_signs[i][j] if i < len(biases_signs) and j < len(biases_signs[i]) else 0
                    actual_value = -mag if sign == 1 else mag
                    sample_biases.append(f"{actual_value}")
                
                st.code(", ".join(sample_biases))


def render_value_conversion_examples(converted_data: Dict[str, Any]):
    """Render examples of how values are converted from float to fixed-point"""
    st.markdown("### 🔄 Fixed-Point Conversion Examples")
    st.markdown("This shows how floating-point weights/biases are converted to magnitude + sign representation.")
    
    scale = converted_data.get('scale', 2)
    st.info(f"**Scale Factor**: {scale} (values are multiplied by 10^{scale} = {10**scale})")
    
    # Create example conversions
    example_floats = [0.5, -0.3, 1.25, -2.1, 0.0, 0.001, -0.999]
    
    conversion_examples = []
    for float_val in example_floats:
        # Apply the same conversion logic as in the converter
        sign_bit = 1 if float_val < 0 else 0
        magnitude = int(round(abs(float_val) * (10 ** scale)))
        
        conversion_examples.append({
            "Original Float": float_val,
            "Sign (0=+, 1=-)": sign_bit,
            "Magnitude": magnitude,
            "Reconstructed": f"{'-' if sign_bit == 1 else ''}{magnitude / (10**scale)}"
        })
    
    # Display as a table
    df = pd.DataFrame(conversion_examples)
    st.dataframe(df, use_container_width=True)
    
    st.markdown("### 📊 Real Data Sample")
    st.markdown("Here are some actual converted values from your model:")
    
    # Show real data samples from the converted model
    weights_mags = converted_data.get('weightsMagnitudes', [])
    weights_signs = converted_data.get('weightsSigns', [])
    
    if weights_mags and weights_signs and len(weights_mags) > 0:
        layer_0_weights_mag = weights_mags[0]
        layer_0_weights_sign = weights_signs[0]
        
        if len(layer_0_weights_mag) > 0:
            st.markdown(f"**Layer 0 - First 10 Weight Values:**")
            
            real_examples = []
            for i in range(min(10, len(layer_0_weights_mag))):
                mag = layer_0_weights_mag[i]
                sign = layer_0_weights_sign[i] if i < len(layer_0_weights_sign) else 0
                reconstructed = (-mag if sign == 1 else mag) / (10 ** scale)
                
                real_examples.append({
                    "Index": i,
                    "Sign": sign,
                    "Magnitude": mag,
                    "Reconstructed Float": f"{reconstructed:.6f}"
                })
            
            real_df = pd.DataFrame(real_examples)
            st.dataframe(real_df, use_container_width=True)
    
    # Add usage instructions
    st.markdown("""
    ### 💡 How to Use This Data
    
    **For Sui Move Contract:**
    ```move
    // Use the magnitude and sign arrays directly
    let weights_mags = vector[10, 30, 125, 210, 0, 1, 99];
    let weights_signs = vector[0, 1, 0, 1, 0, 0, 1];
    ```
    
    **For Reconstruction:**
    ```javascript
    // JavaScript example
    function reconstructFloat(magnitude, sign, scale) {
        const value = magnitude / Math.pow(10, scale);
        return sign === 1 ? -value : value;
    }
    ```
    
    **For Python:**
    ```python
    def reconstruct_float(magnitude, sign, scale):
        value = magnitude / (10 ** scale)
        return -value if sign == 1 else value
    ```
    """)


def render_conversion_history_tab():
    """Render conversion history tab"""
    st.header("Conversion History")
    st.info("This feature will show historical conversion records and statistics.")
    
    # Placeholder for future implementation
    sample_data = pd.DataFrame({
        'Timestamp': ['2024-01-15 10:30:00', '2024-01-15 11:45:00', '2024-01-15 14:20:00'],
        'Model Name': ['mnist_classifier.h5', 'cifar10_model.h5', 'custom_net.h5'],
        'Status': ['Success', 'Failed', 'Success'],
        'Conversion Time': ['2.3s', 'N/A', '4.1s'],
        'Parameters': ['7,850', 'N/A', '12,450']
    })
    
    st.dataframe(sample_data, use_container_width=True)


def render_system_status_tab():
    """Render system status tab"""
    st.header("System Status")
    
    # System health metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("System Status", "🟢 Healthy")
    with col2:
        st.metric("API Status", "🟢 Online")
    with col3:
        st.metric("Conversion Service", "🟢 Ready")
    with col4:
        st.metric("Storage", "🟡 85% Used")
    
    st.divider()
    
    # Environment info
    st.subheader("Environment Information")
    env_info = {
        "TensorFlow Version": "2.19.0",
        "Keras Version": "3.9.2",
        "Python Version": "3.9+",
        "Streamlit Version": "1.30.0",
        "OpenGraph Schema Version": "1.0.0"
    }
    
    env_df = pd.DataFrame(list(env_info.items()), columns=['Component', 'Version'])
    st.dataframe(env_df, use_container_width=True)


def main():
    """Main application entry point"""
    setup_page()
    render_header()
    
    selected_tab = render_sidebar()
    
    if selected_tab == "Model Upload & Validation":
        render_upload_validation_tab()
    elif selected_tab == "Conversion History":
        render_conversion_history_tab()
    elif selected_tab == "System Status":
        render_system_status_tab()


if __name__ == "__main__":
    main() 