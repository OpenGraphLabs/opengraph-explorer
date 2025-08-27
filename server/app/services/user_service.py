from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.user import User
from ..models.image import Image, ImageStatus
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
        
        # Calculate basic statistics
        dataset_count = len(user.datasets)
        annotation_count = len(user.annotations)
        
        # Calculate image submission statistics
        from sqlalchemy import case
        images_query = select(
            func.count(Image.id).label('total_submitted'),
            func.sum(
                case(
                    (Image.status == ImageStatus.APPROVED, 1),
                    else_=0
                )
            ).label('approved'),
            func.sum(
                case(
                    (Image.status == ImageStatus.REJECTED, 1),
                    else_=0
                )
            ).label('rejected'),
            func.sum(
                case(
                    (Image.status == ImageStatus.PENDING, 1),
                    else_=0
                )
            ).label('pending')
        ).where(Image.submitted_by == user_id)
        
        stats_result = await self.db.execute(images_query)
        stats = stats_result.first()
        
        images_submitted = stats.total_submitted or 0
        images_approved = stats.approved or 0
        images_rejected = stats.rejected or 0
        images_pending = stats.pending or 0
        
        # Calculate approval rate
        approval_rate = (images_approved / images_submitted * 100) if images_submitted > 0 else 0.0
        
        return UserProfile(
            id=user.id,
            email=user.email,
            google_id=user.google_id,
            display_name=user.display_name,
            profile_image_url=user.profile_image_url,
            sui_address=user.sui_address,
            created_at=user.created_at,
            total_points=user.total_points,
            dataset_count=dataset_count,
            annotation_count=annotation_count,
            images_submitted=images_submitted,
            images_approved=images_approved,
            images_rejected=images_rejected,
            images_pending=images_pending,
            approval_rate=round(approval_rate, 2)
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
    
    async def get_or_create_google_user(
        self,
        google_id: str,
        email: str,
        name: Optional[str] = None,
        picture: Optional[str] = None
    ) -> User:
        """
        Google OAuth를 통해 사용자를 생성하거나 조회합니다.
        
        Args:
            google_id: Google OAuth ID (sub claim)
            email: 사용자 이메일
            name: 사용자 이름
            picture: 프로필 이미지 URL
            
        Returns:
            User: 생성되거나 조회된 사용자 정보
        """
        # 먼저 google_sub로 사용자 조회
        result = await self.db.execute(
            select(User).where(User.google_sub == google_id)
        )
        user = result.scalar_one_or_none()
        
        if user:
            # 기존 사용자 정보 업데이트
            user.email = email
            user.display_name = name
            user.profile_image_url = picture
            await self.db.commit()
            await self.db.refresh(user)
            return user
        
        # 이메일로도 조회 시도 (기존 사용자가 Google 계정 연동하는 경우)
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            # 기존 사용자에 Google 정보 연동
            user.google_sub = google_id
            user.google_id = google_id  # 기존 필드와 호환성
            user.display_name = name or user.display_name
            user.profile_image_url = picture or user.profile_image_url
            await self.db.commit()
            await self.db.refresh(user)
            return user
        
        # 새 사용자 생성
        new_user = User(
            email=email,
            google_id=google_id,  # 기존 필드
            google_sub=google_id,  # 새 필드
            display_name=name,
            profile_image_url=picture
        )
        
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        
        return new_user 