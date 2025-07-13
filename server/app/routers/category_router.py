"""
Category Router

Category-related API endpoints.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryRead

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new category.
    """
    # TODO: CategoryService implementation
    pass


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific category.
    """
    # TODO: CategoryService implementation
    pass 