from pydantic import BaseModel, Field
from typing import List, Union, Literal

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


class QuantizedTensor(BaseModel):
    """고정소수점으로 양자화된 텐서 값을 표현하는 클래스"""
    signs: List[int] = Field(..., description="텐서 값의 부호 (0: 양수, 1: 음수)")
    magnitudes: List[int] = Field(..., description="텐서 값의 절대값 (10^scale 스케일링됨)")

ActivationType = Literal["relu", "sigmoid", "tanh", "softmax", "leaky_relu", "elu", "selu", "gelu", "swish", None]
NormalizationType = Literal["batch_norm", "layer_norm", "instance_norm", "group_norm", None]

class BaseLayer(BaseModel):
    """모든 레이어 타입의 기본 클래스"""
    activation: ActivationType = Field(
        None, 
        description="활성화 함수 (relu, sigmoid, tanh, softmax, leaky_relu, elu, selu, gelu, swish, None)"
    )
    normalization: NormalizationType = Field(
        None, 
        description="정규화 방식 (batch_norm, layer_norm, instance_norm, group_norm, None)"
    )
    weights: QuantizedTensor
    biases: QuantizedTensor


class DenseLayer(BaseLayer):
    """Dense 레이어 클래스"""
    type: Literal["Dense"] = "Dense"
    in_features: int
    out_features: int


class Conv2DLayer(BaseLayer):
    """Convolution 2D 레이어 클래스"""
    type: Literal["Conv2D"] = "Conv2D"
    in_channels: int
    out_channels: int
    kernel_size: List[int]
    strides: List[int]
    padding: Literal["valid", "same"]


Layer = Union[DenseLayer, Conv2DLayer]


class ModelV2(BaseModel):
    """
    고도화된 모델 스키마 Version 2
    
    여러 타입의 레이어를 지원하며, 각 레이어마다 필요한 파라미터가 다름
    현재는 'Dense'와 'Conv2D' 타입을 지원함
    
    예시:
    {
      "scale": 2,
      "layers": [
        {
          "type": "Conv2D",
          "in_channels": 1,
          "out_channels": 16,
          "kernel_size": [3, 3],
          "strides": [1, 1],
          "padding": "valid",
          "activation": "relu",
          "normalization": null,
          "weights": {
            "signs": [0, 1, 1, 0, 0, 1, 0, 1, 1],
            "magnitudes": [45, 62, 71, 33, 29, 58, 44, 37, 66]
          },
          "biases": {
            "signs": [0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
            "magnitudes": [5, 12, 9, 8, 3, 2, 11, 6, 13, 7, 4, 10, 9, 5, 6, 12]
          }
        },
        {
          "type": "Dense",
          "in_features": 2,
          "out_features": 5,
          "activation": "relu",
          "normalization": null,
          "weights": {
            "signs": [1, 0, 1, 0, 0, 1, 1, 0, 1, 0],
            "magnitudes": [103, 56, 90, 24, 12, 39, 81, 70, 67, 50]
          },
          "biases": {
            "signs": [1, 0, 0, 1, 0, 1, 1, 0],
            "magnitudes": [22, 11, 9, 15, 10, 14, 19, 17]
          }
        }
      ]
    }
    """
    scale: int = Field(..., description="고정소수점 변환을 위한 scale factor")
    layers: List[Layer] = Field(..., description="모델을 구성하는 레이어 목록")


