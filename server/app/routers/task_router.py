"""
Task Router

API endpoints for first-person capture tasks
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..dependencies.database import get_db
from ..models.task import Task
from ..schemas.task import TaskRead

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)


@router.get("/", response_model=List[TaskRead])
async def get_tasks(
    space: Optional[str] = Query(None, description="Filter by space (kitchen, living-room, closet, dining-room)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all available tasks with optional filtering by space.
    """
    query = select(Task)
    
    if space:
        query = query.where(Task.space == space)
    
    query = query.order_by(Task.space, Task.id)
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return [TaskRead.model_validate(task) for task in tasks]


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get specific task by ID.
    """
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return TaskRead.model_validate(task)