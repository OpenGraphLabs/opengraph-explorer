"""
딕셔너리 라우터

딕셔너리 관련 API 엔드포인트들을 정의합니다.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies.database import get_db
from ..dependencies.auth import get_current_active_user
from ..schemas.dictionary import DictionaryCreate, DictionaryUpdate, DictionaryRead

router = APIRouter(
    prefix="/dictionaries",
    tags=["dictionaries"]
)


@router.post("/", response_model=DictionaryRead, status_code=status.HTTP_201_CREATED)
async def create_dictionary(
    dictionary_data: DictionaryCreate,
    current_user = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    새로운 딕셔너리를 생성합니다.
    """
    # TODO: DictionaryService 구현
    pass


@router.get("/{dictionary_id}", response_model=DictionaryRead)
async def get_dictionary(
    dictionary_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    특정 딕셔너리를 가져옵니다.
    """
    # TODO: DictionaryService 구현
    pass 