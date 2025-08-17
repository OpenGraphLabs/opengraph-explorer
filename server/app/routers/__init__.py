"""
API Routers Package

HTTP endpoint definitions and management.
"""

from .auth_router import router as auth_router
from .user_router import router as user_router
from .dataset_router import router as dataset_router
from .image_router import router as image_router
from .dictionary_router import router as dictionary_router
from .category_router import router as category_router
from .dictionary_category_router import router as dictionary_category_router
from .annotation_router import router as annotation_router
from .task_router import router as task_router
from .admin_router import router as admin_router

__all__ = [
    "auth_router",
    "user_router",
    "dataset_router",
    "image_router",
    "dictionary_router", 
    "category_router",
    "dictionary_category_router",
    "annotation_router",
    "task_router",
    "admin_router"
] 