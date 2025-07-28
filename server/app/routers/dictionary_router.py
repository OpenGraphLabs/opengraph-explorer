"""
딕셔너리 라우터

딕셔너리 관련 API 엔드포인트들을 정의합니다.
"""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.dictionary import DictionaryCreate, DictionaryUpdate, DictionaryRead
from ..services import DictionaryService

router = APIRouter(
    prefix="/dictionaries",
    tags=["dictionaries"]
)


@router.post("/", response_model=DictionaryRead, status_code=status.HTTP_201_CREATED)
async def create_dictionary(
    dictionary_data: DictionaryCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new dictionary
    """
    dictionary_service = DictionaryService(db)
    return await dictionary_service.create_dictionary(dictionary_data)


@router.get("/{dictionary_id}", response_model=DictionaryRead)
async def get_dictionary(
    dictionary_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a dictionary by ID
    """
    dictionary_service = DictionaryService(db)
    dictionary = await dictionary_service.get_dictionary_by_id(dictionary_id)

    if not dictionary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dictionary not found"
        )

    return dictionary