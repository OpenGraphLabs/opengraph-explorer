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
import json
import os
from pathlib import Path

from .config import settings
from .database import test_db_connection
from .routers import (
    user_router,
    dataset_router,
    image_router,
    dictionary_router,
    category_router,
    dictionary_category_router,
    annotation_router
)


def save_openapi_schema(app: FastAPI):
    """
    Save OpenAPI schema to client folder for code generation
    """
    try:
        # Get OpenAPI schema
        openapi_schema = app.openapi()
        
        # Define client openapi configs directory
        client_configs_dir = Path(__file__).parent.parent.parent / "client" / "configs" / "openapi"
        client_configs_dir.mkdir(parents=True, exist_ok=True)
        
        # Save schema to client folder
        schema_path = client_configs_dir / "swagger.json"
        with open(schema_path, 'w', encoding='utf-8') as f:
            json.dump(openapi_schema, f, indent=2, ensure_ascii=False)
        
        print(f"✅ OpenAPI schema saved to: {schema_path}")
        
    except Exception as e:
        print(f"⚠️  Failed to save OpenAPI schema: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle management
    """
    # Startup
    print("🚀 Starting OpenGraph API Server...")
    
    # Test database connection
    if await test_db_connection():
        print("✅ Database connection successful")
    else:
        print("❌ Database connection failed")
    
    # Save OpenAPI schema for client code generation
    save_openapi_schema(app)
    
    yield
    
    # Shutdown
    print("🔄 Shutting down OpenGraph API Server...")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI/ML model and dataset Web3 blockchain infrastructure server",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

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
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
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
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "debug": settings.debug
    }


app.include_router(user_router, prefix="/api/v1")
app.include_router(dataset_router, prefix="/api/v1")
app.include_router(image_router, prefix="/api/v1")
app.include_router(dictionary_router, prefix="/api/v1")
app.include_router(category_router, prefix="/api/v1")
app.include_router(dictionary_category_router, prefix="/api/v1")
app.include_router(annotation_router, prefix="/api/v1")


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