from tensorflow.keras.models import load_model
from utils.read_h5 import convert_model_to_schema
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
        # Keras의 load_model을 사용하여 모델 로드
        model = load_model(file_path)
        
        # read_h5 유틸리티를 사용하여 모델을 스키마로 변환
        model_schema = convert_model_to_schema(model, scale=7)
        
        # 모델 스키마를 딕셔너리로 변환하여 반환
        return model_schema.dict()
        
    except Exception as e:
        print(f"모델 파싱 오류: {e}")
        raise Exception(f"모델 파일을 파싱할 수 없습니다: {str(e)}") 