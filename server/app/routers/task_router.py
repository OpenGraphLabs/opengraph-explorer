"""
Task Router

API endpoints for first-person capture tasks
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..dependencies.database import get_db
from ..models.task import Task
from ..schemas.task import TaskRead, TaskCreate, TaskUpdate
from ..schemas.common import PaginationInput, Pagination

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)


@router.get("/", response_model=Pagination[TaskRead])
async def get_tasks(
    page: int = 1,
    size: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all available tasks with pagination.
    """
    # Calculate offset
    offset = (page - 1) * size
    
    # Get total count
    count_result = await db.execute(select(Task))
    total = len(count_result.scalars().all())
    
    # Get paginated tasks
    result = await db.execute(
        select(Task)
        .order_by(Task.created_at.desc())
        .offset(offset)
        .limit(size)
    )
    tasks = result.scalars().all()
    
    # Calculate pagination info
    pages = (total + size - 1) // size
    
    return Pagination[TaskRead](
        items=[TaskRead.model_validate(task) for task in tasks],
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.post("/", response_model=TaskRead)
async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new task.
    """
    db_task = Task(
        name=task_data.name
    )
    
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    
    return TaskRead.model_validate(db_task)


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: int,
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


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a task.
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
    
    # Update task fields
    task.name = task_data.name
    
    await db.commit()
    await db.refresh(task)
    
    return TaskRead.model_validate(task)


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a task.
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
    
    await db.delete(task)
    await db.commit()
    
    return {"message": "Task deleted successfully"}