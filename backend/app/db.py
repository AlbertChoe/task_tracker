from sqlmodel import SQLModel, Field, create_engine, Session, Relationship
from typing import Optional, List
from datetime import datetime, date
from zoneinfo import ZoneInfo
import uuid
from .core.config import settings
from sqlalchemy.engine.url import make_url

if not settings.DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is empty. Ensure your .env exists and app.core.config loads it.")

try:
    make_url(settings.DATABASE_URL)
except Exception as e:
    raise RuntimeError(
        f"Invalid DATABASE_URL: {repr(settings.DATABASE_URL)}") from e

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)


def jakarta_now() -> datetime:
    return datetime.now(ZoneInfo("Asia/Jakarta"))


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    name: str
    role: str = "PM"
    created_at: datetime = Field(default_factory=jakarta_now)


class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    created_by: uuid.UUID = Field(foreign_key="users.id")
    status: str
    created_at: datetime = Field(default_factory=jakarta_now)
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    logs: List["TaskLog"] = Relationship(back_populates="task")


class TaskLog(SQLModel, table=True):
    __tablename__ = "task_logs"
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    task_id: uuid.UUID = Field(foreign_key="tasks.id")
    event: str
    detail: Optional[str] = None
    created_at: datetime = Field(default_factory=jakarta_now)
    task: Task | None = Relationship(back_populates="logs")
