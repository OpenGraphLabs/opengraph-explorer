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