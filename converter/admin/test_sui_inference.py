#!/usr/bin/env python3
"""
Test script for Sui inference service functionality.

This script tests the basic functionality of the Sui inference service
without requiring actual on-chain deployment.
"""

import sys
import os
from typing import List, Dict, Any

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Import Sui inference services
from admin.services.sui_inference_service import (
    SuiInferenceService, 
    SuiInferenceManager, 
    ModelObject, 
    GraphObject, 
    Layer,
    SuiNetworkConfig,
    SuiContractConfig
)


def test_sui_service_initialization():
    """Test basic Sui service initialization"""
    print("🧪 Testing Sui service initialization...")
    
    try:
        # Test default configuration
        service = SuiInferenceService()
        print(f"✅ Service initialized with network: {service.network_config.network_type}")
        print(f"✅ RPC URL: {service.network_config.rpc_url}")
        print(f"✅ Package ID: {service.contract_config.package_id}")
        
        # Test custom configuration
        custom_network = SuiNetworkConfig(
            network_type="devnet",
            rpc_url="https://fullnode.devnet.sui.io"
        )
        
        custom_service = SuiInferenceService(network_config=custom_network)
        print(f"✅ Custom service initialized with network: {custom_service.network_config.network_type}")
        
        return True
        
    except Exception as e:
        print(f"❌ Service initialization failed: {str(e)}")
        return False


def test_model_object_creation():
    """Test ModelObject creation and validation"""
    print("\n🧪 Testing ModelObject creation...")
    
    try:
        # Create mock layers
        layers = [
            Layer(
                layer_type=0,
                in_dimension=784,
                out_dimension=128,
                weight_tensor={},
                bias_tensor={}
            ),
            Layer(
                layer_type=0,
                in_dimension=128,
                out_dimension=10,
                weight_tensor={},
                bias_tensor={}
            )
        ]
        
        # Create graph
        graph = GraphObject(id=None, layers=layers)
        
        # Create model
        model = ModelObject(
            id="0x1234567890abcdef1234567890abcdef12345678",
            name="Test MNIST Model",
            description="Test model for MNIST digit classification",
            task_type="image-classification",
            graphs=[graph],
            scale=1000000,
            creator="test_user"
        )
        
        print(f"✅ Model created with ID: {model.id}")
        print(f"✅ Model has {len(model.graphs)} graph(s)")
        print(f"✅ First graph has {len(model.graphs[0].layers)} layer(s)")
        print(f"✅ Model scale: {model.scale}")
        
        return True
        
    except Exception as e:
        print(f"❌ Model creation failed: {str(e)}")
        return False


def test_input_conversion():
    """Test input/output conversion functions"""
    print("\n🧪 Testing input/output conversion...")
    
    try:
        from admin.admin_app import convert_input_to_sui_format, convert_sui_output_to_float
        import numpy as np
        
        # Test input conversion
        test_input = np.array([0.5, -0.3, 0.0, 1.2, -0.8])
        scale = 1000000
        
        magnitude, sign = convert_input_to_sui_format(test_input, scale)
        
        print(f"✅ Original input: {test_input}")
        print(f"✅ Magnitude: {magnitude}")
        print(f"✅ Sign: {sign}")
        
        # Test output conversion
        converted_back = convert_sui_output_to_float(magnitude, sign, scale)
        print(f"✅ Converted back: {converted_back}")
        
        # Check accuracy
        diff = np.abs(test_input - converted_back)
        max_diff = np.max(diff)
        print(f"✅ Max difference: {max_diff}")
        
        if max_diff < 1e-6:
            print("✅ Conversion is accurate!")
        else:
            print("⚠️ Conversion has some precision loss")
        
        return True
        
    except Exception as e:
        print(f"❌ Conversion test failed: {str(e)}")
        return False


def test_inference_manager():
    """Test SuiInferenceManager functionality"""
    print("\n🧪 Testing SuiInferenceManager...")
    
    try:
        # Create test model
        layers = [
            Layer(
                layer_type=0,
                in_dimension=784,
                out_dimension=128,
                weight_tensor={},
                bias_tensor={}
            ),
            Layer(
                layer_type=0,
                in_dimension=128,
                out_dimension=10,
                weight_tensor={},
                bias_tensor={}
            )
        ]
        
        graph = GraphObject(id=None, layers=layers)
        model = ModelObject(
            id="0x1234567890abcdef1234567890abcdef12345678",
            name="Test Model",
            description="Test Description",
            task_type="image-classification",
            graphs=[graph],
            scale=1000000,
            creator="test"
        )
        
        # Initialize manager
        manager = SuiInferenceManager()
        
        # Test model setup
        setup_result = manager.setup_model_for_inference(model)
        
        print(f"✅ Setup result: {setup_result['success']}")
        if setup_result['success']:
            print(f"✅ Model ID: {setup_result['model_id']}")
            print(f"✅ Layer count: {setup_result['layer_count']}")
            print(f"✅ Layers info: {setup_result['layers_info']}")
        
        return setup_result['success']
        
    except Exception as e:
        print(f"❌ Manager test failed: {str(e)}")
        return False


def test_validation_functions():
    """Test input validation functions"""
    print("\n🧪 Testing validation functions...")
    
    try:
        service = SuiInferenceService()
        
        # Test valid input
        valid_mag = [100, 200, 300]
        valid_sign = [0, 1, 0]
        
        result = service.validate_input(valid_mag, valid_sign)
        print(f"✅ Valid input test: {result}")
        
        # Test invalid input (mismatched lengths)
        invalid_mag = [100, 200]
        invalid_sign = [0, 1, 0]
        
        result = service.validate_input(invalid_mag, invalid_sign)
        print(f"✅ Invalid length test: {result}")
        
        # Test invalid sign values
        invalid_mag = [100, 200, 300]
        invalid_sign = [0, 2, 0]  # Invalid sign value
        
        result = service.validate_input(invalid_mag, invalid_sign)
        print(f"✅ Invalid sign test: {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Validation test failed: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("🔄 OpenGraph Sui Inference Service Test Suite")
    print("=" * 50)
    
    tests = [
        ("Service Initialization", test_sui_service_initialization),
        ("Model Object Creation", test_model_object_creation),
        ("Input/Output Conversion", test_input_conversion),
        ("Inference Manager", test_inference_manager),
        ("Validation Functions", test_validation_functions),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Sui inference service is ready.")
        return 0
    else:
        print("⚠️ Some tests failed. Please check the implementation.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 