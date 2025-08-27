"""
UserReward Model

사용자 리워드 기록을 관리하는 SQLAlchemy 모델
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import BigInteger, String, DateTime, func, Integer, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum

from ..database import Base


class RewardType(str, enum.Enum):
    """보상 타입"""
    IMAGE_APPROVED = "IMAGE_APPROVED"
    TASK_COMPLETED = "TASK_COMPLETED"
    BONUS = "BONUS"
    PENALTY = "PENALTY"


class UserReward(Base):
    """사용자 리워드 기록 모델"""
    
    __tablename__ = "user_rewards"
    
    # 기본 필드
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # 리워드 관련 필드
    reward_type: Mapped[RewardType] = mapped_column(
        Enum(RewardType),
        nullable=False
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 관련 엔티티 참조 (옵션)
    image_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("images.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    task_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    
    # 관계 정의
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id]
    )
    
    image: Mapped[Optional["Image"]] = relationship(
        "Image",
        foreign_keys=[image_id]
    )
    
    task: Mapped[Optional["Task"]] = relationship(
        "Task",
        foreign_keys=[task_id]
    )
    
    def __repr__(self) -> str:
        return f"<UserReward(id={self.id}, user_id={self.user_id}, points={self.points}, type={self.reward_type})>"
    
    def __str__(self) -> str:
        return f"UserReward({self.user_id}: +{self.points} points for {self.reward_type})"