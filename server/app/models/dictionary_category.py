"""
Dictionary Category Model

SQLAlchemy model for N:N relationship between dictionaries and categories
"""

from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..database import Base


class DictionaryCategory(Base):
    """Dictionary-Category association table for N:N relationship"""
    
    __tablename__ = "dictionary_categories"
    
    # Primary key fields (composite)
    dictionary_id: Mapped[int] = mapped_column(
        BigInteger, 
        ForeignKey("dictionaries.id", ondelete="CASCADE"),
        primary_key=True
    )
    category_id: Mapped[int] = mapped_column(
        BigInteger, 
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True
    )
    
    # Relationships
    dictionary: Mapped["Dictionary"] = relationship(
        "Dictionary",
        back_populates="dictionary_categories",
        foreign_keys=[dictionary_id]
    )
    
    category: Mapped["Category"] = relationship(
        "Category",
        back_populates="dictionary_categories",
        foreign_keys=[category_id]
    )
    
    def __repr__(self) -> str:
        return f"<DictionaryCategory(dictionary_id={self.dictionary_id}, category_id={self.category_id})>"
    
    def __str__(self) -> str:
        return f"DictionaryCategory({self.dictionary_id}-{self.category_id})" 