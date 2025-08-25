"""
FastAPI Main Application

OpenGraph server main application entry point
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import time
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

from .config import settings
from .database import test_db_connection
from .routers import (
    user_router,
    dataset_router,
    image_router,
    dictionary_router,
    category_router,
    dictionary_category_router,
    annotation_router,
    auth_router,
    task_router,
    admin_router
)


# Custom Prometheus metrics
REQUEST_COUNT = Counter(
    "opengraph_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_DURATION = Histogram(
    "opengraph_http_request_duration_seconds", 
    "HTTP request duration in seconds",
    ["method", "endpoint"]
)

DATABASE_CONNECTION_STATUS = Gauge(
    "opengraph_database_connection_status",
    "Database connection status (1=connected, 0=disconnected)"
)

ACTIVE_CONNECTIONS = Gauge(
    "opengraph_active_connections",
    "Number of active database connections"
)



@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle management
    """
    # Startup
    print("🚀 Starting OpenGraph API Server...")
    
    # Test database connection and update metrics
    if await test_db_connection():
        print("✅ Database connection successful")
        DATABASE_CONNECTION_STATUS.set(1)
    else:
        print("❌ Database connection failed")
        DATABASE_CONNECTION_STATUS.set(0)
    
    yield
    
    # Shutdown
    print("🔄 Shutting down OpenGraph API Server...")
    DATABASE_CONNECTION_STATUS.set(0)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI/ML model and dataset Web3 blockchain infrastructure server",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Initialize Prometheus instrumentator
instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)
print("📊 Prometheus metrics initialized")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Specify concrete hosts in production
    )


@app.middleware("http")
async def extract_user_id_header(request: Request, call_next):
    """
    Extract X-Opengraph-User-Id header and store in request.state
    """
    user_id = request.headers.get("X-Opengraph-User-Id")
    request.state.user_id = user_id
    
    response = await call_next(request)
    return response


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    
    # Extract method and path for metrics
    method = request.method
    path = request.url.path
    
    # Call the endpoint
    response = await call_next(request)
    
    # Calculate process time
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Update Prometheus metrics
    status_code = str(response.status_code)
    REQUEST_COUNT.labels(method=method, endpoint=path, status_code=status_code).inc()
    REQUEST_DURATION.labels(method=method, endpoint=path).observe(process_time)
    
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler
    """
    if settings.debug:
        import traceback
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "detail": str(exc),
                "traceback": traceback.format_exc()
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"error": "Internal Server Error"}
        )


@app.get("/health")
async def health_check():
    # Test database connection for health check
    db_healthy = await test_db_connection()
    DATABASE_CONNECTION_STATUS.set(1 if db_healthy else 0)
    
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "debug": settings.debug,
        "database": "connected" if db_healthy else "disconnected",
        "metrics": {
            "endpoint": "/metrics",
            "enabled": True
        }
    }


@app.get("/metrics")
async def get_metrics():
    """
    Prometheus metrics endpoint
    Note: This endpoint is also automatically exposed by Instrumentator
    """
    from fastapi.responses import Response
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


app.include_router(auth_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(dataset_router, prefix="/api/v1")
app.include_router(image_router, prefix="/api/v1")
app.include_router(dictionary_router, prefix="/api/v1")
app.include_router(category_router, prefix="/api/v1")
app.include_router(dictionary_category_router, prefix="/api/v1")
app.include_router(annotation_router, prefix="/api/v1")
app.include_router(task_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Welcome to OpenGraph API",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "docs_url": "/docs" if settings.debug else None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    ) 