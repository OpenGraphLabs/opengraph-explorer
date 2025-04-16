import tensorflow as tf
import numpy as np
import os
from pathlib import Path
import h5py
from models.model import Model

def parse_model_file(file_path: str) -> dict:
    """
    .h5 파일을 파싱하여 모델 메타데이터와 Sui 블록체인용 모델 데이터를 추출합니다.
    
    Args:
        file_path (str): 업로드된 .h5 파일 경로
        
    Returns:
        dict: 파싱된 HuggingFace3.0 모델 데이터
    """
    try:
        # h5py를 사용하여 직접 파일 읽기
        with h5py.File(file_path, 'r') as f:
            # 레이어 정보 추출을 위한 변수 초기화
            layer_dimensions = []
            weights_magnitudes = []
            weights_signs = []
            biases_magnitudes = []
            biases_signs = []
            scale = 2  # 기본 스케일 설정
            
            # 모델 가중치 그룹 찾기
            if 'model_weights' in f:
                weight_group = f['model_weights']
            else:
                # 최상위 레벨에서 레이어 찾기
                weight_group = f
            
            # Dense 레이어 찾기
            for layer_name in weight_group.keys():
                layer = weight_group[layer_name]
                
                # Dense 레이어의 가중치와 바이어스 찾기
                if 'kernel:0' in layer or 'dense' in layer_name.lower():
                    # 가중치 처리
                    if 'kernel:0' in layer:
                        weights = np.array(layer['kernel:0'])
                    elif 'dense' in layer_name.lower():
                        for key in layer.keys():
                            if 'kernel' in key.lower():
                                weights = np.array(layer[key])
                                break
                    
                    input_dim = weights.shape[0]
                    output_dim = weights.shape[1]
                    layer_dimensions.append([input_dim, output_dim])
                    
                    # 가중치 부호와 크기 분리
                    weight_values = weights.flatten()
                    weight_magnitudes = []
                    weight_signs = []
                    
                    for value in weight_values:
                        abs_value = abs(float(value))
                        weight_magnitudes.append(int(round(abs_value * (1 << scale))))
                        weight_signs.append(1 if value < 0 else 0)
                    
                    weights_magnitudes.append(weight_magnitudes)
                    weights_signs.append(weight_signs)
                    
                    # 바이어스 처리
                    if 'bias:0' in layer:
                        biases = np.array(layer['bias:0'])
                    else:
                        for key in layer.keys():
                            if 'bias' in key.lower():
                                biases = np.array(layer[key])
                                break
                        else:
                            biases = np.zeros(output_dim)
                    
                    # 바이어스 부호와 크기 분리
                    bias_values = biases.flatten()
                    bias_magnitudes = []
                    bias_signs = []
                    
                    for value in bias_values:
                        abs_value = abs(float(value))
                        bias_magnitudes.append(int(round(abs_value * (1 << scale))))
                        bias_signs.append(1 if value < 0 else 0)
                    
                    biases_magnitudes.append(bias_magnitudes)
                    biases_signs.append(bias_signs)
        
        if not layer_dimensions:
            raise Exception("모델에서 Dense 레이어를 찾을 수 없습니다.")
        
        # Sui 블록체인용 모델 데이터
        model_data = {
            "layerDimensions": layer_dimensions,
            "weightsMagnitudes": weights_magnitudes,
            "weightsSigns": weights_signs,
            "biasesMagnitudes": biases_magnitudes,
            "biasesSigns": biases_signs,
            "scale": scale
        }
        
        return model_data
        
    except Exception as e:
        print(f"모델 파싱 오류: {e}")
        raise Exception(f"모델 파일을 파싱할 수 없습니다: {str(e)}") 