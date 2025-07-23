from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate, UserRead, UserProfile
from pydantic import EmailStr
from ..utils.common import hash_password, verify_password


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_user(self, user_data: UserCreate) -> UserRead:
        """
        Create a new user in the database.
        
        Args:
            user_data: Schema containing user creation data
            
        Returns:
            UserRead: Created user information
        """

        existing_user = await self.get_user_by_email(str(user_data.email))
        if existing_user:
            raise ValueError("Email already exists")

        db_user = User(
            email=str(user_data.email),
            google_id=user_data.google_id,
            display_name=user_data.display_name,
            profile_image_url=user_data.profile_image_url,
            sui_address=user_data.sui_address
        )
        
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        
        return UserRead.model_validate(db_user)
    
    async def get_user_by_id(self, user_id: int) -> Optional[UserRead]:
        """
        Get a user by their ID.
        
        Args:
            user_id: User ID
            
        Returns:
            Optional[UserRead]: Corresponding user information or None if not found
        """
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if user:
            return UserRead.model_validate(user)
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[UserRead]:
        """
        Get a user by their email.
        
        Args:
            email: User email
            
        Returns:
            Optional[UserRead]: Corresponding user information or None if not found
        """
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            return UserRead.model_validate(user)
        return None
    
    async def get_user_by_google_id(self, google_id: str) -> Optional[UserRead]:
        """
        Get a user by their Google ID.
        
        Args:
            google_id: Google OAuth ID
            
        Returns:
            Optional[UserRead]: Corresponding user information or None if not found
        """
        result = await self.db.execute(
            select(User).where(User.google_id == google_id)
        )
        user = result.scalar_one_or_none()
        
        if user:
            return UserRead.model_validate(user)
        return None
    
    async def get_user_by_sui_address(self, sui_address: str) -> Optional[UserRead]:
        """
        Get a user by their Sui address.
        
        Args:
            sui_address: Sui Wallet address
            
        Returns:
            Optional[UserRead]: Corresponding user information or None if not found
        """
        result = await self.db.execute(
            select(User).where(User.sui_address == sui_address)
        )
        user = result.scalar_one_or_none()
        
        if user:
            return UserRead.model_validate(user)
        return None
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[UserRead]:
        """
        Update user information.
        
        Args:
            user_id: User ID
            user_data: Schema containing user update data
            
        Returns:
            Optional[UserRead]: Updated user information or None if user not found
        """
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None

        update_data = user_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        
        return UserRead.model_validate(user)
    
    async def delete_user(self, user_id: int) -> bool:
        """
        Delete a user by their ID.
        
        Args:
            user_id: User ID
            
        Returns:
            bool: Success status of deletion
        """
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return False
        
        await self.db.delete(user)
        await self.db.commit()
        return True
    
    async def get_user_profile(self, user_id: int) -> Optional[UserProfile]:
        """
        Get user profile information including statistics.
        
        Args:
            user_id: User ID
            
        Returns:
            Optional[UserProfile]: User profile information or None if user not found
        """
        result = await self.db.execute(
            select(User)
            .options(
                selectinload(User.datasets),
                selectinload(User.annotations)
            )
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # Calculate statistics
        dataset_count = len(user.datasets)
        annotation_count = len(user.annotations)
        
        return UserProfile(
            id=user.id,
            email=user.email,
            google_id=user.google_id,
            display_name=user.display_name,
            profile_image_url=user.profile_image_url,
            sui_address=user.sui_address,
            created_at=user.created_at,
            dataset_count=dataset_count,
            annotation_count=annotation_count
        )
    
    async def get_users_list(
        self,
        skip: int = 0,
        limit: int = 100,
        email_filter: Optional[str] = None
    ) -> List[UserRead]:
        """
        List users with optional pagination and email filter.
        
        Args:
            skip: Count to skip for pagination
            limit: Maximum number of users to return
            email_filter: Optional email filter
            
        Returns:
            List[UserRead]: List of user information
        """
        query = select(User)
        
        if email_filter:
            query = query.where(User.email.contains(email_filter))
        
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        users = result.scalars().all()
        
        return [UserRead.model_validate(user) for user in users]
    
    async def get_users_count(self, email_filter: Optional[str] = None) -> int:
        """
        Get the total number of users, optionally filtered by email.
        
        Args:
            email_filter: Optional email filter
            
        Returns:
            int: Total number of users matching the filter
        """
        query = select(func.count(User.id))
        
        if email_filter:
            query = query.where(User.email.contains(email_filter))
        
        result = await self.db.execute(query)
        return result.scalar() or 0 