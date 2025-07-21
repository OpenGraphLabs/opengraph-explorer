from tensorflow.keras.models import load_model
import json
from pydantic import BaseModel
from typing import List
import os
import numpy as np

class Model(BaseModel):
    """
    Sui 블록체인 컨트랙트의 initialize_model 함수에 맞춘 Model 스키마

    예시:
    {
        "layerNames": [
        "dense",  # 첫 번째 레이어
        "dense_1"   # 두 번째 레이어
      ],
      "layerType": [
        "dense",  # 첫 번째 레이어
        "dense"   # 두 번째 레이어
      ],


      "activationNames" : [
        "relu",
        "relu"
      ],


      "layerDimensions": [
        [4, 3],  # 첫 번째 레이어: 입력 4, 출력 3
        [3, 2]   # 두 번째 레이어: 입력 3, 출력 2
      ],
      "weightsMagnitudes": [
        [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12],
        [15, 15, 15, 15, 15, 6]
      ],
      "weightsSigns": [
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1]
      ],
      "biasesMagnitudes": [
        [5, 5, 5],
        [7, 7]
      ],
      "biasesSigns": [
        [0, 0, 0],
        [0, 0]
      ],
      "scale": 2
    }
    """

    layerNames: List[str]
    activationNames: List[str]
    layerType: List[str]


    layerDimensions: List[List[int]]
    weightsMagnitudes: List[List[int]]
    weightsSigns: List[List[int]]
    biasesMagnitudes: List[List[int]]
    biasesSigns: List[List[int]]
    scale: int

def float_to_fixed(x, scale):
    """ Convert float to (sign_bit, abs_val) for a given scale """
    sign_bit = 0
    if x < 0:
        sign_bit = 1
        x = -x
    factor = 10 ** scale
    abs_val = int(round(x * factor))  # Round to nearest integer
    return sign_bit, abs_val

def get_activation_name(activation):
    """Convert Keras activation function to string name"""
    if activation is None:
        return "linear"
    elif hasattr(activation, '__name__'):
        return activation.__name__
    elif callable(activation):
        return activation.__class__.__name__.lower()
    else:
        return str(activation)

def get_layer_type(layer):
    """Get the type of Keras layer as a string"""
    layer_class_name = layer.__class__.__name__.lower()
    
    # Map common layer types to standardized names
    layer_type_mapping = {
        'dense': 'dense',
        'conv2d': 'conv2d',
        'conv1d': 'conv1d',
        'conv3d': 'conv3d',
        'flatten': 'flatten',
        'maxpooling2d': 'maxpool2d',
        'averagepooling2d': 'avgpool2d',
        'dropout': 'dropout',
        'batchnormalization': 'batchnorm',
        'lstm': 'lstm',
        'gru': 'gru',
        'simple_rnn': 'rnn'
    }
    
    return layer_type_mapping.get(layer_class_name, layer_class_name)

def convert_model_to_schema(model, scale=2):
    """Convert Keras model to Model schema format"""
    layerNames = []
    activationNames = []
    layerTypes = []
    layer_dimensions = []
    weights_magnitudes = []
    weights_signs = []
    biases_magnitudes = []
    biases_signs = []
    
    for layer in model.layers:
        weights = layer.get_weights()
        layer_type = get_layer_type(layer)
        
        # Add layer name, type and activation
        layerNames.append(layer.name)
        layerTypes.append(layer_type)
        activationNames.append(get_activation_name(layer.activation))
        
        if len(weights) == 0:
            # For layers without weights (like Flatten, Dropout), add empty dimensions
            layer_dimensions.append([0, 0])
            weights_magnitudes.append([])
            weights_signs.append([])
            biases_magnitudes.append([])
            biases_signs.append([])
            continue
        
        # Handle different layer types
        if layer_type == 'dense':
            # Dense layer: weights[0] = kernel, weights[1] = bias
            if len(weights) >= 2:
                kernel = weights[0]  # shape=[in_dim, out_dim]
                bias = weights[1]    # shape=[out_dim]
                
                # Add layer dimensions
                layer_dimensions.append([kernel.shape[0], kernel.shape[1]])
                
                # Process kernel weights
                kernel_flat = kernel.flatten()
                layer_weights_mag = []
                layer_weights_sign = []
                
                for val in kernel_flat:
                    sign_bit, abs_val = float_to_fixed(val, scale)
                    layer_weights_sign.append(sign_bit)
                    layer_weights_mag.append(abs_val)
                
                weights_magnitudes.append(layer_weights_mag)
                weights_signs.append(layer_weights_sign)
                
                # Process biases
                bias_flat = bias.flatten()
                layer_bias_mag = []
                layer_bias_sign = []
                
                for val in bias_flat:
                    sign_bit, abs_val = float_to_fixed(val, scale)
                    layer_bias_sign.append(sign_bit)
                    layer_bias_mag.append(abs_val)
                
                biases_magnitudes.append(layer_bias_mag)
                biases_signs.append(layer_bias_sign)
        
        elif layer_type == 'conv2d':
            # Conv2D layer: weights[0] = kernel, weights[1] = bias
            if len(weights) >= 2:
                kernel = weights[0]  # shape=[h, w, in_channels, out_channels]
                bias = weights[1]    # shape=[out_channels]
                
                # Add layer dimensions (flattened kernel dimensions)
                kernel_flat = kernel.flatten()
                layer_dimensions.append([kernel_flat.shape[0], bias.shape[0]])
                
                # Process kernel weights
                layer_weights_mag = []
                layer_weights_sign = []
                
                for val in kernel_flat:
                    sign_bit, abs_val = float_to_fixed(val, scale)
                    layer_weights_sign.append(sign_bit)
                    layer_weights_mag.append(abs_val)
                
                weights_magnitudes.append(layer_weights_mag)
                weights_signs.append(layer_weights_sign)
                
                # Process biases
                bias_flat = bias.flatten()
                layer_bias_mag = []
                layer_bias_sign = []
                
                for val in bias_flat:
                    sign_bit, abs_val = float_to_fixed(val, scale)
                    layer_bias_sign.append(sign_bit)
                    layer_bias_mag.append(abs_val)
                
                biases_magnitudes.append(layer_bias_mag)
                biases_signs.append(layer_bias_sign)
        
        else:
            # For other layer types, try to process weights if available
            if len(weights) > 0:
                # Flatten all weights and process
                all_weights = np.concatenate([w.flatten() for w in weights])
                layer_dimensions.append([len(all_weights), 1])
                
                layer_weights_mag = []
                layer_weights_sign = []
                
                for val in all_weights:
                    sign_bit, abs_val = float_to_fixed(val, scale)
                    layer_weights_sign.append(sign_bit)
                    layer_weights_mag.append(abs_val)
                
                weights_magnitudes.append(layer_weights_mag)
                weights_signs.append(layer_weights_sign)
                biases_magnitudes.append([])
                biases_signs.append([])
            else:
                layer_dimensions.append([0, 0])
                weights_magnitudes.append([])
                weights_signs.append([])
                biases_magnitudes.append([])
                biases_signs.append([])
    
    # Create the Model schema object
    model_schema = Model(
        layerNames=layerNames,
        activationNames=activationNames,
        layerType=layerTypes,
        layerDimensions=layer_dimensions,
        weightsMagnitudes=weights_magnitudes,
        weightsSigns=weights_signs,
        biasesMagnitudes=biases_magnitudes,
        biasesSigns=biases_signs,
        scale=scale
    )
    
    return model_schema

########################################################################################################################
NAME = "mnist_14_14"

path = f"../../{NAME}/model/{NAME}.h5"
save_path = os.path.join(f"../../{NAME}/graph")
os.makedirs(save_path, exist_ok=True)

save_path_model = os.path.join(save_path,f"{NAME}.json" ) 

SCALE = 2
model = load_model(path)
model_schema = convert_model_to_schema(model)

print("\nConverted Model Schema:")
print(model_schema)

model_json = json.dumps(model_schema.dict())

with open(save_path_model, "w") as f:
    f.write(model_json)
    print("\nModel saved to converted_model.json")

