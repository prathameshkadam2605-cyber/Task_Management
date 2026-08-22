import enum
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class TaskStatus(str, enum.Enum):
    TODO = "Todo"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class TaskSortBy(str, enum.Enum):
    TITLE = "title"
    PRIORITY = "priority"
    STATUS = "status"
    DUE_DATE = "due_date"
    CREATED_AT = "created_at"


class SortOrder(str, enum.Enum):
    ASC = "asc"
    DESC = "desc"


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Title of the task")
    description: Optional[str] = Field(None, max_length=2000, description="Detailed task description")
    priority: TaskPriority = Field(..., description="Priority level of the task")
    status: TaskStatus = Field(default=TaskStatus.TODO, description="Current status of the task")
    due_date: Optional[date] = Field(None, description="Due date of the task (ISO format: YYYY-MM-DD)")

    @field_validator("title", mode="before")
    @classmethod
    def validate_title_not_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v_trimmed = v.strip()
            if not v_trimmed:
                raise ValueError("Title cannot be empty or whitespace only")
            if len(v_trimmed) > 200:
                raise ValueError("Title cannot exceed 200 characters")
            return v_trimmed
        return v

    @field_validator("description", mode="before")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str):
            if len(v) > 2000:
                raise ValueError("Description cannot exceed 2000 characters")
        return v


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Title of the task")
    description: Optional[str] = Field(None, max_length=2000, description="Detailed task description")
    priority: Optional[TaskPriority] = Field(None, description="Priority level of the task")
    status: Optional[TaskStatus] = Field(None, description="Current status of the task")
    due_date: Optional[date] = Field(None, description="Due date of the task (ISO format: YYYY-MM-DD)")

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not isinstance(v, str):
                raise ValueError("Title must be a string")
            v_trimmed = v.strip()
            if not v_trimmed:
                raise ValueError("Title cannot be empty or whitespace only")
            if len(v_trimmed) > 200:
                raise ValueError("Title cannot exceed 200 characters")
            return v_trimmed
        return v

    @field_validator("description", mode="before")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str):
            if len(v) > 2000:
                raise ValueError("Description cannot exceed 2000 characters")
        return v


class TaskRead(BaseModel):
    id: str
    title: str
    description: Optional[str]
    priority: TaskPriority
    status: TaskStatus
    due_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    items: List[TaskRead]
    total: int
    page: int
    page_size: int


class TaskSummaryResponse(BaseModel):
    total: int
    todo: int
    in_progress: int
    completed: int
    high_priority: int


class ErrorResponse(BaseModel):
    detail: str
    status_code: int
