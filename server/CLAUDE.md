# OpenGraph Explorer Server - FastAPI Development Guide

## 🎯 Project Overview

OpenGraph Explorer backend server provides RESTful APIs for AI/ML dataset and annotation management.

### Core Features
- Image dataset management and classification
- AI-powered automatic annotation (SAM - Segment Anything Model)
- Collaborative annotation system
- Google OAuth and zkLogin (Web3) authentication
- Google Cloud Storage integration
- First-person image capture task management

## 🛠 Tech Stack

- **Framework**: FastAPI (async web framework)
- **Database**: PostgreSQL (asyncpg driver)
- **ORM**: SQLAlchemy 2.0 (async support)
- **Validation**: Pydantic v2
- **Migration**: Alembic
- **Storage**: Google Cloud Storage (GCS)
- **Authentication**: JWT, Google OAuth, zkLogin (SUI blockchain)
- **Image Processing**: OpenCV, Pycocotools (RLE/polygon conversion)

## 📁 Directory Structure

```
server/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment settings (Pydantic Settings)
│   ├── database.py             # DB connection and session management
│   ├── models/                 # SQLAlchemy models (DB tables)
│   │   ├── user.py            # User model
│   │   ├── dataset.py         # Dataset model
│   │   ├── image.py           # Image model
│   │   ├── annotation.py      # Annotation model
│   │   ├── category.py        # Category model
│   │   ├── dictionary.py      # Dictionary model
│   │   └── task.py            # Task model
│   ├── schemas/                # Pydantic schemas (Request/Response)
│   │   └── [model]_schema.py  # Schema for each model
│   ├── routers/                # API endpoint definitions
│   │   └── [domain]_router.py # Domain-specific routers
│   ├── services/               # Business logic layer
│   │   └── [domain]_service.py# Domain-specific services
│   ├── dependencies/           # FastAPI Dependencies
│   │   ├── auth.py           # Authentication dependencies
│   │   └── database.py        # DB session dependencies
│   └── utils/                  # Utility functions
│       ├── gcs_client.py     # GCS client
│       ├── mask_processing.py # Mask processing (RLE/polygon)
│       └── process_manager.py # Process pool management
├── alembic/                    # DB migrations
│   └── versions/              # Migration files
└── requirements.txt           # Python package dependencies
```

## 🏗 Architecture Patterns

### 1. Layered Architecture
```
Router (HTTP) → Service (Business Logic) → Model (Database)
       ↓                    ↓
    Schema              Dependencies
```

### 2. Core Design Principles
- **Async First**: All I/O operations use async/await
- **Dependency Injection**: Leverage FastAPI's Depends() system
- **Type Safety**: Type hints throughout the codebase
- **Schema Validation**: Input/output data validation with Pydantic

### 3. Pattern Examples

```python
# Router Layer (API endpoints)
@router.get("/datasets/{dataset_id}")
async def get_dataset(
    dataset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DatasetService.get_dataset(db, dataset_id)

# Service Layer (Business Logic)
class DatasetService:
    @staticmethod
    async def get_dataset(db: AsyncSession, dataset_id: int):
        # Business logic implementation
        pass

# Model Layer (Database)
class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(Integer, primary_key=True)
    # ...
```

## 💾 Database Structure

### Main Entity Relationships
```
User (1:N) → Dataset (1:N) → Image (1:N) → Annotation
     ↓              ↓                ↓
Dictionary (1:N) → DictionaryCategory ← Category
     ↓              
Task (1:N) → Image
     ↓
UserAnnotationSelection (User-specific annotation selections)
```

### Core Tables

#### users
- Supports Google OAuth and zkLogin authentication
- `sui_address`: Web3 wallet address
- `provider`: Authentication provider (google/zklogin)

#### datasets
- Image collection management
- `dictionary_id`: Links to category dictionary
- `tags`: Tag array (PostgreSQL ARRAY)

#### images
- Dataset-based or task-based images
- `status`: PENDING/APPROVED/REJECTED
- `metadata`: JSON field (flexible metadata)

#### annotations
- Segmentation data (RLE, polygon, bbox)
- `source_type`: AUTO(SAM) / USER
- `pre_polygon`: Pre-computed polygon for performance optimization

## 🚀 API Structure

### API Versioning
All endpoints use `/api/v1` prefix

### Main Endpoint Patterns

#### CRUD Pattern
```
GET    /api/v1/{resource}          # List with pagination
POST   /api/v1/{resource}          # Create
GET    /api/v1/{resource}/{id}     # Get single item
PUT    /api/v1/{resource}/{id}     # Update
DELETE /api/v1/{resource}/{id}     # Delete
```

#### Nested Resources
```
GET /api/v1/datasets/{dataset_id}/images
GET /api/v1/images/{image_id}/annotations
```

#### Special Endpoints
```
POST /api/v1/annotations/batch         # Batch creation
GET  /api/v1/annotations/for-client    # Client-optimized data
POST /api/v1/auth/google               # Google OAuth
POST /api/v1/auth/zklogin             # Web3 authentication
```

### Pagination
```python
# Query Parameters
?page=1&size=20&order_by=created_at&order_direction=desc

# Response
{
    "items": [...],
    "total": 100,
    "page": 1,
    "size": 20,
    "pages": 5
}
```

## 📝 Development Guidelines

### 1. Adding New Features

#### Step 1: Create/Update Model
```python
# app/models/new_feature.py
class NewFeature(Base):
    __tablename__ = "new_features"
    id = Column(Integer, primary_key=True)
    # ...
```

#### Step 2: Generate Migration
```bash
alembic revision --autogenerate -m "Add new_feature table"
alembic upgrade head
```

#### Step 3: Define Schema
```python
# app/schemas/new_feature.py
class NewFeatureBase(BaseModel):
    # Common fields

class NewFeatureCreate(NewFeatureBase):
    # Fields needed for creation

class NewFeatureRead(NewFeatureBase):
    id: int
    # Response fields
```

#### Step 4: Implement Service Logic
```python
# app/services/new_feature_service.py
class NewFeatureService:
    @staticmethod
    async def create(db: AsyncSession, data: NewFeatureCreate):
        # Business logic
```

#### Step 5: Create Router
```python
# app/routers/new_feature_router.py
router = APIRouter(prefix="/new-features", tags=["new-features"])

@router.post("/", response_model=NewFeatureRead)
async def create_new_feature(...):
    # ...
```

#### Step 6: Register Router in main.py
```python
app.include_router(new_feature_router, prefix="/api/v1")
```

### 2. Async Patterns

#### ✅ Correct Patterns
```python
# Use async functions
async def get_data(db: AsyncSession):
    result = await db.execute(select(Model))
    return result.scalars().all()

# Parallel processing of multiple async operations
results = await asyncio.gather(
    get_data1(db),
    get_data2(db),
    get_data3(db)
)
```

#### ❌ Patterns to Avoid
```python
# Don't use sync functions
def get_data(db):  # X
    return db.query(Model).all()

# Avoid sequential processing when parallel is possible
result1 = await get_data1(db)  # Inefficient
result2 = await get_data2(db)
result3 = await get_data3(db)
```

### 3. Error Handling

```python
from fastapi import HTTPException, status

# Service layer
async def get_item(db: AsyncSession, item_id: int):
    item = await db.get(Item, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found"
        )
    return item
```

### 4. Transaction Management

```python
async def complex_operation(db: AsyncSession):
    async with db.begin():  # Auto commit/rollback
        # Multiple DB operations
        db.add(new_item)
        await db.flush()  # Generate ID
        # Additional operations
    # Auto commit
```

## 🔧 Common Operations

### Database Operations

#### Running Migrations
```bash
# Generate new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

#### Query Optimization
```python
# Use Eager Loading
query = select(Dataset).options(
    selectinload(Dataset.images),
    selectinload(Dataset.dictionary)
)
```

### Authentication

#### Get Current User
```python
from app.dependencies.auth import get_current_user

@router.get("/protected")
async def protected_route(
    current_user: User = Depends(get_current_user)
):
    return {"user": current_user.email}
```

#### Optional Authentication
```python
from app.dependencies.auth import get_current_user_optional

@router.get("/public")
async def public_route(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # current_user can be None
```

### Performance Optimization

#### CPU-Intensive Operations (Mask Processing)
```python
from app.utils.process_manager import ProcessManager

# Use process pool
async def process_masks(masks: List[dict]):
    process_manager = ProcessManager(max_workers=4)
    results = await process_manager.run_in_executor(
        process_masks_batch,
        masks
    )
    return results
```

#### Batch Processing
```python
# Use batch for large data processing
async def create_annotations_batch(
    db: AsyncSession, 
    annotations: List[AnnotationCreate]
):
    db_annotations = [
        Annotation(**ann.dict()) 
        for ann in annotations
    ]
    db.add_all(db_annotations)
    await db.commit()
```

## ⚠️ Important Notes

### 1. Async Context
- Use `async/await` for all DB operations
- Don't call async functions from sync functions
- Use process pool for CPU-intensive operations

### 2. Database
- Watch out for N+1 query problems (use eager loading)
- Minimize transaction scope
- Use batch processing for bulk operations

### 3. Security
- Proper authentication/authorization for all endpoints
- Prevent SQL Injection (use SQLAlchemy ORM)
- Validate file uploads

### 4. Performance
- Consider streaming for large image/annotation data
- Use process pool for RLE ↔ Polygon conversion
- Set appropriate indexes

### 5. Code Style
- Comments in English preferred (Korean allowed)
- Type hints required
- Data validation with Pydantic models

## 🧪 Testing

### Local Setup
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables (.env file)
cp .env.example .env

# Run DB migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# API documentation
http://localhost:8000/docs
```

## 📚 References

### Environment Variables (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/dbname
JWT_SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GCS_BUCKET_NAME=your-bucket-name
```

### Major Dependency Versions
- FastAPI: 0.100+
- SQLAlchemy: 2.0+
- Pydantic: 2.0+
- Python: 3.9+

## 🔄 Current Status

### Completed Features
- ✅ Basic CRUD APIs
- ✅ Google OAuth authentication
- ✅ zkLogin (Web3) authentication
- ✅ Image upload (GCS)
- ✅ SAM automatic annotation
- ✅ Collaborative annotation system

### In Progress / Planned
- 🔄 Real-time annotation synchronization
- 📋 Annotation quality validation
- 📋 Annotation statistics dashboard
- 📋 Model training pipeline integration

## 💡 Pro Tips

1. **Auto-reload during development**: `uvicorn app.main:app --reload`
2. **DB query logging**: Set `echo=True` in `config.py`
3. **API documentation**: Access `/docs` (Swagger UI) in development
4. **Performance profiling**: Check `ProcessManager` logs
5. **Error debugging**: Use exception handler in `main.py`

---

This guide contains essential information for OpenGraph Explorer server development.
Please refer to this document when developing new features or fixing bugs to maintain consistent code style and architecture.