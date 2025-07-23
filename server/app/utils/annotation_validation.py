"""
Annotation validation utilities

Provides validation functions for annotation operations to ensure data integrity
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.image import Image
from ..models.dataset import Dataset
from ..models.dictionary_category import DictionaryCategory


async def validate_category_for_dataset(
    category_id: int, 
    image_id: int, 
    db: AsyncSession
) -> bool:
    """
    Validates that a category belongs to the dictionary associated with the dataset
    of the given image.
    
    Args:
        category_id: Category ID to validate
        image_id: Image ID to get the dataset from
        db: Database session
        
    Returns:
        bool: True if category is valid for the dataset's dictionary, False otherwise
    """
    # Get the dataset_id from the image
    image_result = await db.execute(
        select(Image.dataset_id).where(Image.id == image_id)
    )
    dataset_id = image_result.scalar_one_or_none()
    
    if not dataset_id:
        return False
    
    # Get the dictionary_id from the dataset
    dataset_result = await db.execute(
        select(Dataset.dictionary_id).where(Dataset.id == dataset_id)
    )
    dictionary_id = dataset_result.scalar_one_or_none()
    
    # If dataset has no dictionary, allow all categories (backward compatibility)
    if not dictionary_id:
        return True
    
    # Check if the category exists in the dataset's dictionary
    validation_result = await db.execute(
        select(DictionaryCategory)
        .where(
            DictionaryCategory.dictionary_id == dictionary_id,
            DictionaryCategory.category_id == category_id
        )
    )
    
    return validation_result.scalar_one_or_none() is not None


async def get_valid_categories_for_image(
    image_id: int,
    db: AsyncSession
) -> list[int]:
    """
    Gets all valid category IDs for annotations on the given image.
    
    Args:
        image_id: Image ID
        db: Database session
        
    Returns:
        list[int]: List of valid category IDs, empty list if no dictionary is set
    """
    # Get the dataset_id from the image
    image_result = await db.execute(
        select(Image.dataset_id).where(Image.id == image_id)
    )
    dataset_id = image_result.scalar_one_or_none()
    
    if not dataset_id:
        return []
    
    # Get the dictionary_id from the dataset
    dataset_result = await db.execute(
        select(Dataset.dictionary_id).where(Dataset.id == dataset_id)
    )
    dictionary_id = dataset_result.scalar_one_or_none()
    
    # If dataset has no dictionary, return empty list (no restrictions)
    if not dictionary_id:
        return []
    
    # Get all category IDs for the dictionary
    categories_result = await db.execute(
        select(DictionaryCategory.category_id)
        .where(DictionaryCategory.dictionary_id == dictionary_id)
    )
    
    return [row[0] for row in categories_result.fetchall()]