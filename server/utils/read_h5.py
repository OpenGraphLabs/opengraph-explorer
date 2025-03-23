from tensorflow.keras.models import load_model
import json
from pydantic import BaseModel
from typing import List


class Model(BaseModel):
    """
    Sui 블록체인 컨트랙트의 initialize_model 함수에 맞춘 Model 스키마

    예시:
    {
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

def convert_model_to_schema(model, scale=2):
    """Convert Keras model to Model schema format"""
    layer_dimensions = []
    weights_magnitudes = []
    weights_signs = []
    biases_magnitudes = []
    biases_signs = []
    
    for layer in model.layers:
        weights = layer.get_weights()
        if len(weights) == 0:
            # Skip layers with no weights
            continue
        
        # Only process layers with weights and biases (like Dense)
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
    
    # Create the Model schema object
    model_schema = Model(
        layerDimensions=layer_dimensions,
        weightsMagnitudes=weights_magnitudes,
        weightsSigns=weights_signs,
        biasesMagnitudes=biases_magnitudes,
        biasesSigns=biases_signs,
        scale=scale
    )
    
    return model_schema

########################################################################################################################

path = "/home/userpc/Github/opengraph/opengraph-explorer/server/utils/fp32_model_norm_7_7.h5"
SCALE = 2
model = load_model(path)
model_schema = convert_model_to_schema(model)

print("\nConverted Model Schema:")
print(model_schema)

model_json = json.dumps(model_schema.dict())

with open("converted_model.json", "w") as f:
    f.write(model_json)
    print("\nModel saved to converted_model.json")

