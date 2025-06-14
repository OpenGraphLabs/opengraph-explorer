# HuggingFace 3.0 API 서버

Sui 블록체인 위에 AI 모델을 배포하기 위한 FastAPI 기반 백엔드 서버입니다.

## 설치 및 실행

```bash
# 가상 환경 생성 (선택 사항)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는
.\venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python main.py
```

## API 엔드포인트

### `POST /api/models/convert`

.h5 형식의 AI 모델 파일을 업로드하고 Sui 블록체인에 배포할 수 있는 형식으로 변환합니다.

**Request:**
- 형식: `multipart/form-data`
- 파라미터:
  - `model`: .h5 확장자의 모델 파일

**Response:**
```json
{
  "layerInDimensions": [4, 3],
  "layerOutDimensions": [3, 2],
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
```

## API 문서

FastAPI의 자동 생성 API 문서는 다음 URL에서 확인할 수 있습니다:

- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc 