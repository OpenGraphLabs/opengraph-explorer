"""
딕셔너리 서비스

딕셔너리 관련 비즈니스 로직을 처리합니다.
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.dictionary import Dictionary
from ..schemas.dictionary import DictionaryCreate, DictionaryUpdate, DictionaryRead


class DictionaryService:
    """딕셔너리 서비스 클래스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_dictionary(self, dictionary_data: DictionaryCreate) -> DictionaryRead:
        """
        새로운 딕셔너리를 생성합니다.
        """
        # TODO: 구현 필요
        pass
    
    async def get_dictionary_by_id(self, dictionary_id: int) -> Optional[DictionaryRead]:
        """
        ID로 딕셔너리를 조회합니다.
        """
        # TODO: 구현 필요
        pass 