from typing import Optional, Tuple, List
from sqlalchemy import asc, desc, func, select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task_schema import (
    TaskCreate,
    TaskUpdate,
    TaskSortBy,
    SortOrder,
    TaskSummaryResponse,
)


class TaskService:
    @staticmethod
    def get_tasks(
        db: Session,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        search: Optional[str] = None,
        sort_by: TaskSortBy = TaskSortBy.CREATED_AT,
        sort_order: SortOrder = SortOrder.DESC,
        page: int = 1,
        page_size: int = 10,
    ) -> Tuple[List[Task], int]:
        """Fetch tasks with filtering, search, sorting, and pagination."""
        query = select(Task)

        # Filters
        if status is not None:
            query = query.where(Task.status == status)
        if priority is not None:
            query = query.where(Task.priority == priority)
        if search:
            search_trimmed = search.strip()
            if search_trimmed:
                query = query.where(Task.title.ilike(f"%{search_trimmed}%"))

        # Total count query
        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        # Sorting
        sort_column = getattr(Task, sort_by.value)
        if sort_order == SortOrder.DESC:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        tasks = list(db.scalars(query).all())
        return tasks, total

    @staticmethod
    def get_task_by_id(db: Session, task_id: str) -> Optional[Task]:
        """Fetch a single task by ID."""
        return db.get(Task, task_id)

    @staticmethod
    def create_task(db: Session, task_in: TaskCreate) -> Task:
        """Create a new task in the database."""
        task_data = task_in.model_dump()
        db_task = Task(**task_data)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def update_task(db: Session, db_task: Task, task_in: TaskUpdate) -> Task:
        """Update an existing task with provided fields."""
        update_data = task_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def delete_task(db: Session, db_task: Task) -> None:
        """Delete a task from the database."""
        db.delete(db_task)
        db.commit()

    @staticmethod
    def get_task_summary(db: Session) -> TaskSummaryResponse:
        """Calculate aggregate statistics for dashboard cards."""
        total = db.scalar(select(func.count(Task.id))) or 0
        todo = db.scalar(select(func.count(Task.id)).where(Task.status == TaskStatus.TODO)) or 0
        in_progress = db.scalar(select(func.count(Task.id)).where(Task.status == TaskStatus.IN_PROGRESS)) or 0
        completed = db.scalar(select(func.count(Task.id)).where(Task.status == TaskStatus.COMPLETED)) or 0
        high_priority = db.scalar(select(func.count(Task.id)).where(Task.priority == TaskPriority.HIGH)) or 0

        return TaskSummaryResponse(
            total=total,
            todo=todo,
            in_progress=in_progress,
            completed=completed,
            high_priority=high_priority,
        )
