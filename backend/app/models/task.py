import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Enum as SQLEnum, Date, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class TaskPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class TaskStatus(str, enum.Enum):
    TODO = "Todo"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


def get_utc_now():
    return datetime.now(timezone.utc)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(
        SQLEnum(TaskPriority, name="task_priority", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False
    )
    status = Column(
        SQLEnum(TaskStatus, name="task_status", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default=TaskStatus.TODO
    )
    due_date = Column(Date, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
        server_default=func.now()
    )
