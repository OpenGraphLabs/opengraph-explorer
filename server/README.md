# OpenGraph Annotation Server

OpenGraph 서비스를 위한 간결한 Rust HTTP 서버입니다. annotator들이 mission을 수행하고 점수를 기록하는 기능을 제공합니다.

## 특징

- **간결함**: annotator, mission, mission_score 3개 모델만 사용
- **Sui 블록체인 연동**: annotator는 sui_address로 식별
- **PostgreSQL**: 안정적인 데이터베이스 저장
- **Auto-increment ID**: 간단한 정수 ID 사용

## 아키텍처

### 모델
- **Annotator**: Sui address로 식별되는 어노테이터
- **Mission**: 라벨링/박스 어노테이션 미션 
- **MissionScore**: 어노테이터별 미션 점수

### API 엔드포인트

#### Annotator
- `POST /annotators` - 어노테이터 생성
- `GET /annotators` - 어노테이터 목록
- `GET /annotators/:id` - 어노테이터 조회
- `GET /annotators/sui/:sui_address` - Sui 주소로 어노테이터 조회

#### Mission  
- `POST /missions` - 미션 생성
- `GET /missions` - 미션 목록 (상태별 필터링 가능)
- `GET /missions/:id` - 미션 조회
- `PUT /missions/:id/status` - 미션 상태 업데이트

#### Mission Score
- `POST /scores` - 점수 생성/업데이트
- `GET /scores/:id` - 점수 조회  
- `GET /scores/top` - 최고 점수 순위
- `GET /missions/:mission_id/scores` - 미션별 점수
- `GET /annotators/:annotator_id/scores` - 어노테이터별 점수
- `GET /annotators/:annotator_id/average` - 어노테이터 평균 점수

## 실행 방법

### 1. 환경 설정
```bash
cp .env.example .env
# DATABASE_URL 등 환경변수 설정
```

### 2. 데이터베이스 실행
```bash
docker-compose up -d
```

### 3. 서버 실행
```bash
cargo run
```

서버는 `http://localhost:8080`에서 실행됩니다.

## API 사용 예시

### 어노테이터 생성
```bash
curl -X POST http://localhost:8080/annotators \
  -H "Content-Type: application/json" \
  -d '{"sui_address": "0x1234567890abcdef"}'
```

### 미션 생성
```bash
curl -X POST http://localhost:8080/missions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sea Animal Dataset",
    "description": "Label annotation for sea animals",
    "mission_type": "label_annotation", 
    "total_items": 10
  }'
```

### 점수 기록
```bash
curl -X POST http://localhost:8080/scores \
  -H "Content-Type: application/json" \
  -d '{
    "mission_id": 1,
    "annotator_id": 1,
    "score": 85.5
  }'
```

## 개발 철학

이 프로젝트는 **극초기 서비스**로서 다음 원칙을 따릅니다:

- ✅ **최소 기능**: 꼭 필요한 기능만 구현
- ✅ **간결함**: 복잡한 구조 지양  
- ✅ **Rust Best Practice**: 안전하고 효율적인 코드
- ✅ **확장 가능**: 향후 기능 추가에 유연함 