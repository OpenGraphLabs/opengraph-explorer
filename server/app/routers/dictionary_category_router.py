"""
Dictionary Category Router

Dictionary-category association API endpoints.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.dictionary_category import DictionaryCategoryCreate, DictionaryCategoryRead

router = APIRouter(
    prefix="/dictionary-categories",
    tags=["dictionary-categories"]
)


@router.post("/", response_model=DictionaryCategoryRead, status_code=status.HTTP_201_CREATED)
async def create_dictionary_category(
    data: DictionaryCategoryCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new dictionary-category association.
    """
    # TODO: DictionaryCategoryService implementation
    pass


@router.delete("/{dictionary_id}/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dictionary_category(
    dictionary_id: int,
    category_id: int,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a dictionary-category association.
    """
    # TODO: DictionaryCategoryService implementation
    pass 