"""
딕셔너리 서비스

딕셔너리 관련 비즈니스 로직을 처리합니다.
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.dictionary import Dictionary
from ..schemas.dictionary import DictionaryCreate, DictionaryUpdate, DictionaryRead


class DictionaryService:
    """딕셔너리 서비스 클래스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_dictionary(self, dictionary_data: DictionaryCreate) -> DictionaryRead:
        """
        Create a new dictionary.

        Args:
            dictionary_data: Schema containing the new dictionary.

        Returns:
            DictionaryRead: Created dictionary information.
        """
        db_dictionary = Dictionary(
            name=dictionary_data.name,
            description=dictionary_data.description,
        )

        self.db.add(db_dictionary)
        await self.db.commit()
        await self.db.refresh(db_dictionary)

        return DictionaryRead.model_validate(db_dictionary)
    
    async def get_dictionary_by_id(self, dictionary_id: int) -> Optional[DictionaryRead]:
        """
        Get a dictionary by its id.

        Args:
            dictionary_id: ID of the dictionary.

        Returns:
            Optional[DictionaryRead]: Dictionary information or None if not found
        """
        result = await self.db.execute(
            select(Dictionary).where(Dictionary.id == dictionary_id)
        )
        dictionary = result.scalar_one_or_none()

        if dictionary is None:
            return None

        return DictionaryRead.model_validate(dictionary)