from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.task import TaskPriority, TaskStatus
from app.schemas.task_schema import (
    TaskCreate,
    TaskUpdate,
    TaskRead,
    TaskListResponse,
    TaskSummaryResponse,
    TaskSortBy,
    SortOrder,
    ErrorResponse,
)
from app.services.task_service import TaskService

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
    responses={
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)


@router.get(
    "",
    response_model=TaskListResponse,
    status_code=status.HTTP_200_OK,
    summary="List tasks",
    description="Retrieve a paginated list of tasks with optional filtering by status and priority, case-insensitive title search, and sorting.",
)
def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by task status ('Todo', 'In Progress', 'Completed')"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by task priority ('Low', 'Medium', 'High')"),
    search: Optional[str] = Query(None, description="Case-insensitive search query matching task title"),
    sort_by: TaskSortBy = Query(
        TaskSortBy.CREATED_AT,
        description="Sort by field: 'title', 'priority', 'status', 'due_date', 'created_at'",
    ),
    sort_order: SortOrder = Query(
        SortOrder.DESC,
        description="Sort order: 'asc' or 'desc'",
    ),
    page: int = Query(1, ge=1, description="Page number (must be >= 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page (between 1 and 100)"),
    db: Session = Depends(get_db),
) -> TaskListResponse:
    tasks, total = TaskService.get_tasks(
        db=db,
        status=status,
        priority=priority,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    return TaskListResponse(
        items=tasks,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/summary",
    response_model=TaskSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get task statistics summary",
    description="Retrieve aggregated task counts for dashboard stat cards (total, todo, in_progress, completed, high_priority).",
)
def get_task_summary(db: Session = Depends(get_db)) -> TaskSummaryResponse:
    return TaskService.get_task_summary(db=db)


@router.get(
    "/{task_id}",
    response_model=TaskRead,
    status_code=status.HTTP_200_OK,
    summary="Get task by ID",
    description="Retrieve the details of a single task by its unique identifier.",
)
def get_task(task_id: str, db: Session = Depends(get_db)) -> TaskRead:
    task = TaskService.get_task_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found",
        )
    return task


@router.post(
    "",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Create a new task with a title, priority, status, optional description, and optional due date.",
)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)) -> TaskRead:
    return TaskService.create_task(db=db, task_in=task_in)


@router.put(
    "/{task_id}",
    response_model=TaskRead,
    status_code=status.HTTP_200_OK,
    summary="Update an existing task",
    description="Update fields of an existing task (supports full or partial updates).",
)
def update_task(
    task_id: str,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
) -> TaskRead:
    db_task = TaskService.get_task_by_id(db=db, task_id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found",
        )
    return TaskService.update_task(db=db, db_task=db_task, task_in=task_in)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
    description="Delete a task permanently by its unique identifier.",
)
def delete_task(task_id: str, db: Session = Depends(get_db)) -> None:
    db_task = TaskService.get_task_by_id(db=db, task_id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found",
        )
    TaskService.delete_task(db=db, db_task=db_task)
    return None
