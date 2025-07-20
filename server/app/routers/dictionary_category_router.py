"""
Dictionary Category Router

Dictionary-category association API endpoints.
"""

from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.category import CategoryListResponse
from ..schemas.common import Pagination
from ..schemas.dictionary_category import DictionaryCategoryCreate, DictionaryCategoryRead
from ..services import DictionaryCategoryService

router = APIRouter(
    prefix="/dictionary-categories",
    tags=["dictionary-categories"]
)


@router.post("/", response_model=DictionaryCategoryRead, status_code=status.HTTP_201_CREATED)
async def create_dictionary_category(
    data: DictionaryCategoryCreate,
    # current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new dictionary-category association.
    """
    dictionary_category_service = DictionaryCategoryService(db)
    return await dictionary_category_service.create_dictionary_category(data)


@router.get("/{dictionary_id}", response_model=CategoryListResponse)
async def get_dictionary_categories(
    dictionary_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    List all categories related to a dictionary.
    """
    dictionary_category_service = DictionaryCategoryService(db)
    return await dictionary_category_service.get_categories_by_dictionary_id(
        dictionary_id,
        pagination=Pagination(page=page, limit=limit),
    )


@router.delete("/{dictionary_id}/{category_id}")
async def delete_dictionary_category(
    dictionary_id: int,
    category_id: int,
    # current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a dictionary-category association.
    """
    dictionary_category_service = DictionaryCategoryService(db)
    deleted = await dictionary_category_service.delete_dictionary_category(dictionary_id, category_id)
    if not deleted:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dictionary category association not found"
        )

    return None