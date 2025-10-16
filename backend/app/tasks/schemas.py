from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date, datetime

Status = Literal['BELUM_DIMULAI','SEDANG_DIKERJAKAN','SELESAI']

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    status: Status
    start_date: Optional[date] = None
    due_date: Optional[date] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee: Optional[str] = None
    status: Optional[Status] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None

class TaskOut(TaskBase):
    id: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    created_by: str

class TaskLogCreate(BaseModel):
    event: str
    detail: Optional[str] = None

class TaskLogOut(BaseModel):
    id: str
    task_id: str
    event: str
    detail: Optional[str]
    created_at: datetime
