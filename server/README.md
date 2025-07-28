# OpenGraph FastAPI Server

AI/ML 모델과 데이터셋을 위한 Web3 블록체인 인프라 서버입니다.

## 🚀 시작하기

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일을 생성하여 환경 변수를 설정합니다:

```env
# 데이터베이스 설정
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/opengraph
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=opengraph
DATABASE_USER=username
DATABASE_PASSWORD=password

# 애플리케이션 설정
APP_NAME=OpenGraph API
APP_VERSION=0.1.0
DEBUG=True
SECRET_KEY=your-secret-key-change-this-in-production

# JWT 설정
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS 설정
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8000"]

# Sui 네트워크 설정
SUI_NETWORK=devnet
SUI_RPC_URL=https://fullnode.devnet.sui.io

# Walrus 설정
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
```

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스를 설정하고 마이그레이션을 실행합니다:

```bash
# 첫 번째 마이그레이션 생성
alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 실행
alembic upgrade head
```

### 4. 서버 실행

```bash
# 개발 모드로 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 또는 Python으로 직접 실행
python -m app.main
```

## 📚 API 문서

서버를 실행한 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ 프로젝트 구조

```
server/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 메인 애플리케이션
│   ├── config.py               # 설정 관리
│   ├── database.py             # 데이터베이스 연결 및 세션 관리
│   ├── models/                 # SQLAlchemy 모델들
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── dataset.py
│   │   ├── image.py
│   │   ├── dictionary.py
│   │   ├── class_.py
│   │   ├── base_annotation.py
│   │   └── annotation.py
│   ├── schemas/                # Pydantic 스키마들
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── dataset.py
│   │   ├── image.py
│   │   ├── dictionary.py
│   │   ├── class_.py
│   │   ├── base_annotation.py
│   │   └── annotation.py
│   ├── services/               # 비즈니스 로직
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── dataset_service.py
│   │   ├── image_service.py
│   │   ├── dictionary_service.py
│   │   ├── class_service.py
│   │   ├── base_annotation_service.py
│   │   └── annotation_service.py
│   ├── routers/                # API 라우터들
│   │   ├── __init__.py
│   │   ├── user_router.py
│   │   ├── dataset_router.py
│   │   ├── image_router.py
│   │   ├── dictionary_router.py
│   │   ├── class_router.py
│   │   ├── base_annotation_router.py
│   │   └── annotation_router.py
│   ├── dependencies/           # 의존성 주입
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── auth.py
│   └── utils/                  # 유틸리티 함수들
│       ├── __init__.py
│       └── common.py
├── alembic/                    # 데이터베이스 마이그레이션
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── alembic.ini
├── requirements.txt
└── README.md
```

## 🔧 개발 가이드

### 코드 스타일

이 프로젝트는 Python의 타입 힌트를 적극 활용하여 코드의 가독성과 유지보수성을 높입니다.

```python
# 좋은 예시
async def get_user_by_id(self, user_id: int) -> Optional[UserRead]:
    """
    ID로 사용자를 조회합니다.
    
    Args:
        user_id: 사용자 ID
        
    Returns:
        Optional[UserRead]: 사용자 정보 또는 None
    """
    result = await self.db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if user:
        return UserRead.model_validate(user)
    return None
```

### 새로운 엔드포인트 추가

1. **모델 생성**: `app/models/`에 SQLAlchemy 모델 추가
2. **스키마 생성**: `app/schemas/`에 Pydantic 스키마 추가
3. **서비스 생성**: `app/services/`에 비즈니스 로직 추가
4. **라우터 생성**: `app/routers/`에 API 엔드포인트 추가
5. **메인 앱에 등록**: `app/main.py`에 라우터 등록

### 데이터베이스 마이그레이션

모델을 변경한 후 마이그레이션을 생성하고 적용합니다:

```bash
# 마이그레이션 생성
alembic revision --autogenerate -m "Add new field to User model"

# 마이그레이션 적용
alembic upgrade head

# 마이그레이션 되돌리기
alembic downgrade -1
```

## 🧪 테스트

```bash
# 테스트 실행
pytest

# 커버리지와 함께 테스트 실행
pytest --cov=app
```

## 🚀 배포

### Docker를 사용한 배포

```bash
# 이미지 빌드
docker build -t opengraph-server .

# 컨테이너 실행
docker run -p 8000:8000 opengraph-server
```

### 환경별 설정

- **개발 환경**: `DEBUG=True`
- **프로덕션 환경**: `DEBUG=False`

## 📝 API 엔드포인트

### 사용자 관리
- `POST /api/v1/users/` - 사용자 생성
- `GET /api/v1/users/me` - 현재 사용자 정보 조회
- `PUT /api/v1/users/me` - 현재 사용자 정보 수정
- `DELETE /api/v1/users/me` - 현재 사용자 삭제

### 데이터셋 관리
- `POST /api/v1/datasets/` - 데이터셋 생성
- `GET /api/v1/datasets/` - 데이터셋 목록 조회
- `GET /api/v1/datasets/{id}` - 데이터셋 상세 조회
- `PUT /api/v1/datasets/{id}` - 데이터셋 수정
- `DELETE /api/v1/datasets/{id}` - 데이터셋 삭제

### 이미지 관리
- `POST /api/v1/images/` - 이미지 생성
- `GET /api/v1/images/{id}` - 이미지 조회

### 어노테이션 관리
- `POST /api/v1/annotations/` - 어노테이션 생성
- `GET /api/v1/annotations/{id}` - 어노테이션 조회
