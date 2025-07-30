"""
Category Router

Category-related API endpoints.
"""

from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..schemas.common import Pagination
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryRead, CategoryListResponse
from ..services import CategoryService

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new category.
    """
    category_service = CategoryService(db)
    return await category_service.create_category(category_data)

@router.get("/", response_model=CategoryListResponse)
async def get_categories(
        page: int = Query(1, ge=1),
        limit: int = Query(10, ge=1, le=100),
        db: AsyncSession = Depends(get_db)
):
    """
    List all categories.
    """
    category_service = CategoryService(db)
    return await category_service.get_categories(
        pagination=Pagination(page=page, limit=limit),
    )

@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific category.
    """
    category_service = CategoryService(db)
    category = await category_service.get_category_by_id(category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category

@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a specific category.
    """
    category_service = CategoryService(db)
    category = await category_service.update_category(category_id, category_data)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific category.
    """
    category_service = CategoryService(db)
    deleted = await category_service.delete_category(category_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return None
