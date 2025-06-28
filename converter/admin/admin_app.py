"""
OpenGraph Model Converter Admin Dashboard

This Streamlit application provides a user interface for validating ML model conversions
and comparing Web2 TensorFlow models with their Sui On-chain twins.
"""

import os
import sys
import tempfile
import traceback
from typing import Dict, Any, Optional, Tuple, List
import json
import numpy as np

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
from admin.services.tensorflow_inference_service import TensorFlowInferenceManager


def setup_page():
    """Configure Streamlit page settings"""
    st.set_page_config(
        page_title="OpenGraph Model Validator",
        page_icon="🔄",
        layout="wide",
        initial_sidebar_state="expanded"
    )


def render_header():
    """Render the application header"""
    st.title("🔄 OpenGraph Model Validator")
    st.markdown("### Validate ML model conversions and compare Web2 ↔ Sui On-chain inference results")
    st.divider()


def render_sidebar():
    """Render the sidebar with navigation and info"""
    with st.sidebar:
        st.header("Navigation")
        tab = st.radio(
            "Select Function",
            ["Model Conversion", "Model Validation", "System Status"]
        )
        
        st.divider()
        
        st.header("Validation Process")
        st.markdown("""
        **Step 1**: Upload .h5 model → Convert to OpenGraph schema
        
        **Step 2**: Test Web2 inference vs Sui On-chain inference
        
        **Step 3**: Validate identical behavior
        """)
        
        st.divider()
        
        st.header("Supported Models")
        st.markdown("""
        - **Input**: Keras/TensorFlow .h5
        - **Architecture**: Dense layers only
        - **Activation**: ReLU (hidden), None (output)
        """)
        
    return tab


def render_conversion_tab():
    """Render the model conversion interface"""
    st.header("🔄 Model Conversion")
    st.markdown("Upload your .h5 model file and convert it to OpenGraph schema for Sui blockchain.")
    
    # File upload
    uploaded_file = st.file_uploader(
        "Upload .h5 Model File",
        type=['h5'],
        help="Upload a Keras/TensorFlow .h5 model file"
    )
    
    if uploaded_file is not None:
        # Display basic file info
        col1, col2 = st.columns(2)
        with col1:
            st.metric("File Name", uploaded_file.name)
        with col2:
            st.metric("File Size", format_file_size(uploaded_file.size))
        
        if st.button("🔄 Convert Model", type="primary"):
            process_model_conversion(uploaded_file)


def process_model_conversion(uploaded_file):
    """Process model conversion with simplified output"""
    with st.spinner("Converting model..."):
        try:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.h5') as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_file_path = tmp_file.name
            
            # Initialize services
            validator = ModelValidator()
            conversion_service = ConversionService()
            
            # Step 1: Validate and convert
            file_validation = validator.validate_file(tmp_file_path)
            
            if not file_validation.get('is_valid', False):
                st.error("❌ Invalid model file")
                for error in file_validation.get('errors', []):
                    st.error(f"• {error}")
                return
            
            conversion_result = conversion_service.convert_model(tmp_file_path)
            
            if not conversion_result.get('success', False):
                st.error("❌ Conversion failed")
                st.error(conversion_result.get('error', 'Unknown error'))
                return
            
            # Success - show results
            st.success("✅ Model converted successfully!")
            
            # Show conversion summary
            converted_data = conversion_result.get('converted_data', {})
            render_conversion_summary(converted_data)
            
            # Store conversion result in session state for validation
            st.session_state['converted_model'] = converted_data
            st.session_state['original_model_path'] = tmp_file_path
            
            st.info("💡 **Next Step**: Go to 'Model Validation' tab to test inference comparison")
            
        except Exception as e:
            st.error(f"Conversion error: {str(e)}")
            st.code(traceback.format_exc(), language="python")


def render_conversion_summary(converted_data: Dict[str, Any]):
    """Render a concise summary of the conversion result"""
    col1, col2, col3, col4 = st.columns(4)
    
    layer_dims = converted_data.get('layerDimensions', [])
    weights_mags = converted_data.get('weightsMagnitudes', [])
    
    with col1:
        st.metric("Layers", len(layer_dims))
    with col2:
        total_weights = sum(len(w) for w in weights_mags)
        st.metric("Parameters", f"{total_weights:,}")
    with col3:
        st.metric("Scale Factor", converted_data.get('scale', 'N/A'))
    with col4:
        st.metric("Task Type", converted_data.get('task_type', 'Classification'))
    
    # Show model architecture
    if layer_dims:
        st.markdown("**Model Architecture:**")
        arch_info = []
        for i, (input_dim, output_dim) in enumerate(layer_dims):
            layer_type = "Output" if i == len(layer_dims) - 1 else "Hidden"
            arch_info.append(f"Layer {i}: {input_dim} → {output_dim} ({layer_type})")
        
        for info in arch_info:
            st.text(info)
    
    # JSON Schema section (simplified)
    with st.expander("📄 OpenGraph JSON Schema", expanded=False):
        formatted_json = json.dumps(converted_data, indent=2)
        
        st.markdown("**JSON Schema for Sui Contract:**")
        st.code(formatted_json, language="json", line_numbers=False)
        
        st.info("💡 **Usage**: Copy the JSON above and use it with the Sui `new_model` function")


def render_validation_tab():
    """Render the model validation interface"""
    st.header("🧪 Model Validation")
    st.markdown("Compare Web2 TensorFlow inference with Sui On-chain inference to ensure identical behavior.")
    
    # Check if we have a converted model
    if 'converted_model' not in st.session_state:
        st.warning("⚠️ No converted model available. Please convert a model first in the 'Model Conversion' tab.")
        return
    
    converted_model = st.session_state['converted_model']
    original_model_path = st.session_state.get('original_model_path')
    
    if not original_model_path:
        st.error("❌ Original model path not found. Please reconvert the model.")
        return
    
    st.success(f"✅ Using converted model: {converted_model.get('name', 'Unknown')}")
    
    # Model information
    layer_dims = converted_model.get('layerDimensions', [])
    if not layer_dims:
        st.error("Invalid model: No layer dimensions found")
        return
    
    input_dim = layer_dims[0][0] if layer_dims else 0
    output_dim = layer_dims[-1][1] if layer_dims else 0
    
    # Test input configuration section
    st.subheader("🎯 Test Input Configuration")
    
    # Get actual model info for better display
    model_input_info = "Unknown"
    recommended_size = "28x28"
    try:
        tf_manager = TensorFlowInferenceManager()
        setup_result = tf_manager.setup_model_for_inference(original_model_path)
        if setup_result['success']:
            model_info = setup_result['model_info']
            input_shape = model_info.get('input_shape', [])
            if isinstance(input_shape, (list, tuple)) and len(input_shape) >= 2:
                actual_input_dim = input_shape[-1]
                if actual_input_dim:
                    model_input_info = f"{actual_input_dim} features"
                    sqrt_dim = int(np.sqrt(actual_input_dim))
                    if sqrt_dim * sqrt_dim == actual_input_dim:
                        recommended_size = f"{sqrt_dim}x{sqrt_dim}"
    except Exception:
        pass
    
    col1, col2 = st.columns(2)
    with col1:
        st.info(f"**Schema Input Dimension**: {input_dim}")
        st.info(f"**Schema Output Dimension**: {output_dim}")
        if model_input_info != "Unknown":
            st.success(f"**Actual Model Input**: {model_input_info}")
            st.success(f"**Recommended Image Size**: {recommended_size}")
    
    with col2:
        # Test input options
        input_type = st.selectbox(
            "Test Input Type",
            ["Image Upload", "Random Input", "Custom Input"]
        )
        
        num_tests = st.slider("Number of Test Cases", 1, 5, 1)
    
    # Input configuration based on type
    test_inputs = []
    uploaded_image = None
    
    if input_type == "Image Upload":
        st.markdown("**Upload Test Image:**")
        uploaded_image = st.file_uploader(
            "Choose an image file",
            type=['png', 'jpg', 'jpeg', 'bmp', 'gif'],
            help="Upload an image to test inference"
        )
        
        if uploaded_image is not None:
            # Display uploaded image
            col1, col2 = st.columns([1, 2])
            with col1:
                st.image(uploaded_image, caption="Uploaded Image", width=200)
            with col2:
                st.write(f"**Filename**: {uploaded_image.name}")
                st.write(f"**Size**: {format_file_size(uploaded_image.size)}")
                st.write(f"**Type**: {uploaded_image.type}")
            
            # Preprocessing options
            with st.expander("🔧 Image Preprocessing Options", expanded=False):
                # Try to get model info to suggest better defaults
                default_size = 28
                try:
                    # Initialize TensorFlow manager to get model info
                    if 'original_model_path' in st.session_state:
                        tf_manager = TensorFlowInferenceManager()
                        setup_result = tf_manager.setup_model_for_inference(st.session_state['original_model_path'])
                        if setup_result['success']:
                            model_info = setup_result['model_info']
                            input_shape = model_info.get('input_shape', [])
                            
                            # Try to determine the correct size
                            if isinstance(input_shape, (list, tuple)) and len(input_shape) >= 2:
                                input_dim = input_shape[-1]
                                if input_dim == 784:
                                    default_size = 28
                                elif input_dim == 196:
                                    default_size = 14
                                elif input_dim == 1024:
                                    default_size = 32
                                elif input_dim == 400:
                                    default_size = 20
                                else:
                                    sqrt_dim = int(np.sqrt(input_dim)) if input_dim and input_dim > 0 else 28
                                    if sqrt_dim * sqrt_dim == input_dim:
                                        default_size = sqrt_dim
                            
                            st.info(f"💡 **Model expects {input_dim} features** → Recommended size: {default_size}x{default_size}")
                except Exception:
                    pass  # Use default if failed
                
                col1, col2 = st.columns(2)
                with col1:
                    target_height = st.number_input("Target Height", value=default_size, min_value=1, max_value=512)
                    normalize = st.checkbox("Normalize (0-1)", value=True)
                with col2:
                    target_width = st.number_input("Target Width", value=default_size, min_value=1, max_value=512)
                    flatten = st.checkbox("Flatten for Dense Model", value=True)
                
                st.session_state['preprocessing_config'] = {
                    'target_size': (target_height, target_width),
                    'normalize': normalize,
                    'flatten': flatten
                }
    else:
        # Generate test inputs for non-image types
        test_inputs = generate_test_inputs(input_type, input_dim, num_tests)
    
    # Run validation section
    st.divider()
    
    if st.button("🚀 Run Validation Tests", type="primary"):
        if input_type == "Image Upload" and uploaded_image is not None:
            run_validation_tests_with_image(converted_model, original_model_path, uploaded_image)
        elif input_type != "Image Upload":
            run_validation_tests(converted_model, original_model_path, test_inputs)
        else:
            st.error("Please upload an image or select a different input type.")


def generate_test_inputs(input_type: str, input_dim: int, num_tests: int) -> List[np.ndarray]:
    """Generate test inputs based on the selected type"""
    test_inputs = []
    
    if input_type == "Random Input":
        for _ in range(num_tests):
            # Generate random input normalized between -1 and 1
            test_input = np.random.uniform(-1, 1, size=input_dim)
            test_inputs.append(test_input)
    
    elif input_type == "Custom Input":
        st.markdown("**Custom Input Configuration:**")
        # For now, use zeros as placeholder
        for i in range(num_tests):
            test_input = np.zeros(input_dim)
            test_inputs.append(test_input)
        
        st.info("💡 Custom input configuration will be implemented in future updates")
    
    elif input_type == "Sample Dataset":
        # Use common test patterns
        for i in range(num_tests):
            if i % 3 == 0:
                test_input = np.ones(input_dim) * 0.5  # Positive values
            elif i % 3 == 1:
                test_input = np.ones(input_dim) * -0.5  # Negative values
            else:
                test_input = np.random.normal(0, 0.3, input_dim)  # Normal distribution
            test_inputs.append(test_input)
    
    return test_inputs


def run_validation_tests_with_image(converted_model: Dict[str, Any], original_model_path: str, uploaded_image):
    """Run validation tests using uploaded image"""
    
    with st.spinner("Running validation tests with uploaded image..."):
        try:
            # Initialize TensorFlow inference manager
            tf_manager = TensorFlowInferenceManager()
            
            # Setup the original model for inference
            setup_result = tf_manager.setup_model_for_inference(original_model_path)
            
            if not setup_result['success']:
                st.error(f"❌ Failed to load TensorFlow model: {setup_result['error']}")
                return
            
            st.success("✅ TensorFlow model loaded successfully")
            
            # Display model information
            model_info = setup_result['model_info']
            st.markdown("#### 📋 Model Information")
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.text(f"Model Type: {model_info.get('model_type', 'Unknown')}")
                st.text(f"Total Params: {model_info.get('total_params', 'Unknown'):,}")
            with col2:
                st.text(f"Input Shape: {model_info.get('input_shape', 'Unknown')}")
                st.text(f"Output Shape: {model_info.get('output_shape', 'Unknown')}")
            with col3:
                st.text(f"Layers: {model_info.get('num_layers', 'Unknown')}")
            
            # Get preprocessing config from session state, or use model defaults
            preprocessing_config = st.session_state.get('preprocessing_config', {})
            
            # If no custom config provided, use model's default preprocessing
            if not preprocessing_config:
                preprocessing_config = tf_manager.service._get_default_preprocessing_config()
                st.info(f"🔧 Using automatic preprocessing: {preprocessing_config}")
            else:
                st.info(f"🔧 Using custom preprocessing: {preprocessing_config}")
            
            # Read uploaded image
            image_bytes = uploaded_image.getvalue()
            
            # Run Web2 TensorFlow inference
            st.markdown("### 🔄 Running Web2 TensorFlow Inference...")
            web2_result = tf_manager.run_inference_test(
                image_input=image_bytes,
                preprocessing_config=preprocessing_config
            )
            
            if not web2_result['success']:
                st.error(f"❌ Web2 inference failed: {web2_result['error']}")
                return
            
            # Extract input for Sui inference (use the same preprocessed input)
            # For now, simulate Sui inference
            st.markdown("### ⛓️ Running Sui On-chain Inference...")
            sui_result = simulate_sui_inference(converted_model, None)  # Will be replaced with actual Sui call
            
            # Display results
            st.markdown("### 📊 Inference Results")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown("**🐍 Web2 TensorFlow**")
                st.json({
                    "predicted_class": web2_result['argmax'],
                    "confidence": f"{web2_result['confidence']:.4f}",
                    "top_3_probs": {
                        str(i): f"{prob:.4f}" 
                        for i, prob in enumerate(web2_result['prediction'][:3])
                    }
                })
                
                # Show model info
                model_info = web2_result.get('model_info', {})
                st.markdown("**Model Info:**")
                st.text(f"Type: {model_info.get('model_type', 'Unknown')}")
                st.text(f"Input Shape: {web2_result.get('input_info', {}).get('input_shape', 'Unknown')}")
            
            with col2:
                st.markdown("**⛓️ Sui On-chain**")
                st.json({
                    "predicted_class": sui_result['argmax'],
                    "confidence": f"{sui_result['confidence']:.4f}",
                    "top_3_probs": {
                        str(i): f"{prob:.4f}" 
                        for i, prob in enumerate(sui_result['prediction'][:3])
                    }
                })
                
                st.info("🚧 Using simulated Sui inference")
            
            with col3:
                # Compare results
                comparison = compare_inference_results(web2_result, sui_result)
                
                st.markdown("**🔍 Comparison**")
                if comparison['identical']:
                    st.success("✅ Identical")
                else:
                    st.error("❌ Different")
                
                st.metric("Max Difference", f"{comparison['max_diff']:.6f}")
                st.metric("Prediction Match", "Yes" if comparison['argmax_match'] else "No")
                
                # Additional metrics
                if comparison['argmax_match']:
                    st.success("🎯 Predictions Match!")
                else:
                    st.error(f"🎯 Different Predictions: TF={comparison['web2_argmax']}, Sui={comparison['sui_argmax']}")
            
            # Show detailed analysis
            render_detailed_inference_analysis(web2_result, sui_result, comparison)
            
        except Exception as e:
            st.error(f"❌ Validation test failed: {str(e)}")
            st.code(traceback.format_exc(), language="python")


def run_validation_tests(converted_model: Dict[str, Any], original_model_path: str, test_inputs: List[np.ndarray]):
    """Run validation tests comparing Web2 and Sui inference"""
    
    with st.spinner("Running validation tests..."):
        try:
            # Initialize TensorFlow inference manager
            tf_manager = TensorFlowInferenceManager()
            
            # Setup the original model for inference
            setup_result = tf_manager.setup_model_for_inference(original_model_path)
            
            if not setup_result['success']:
                st.error(f"❌ Failed to load TensorFlow model: {setup_result['error']}")
                return
            
            st.success("✅ TensorFlow model loaded successfully")
            
            results = []
            
            for i, test_input in enumerate(test_inputs):
                st.markdown(f"### Test Case {i+1}")
                
                # Web2 TensorFlow Inference
                web2_result = tf_manager.run_inference_test(numpy_input=test_input)
                
                if not web2_result['success']:
                    st.error(f"❌ Web2 inference failed: {web2_result['error']}")
                    continue
                
                # Sui On-chain Inference (simulated for now)
                sui_result = simulate_sui_inference(converted_model, test_input)
                
                # Compare results
                comparison = compare_inference_results(web2_result, sui_result)
                results.append(comparison)
                
                # Display results
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.markdown("**🐍 Web2 TensorFlow**")
                    st.json({
                        "prediction": web2_result['argmax'],
                        "confidence": f"{web2_result['confidence']:.4f}",
                    })
                
                with col2:
                    st.markdown("**⛓️ Sui On-chain**")
                    st.json({
                        "prediction": sui_result['argmax'],
                        "confidence": f"{sui_result['confidence']:.4f}",
                    })
                
                with col3:
                    st.markdown("**🔍 Comparison**")
                    if comparison['identical']:
                        st.success("✅ Identical")
                    else:
                        st.error("❌ Different")
                    
                    st.metric("Difference", f"{comparison['max_diff']:.6f}")
                    st.metric("Match", "Yes" if comparison['argmax_match'] else "No")
            
            # Overall validation summary
            if results:
                render_validation_summary(results)
                
        except Exception as e:
            st.error(f"❌ Validation test failed: {str(e)}")
            st.code(traceback.format_exc(), language="python")


def render_detailed_inference_analysis(web2_result: Dict[str, Any], sui_result: Dict[str, Any], comparison: Dict[str, Any]):
    """Render detailed analysis of inference results"""
    st.divider()
    st.subheader("🔍 Detailed Analysis")
    
    # Create tabs for different analysis views
    analysis_tab, probability_tab, technical_tab = st.tabs(["📈 Prediction Analysis", "📊 Probability Distribution", "🔧 Technical Details"])
    
    with analysis_tab:
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**🎯 Prediction Summary**")
            
            # Prediction comparison
            web2_pred = web2_result.get('argmax', 0)
            sui_pred = sui_result.get('argmax', 0)
            
            prediction_data = {
                "Engine": ["Web2 TensorFlow", "Sui On-chain"],
                "Predicted Class": [web2_pred, sui_pred],
                "Confidence": [
                    f"{web2_result.get('confidence', 0):.4f}",
                    f"{sui_result.get('confidence', 0):.4f}"
                ]
            }
            
            st.dataframe(pd.DataFrame(prediction_data), use_container_width=True)
            
            # Verdict
            if comparison['identical']:
                st.success("🎉 **PERFECT MATCH**: Results are numerically identical!")
            elif comparison['argmax_match']:
                st.warning("⚠️ **PREDICTION MATCH**: Same prediction, minor numerical differences")
            else:
                st.error("❌ **PREDICTION MISMATCH**: Different predictions detected")
        
        with col2:
            st.markdown("**📊 Confidence Analysis**")
            
            # Confidence difference
            conf_diff = abs(web2_result.get('confidence', 0) - sui_result.get('confidence', 0))
            st.metric("Confidence Difference", f"{conf_diff:.6f}")
            st.metric("Max Probability Difference", f"{comparison['max_diff']:.6f}")
            st.metric("Mean Probability Difference", f"{comparison.get('mean_diff', 0):.6f}")
    
    with probability_tab:
        # Probability distribution comparison
        web2_probs = web2_result.get('prediction', [])
        sui_probs = sui_result.get('prediction', [])
        
        if web2_probs and sui_probs:
            # Create comparison chart
            prob_df = pd.DataFrame({
                'Class': range(len(web2_probs)),
                'Web2 TensorFlow': web2_probs,
                'Sui On-chain': sui_probs
            })
            
            fig = px.bar(
                prob_df.melt(id_vars=['Class'], var_name='Engine', value_name='Probability'),
                x='Class',
                y='Probability',
                color='Engine',
                title="Probability Distribution Comparison",
                barmode='group'
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Top predictions table
            st.markdown("**🏆 Top 5 Predictions**")
            
            web2_sorted = sorted(enumerate(web2_probs), key=lambda x: x[1], reverse=True)[:5]
            sui_sorted = sorted(enumerate(sui_probs), key=lambda x: x[1], reverse=True)[:5]
            
            top_pred_data = []
            for i in range(5):
                if i < len(web2_sorted) and i < len(sui_sorted):
                    web2_class, web2_prob = web2_sorted[i]
                    sui_class, sui_prob = sui_sorted[i]
                    
                    top_pred_data.append({
                        "Rank": i + 1,
                        "Web2 Class": web2_class,
                        "Web2 Prob": f"{web2_prob:.4f}",
                        "Sui Class": sui_class,
                        "Sui Prob": f"{sui_prob:.4f}",
                        "Match": "✅" if web2_class == sui_class else "❌"
                    })
            
            if top_pred_data:
                st.dataframe(pd.DataFrame(top_pred_data), use_container_width=True)
    
    with technical_tab:
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**🐍 Web2 TensorFlow Details**")
            web2_info = {
                "Model Type": web2_result.get('model_info', {}).get('model_type', 'Unknown'),
                "Input Shape": str(web2_result.get('input_info', {}).get('shape', 'Unknown')),
                "Input Type": web2_result.get('input_type', 'Unknown'),
                "Total Parameters": web2_result.get('model_info', {}).get('total_params', 'Unknown'),
                "Number of Classes": web2_result.get('num_classes', len(web2_result.get('prediction', [])))
            }
            
            for key, value in web2_info.items():
                st.text(f"{key}: {value}")
        
        with col2:
            st.markdown("**⛓️ Sui On-chain Details**")
            sui_info = {
                "Implementation": "Simulated (Move Contract Pending)",
                "Inference Type": "On-chain",
                "Fixed Point Scale": "TBD",
                "Layer Count": "TBD",
                "Gas Usage": "TBD"
            }
            
            for key, value in sui_info.items():
                st.text(f"{key}: {value}")
        
        # Raw data comparison (collapsed by default)
        with st.expander("🔍 Raw Inference Data", expanded=False):
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown("**Web2 Raw Output:**")
                st.code(str(web2_result.get('raw_output', [])), language="python")
            
            with col2:
                st.markdown("**Sui Raw Output:**")
                st.code(str(sui_result.get('raw_output', [])), language="python")


def simulate_web2_inference(test_input: np.ndarray) -> Dict[str, Any]:
    """Simulate Web2 TensorFlow inference (placeholder)"""
    # This would use the actual TensorFlow model
    # For now, simulate with random output
    output_dim = 10  # Assume 10 classes for demo
    raw_output = np.random.randn(output_dim)
    # Apply softmax manually
    exp_output = np.exp(raw_output - np.max(raw_output))
    output = exp_output / np.sum(exp_output)
    
    return {
        'raw_output': output,
        'prediction': output.tolist(),
        'confidence': float(np.max(output)),
        'argmax': int(np.argmax(output))
    }


def simulate_sui_inference(converted_model: Dict[str, Any], test_input: np.ndarray) -> Dict[str, Any]:
    """Simulate Sui On-chain inference (placeholder)"""
    # This would call the actual Sui contract
    # For now, simulate with similar output structure
    layer_dims = converted_model.get('layerDimensions', [])
    output_dim = layer_dims[-1][1] if layer_dims else 10
    
    raw_output = np.random.randn(output_dim)
    # Apply softmax manually
    exp_output = np.exp(raw_output - np.max(raw_output))
    output = exp_output / np.sum(exp_output)
    
    return {
        'raw_output': output,
        'prediction': output.tolist(),
        'confidence': float(np.max(output)),
        'argmax': int(np.argmax(output))
    }


def compare_inference_results(web2_result: Dict[str, Any], sui_result: Dict[str, Any]) -> Dict[str, Any]:
    """Compare Web2 and Sui inference results"""
    web2_pred = np.array(web2_result['prediction'])
    sui_pred = np.array(sui_result['prediction'])
    
    # Calculate differences
    diff = np.abs(web2_pred - sui_pred)
    max_diff = float(np.max(diff))
    mean_diff = float(np.mean(diff))
    
    # Check if argmax matches
    argmax_match = web2_result['argmax'] == sui_result['argmax']
    
    # Consider identical if differences are very small (accounting for floating point precision)
    identical = max_diff < 1e-6 and argmax_match
    
    return {
        'identical': identical,
        'max_diff': max_diff,
        'mean_diff': mean_diff,
        'argmax_match': argmax_match,
        'web2_argmax': web2_result['argmax'],
        'sui_argmax': sui_result['argmax']
    }


def render_validation_summary(results: List[Dict[str, Any]]):
    """Render overall validation summary"""
    st.divider()
    st.subheader("📊 Validation Summary")
    
    total_tests = len(results)
    identical_count = sum(1 for r in results if r['identical'])
    argmax_match_count = sum(1 for r in results if r['argmax_match'])
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Tests", total_tests)
    with col2:
        st.metric("Identical Results", f"{identical_count}/{total_tests}")
    with col3:
        st.metric("Prediction Match", f"{argmax_match_count}/{total_tests}")
    with col4:
        success_rate = (identical_count / total_tests) * 100 if total_tests > 0 else 0
        st.metric("Success Rate", f"{success_rate:.1f}%")
    
    # Detailed results table
    if results:
        st.markdown("**Detailed Results:**")
        results_df = pd.DataFrame([
            {
                "Test": i+1,
                "Identical": "✅" if r['identical'] else "❌",
                "Max Difference": f"{r['max_diff']:.6f}",
                "Web2 Prediction": r['web2_argmax'],
                "Sui Prediction": r['sui_argmax'],
                "Match": "✅" if r['argmax_match'] else "❌"
            }
            for i, r in enumerate(results)
        ])
        st.dataframe(results_df, use_container_width=True)
    
    # Validation verdict
    if identical_count == total_tests:
        st.success("🎉 **VALIDATION PASSED**: All inference results are identical!")
    elif argmax_match_count == total_tests:
        st.warning("⚠️ **PARTIAL VALIDATION**: Predictions match but numerical differences exist")
    else:
        st.error("❌ **VALIDATION FAILED**: Inference results differ significantly")


def render_system_status_tab():
    """Render system status tab"""
    st.header("⚙️ System Status")
    
    # System health metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Conversion Service", "🟢 Ready")
    with col2:
        st.metric("TensorFlow", "🟢 Available")
    with col3:
        st.metric("Sui Connection", "🟡 Not Connected")  # Will be implemented
    with col4:
        st.metric("Validation Engine", "🟢 Ready")
    
    st.divider()
    
    # Implementation status
    st.subheader("🚧 Implementation Status")
    
    features_status = {
        "H5 to OpenGraph Conversion": "✅ Implemented",
        "Web2 TensorFlow Inference": "✅ Implemented (with image support)",
        "Image Preprocessing": "✅ Implemented (Dense & Conv models)",
        "Sui Contract Integration": "❌ Not implemented",
        "On-chain Inference": "❌ Not implemented", 
        "Result Comparison Engine": "✅ Implemented",
        "Validation Reporting": "✅ Implemented (with detailed analysis)"
    }
    
    for feature, status in features_status.items():
        col1, col2 = st.columns([3, 1])
        with col1:
            st.text(feature)
        with col2:
            st.text(status)
    
    st.divider()
    
    # Environment info
    st.subheader("🔧 Environment")
    env_info = {
        "Python": "3.9+",
        "TensorFlow": "2.19.0",
        "Streamlit": "1.30.0",
        "OpenGraph Schema": "1.0.0"
    }
    
    for component, version in env_info.items():
        col1, col2 = st.columns([2, 1])
        with col1:
            st.text(component)
        with col2:
            st.text(version)


def main():
    """Main application entry point"""
    setup_page()
    render_header()
    
    selected_tab = render_sidebar()
    
    if selected_tab == "Model Conversion":
        render_conversion_tab()
    elif selected_tab == "Model Validation":
        render_validation_tab()
    elif selected_tab == "System Status":
        render_system_status_tab()


if __name__ == "__main__":
    main() 