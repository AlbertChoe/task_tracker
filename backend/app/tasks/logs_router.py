from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..deps import get_current_user_id
from ..db import Task, TaskLog, get_session
from .schemas import TaskLogCreate, TaskLogOut

router = APIRouter(prefix="/tasks", tags=["task-logs"]) 

@router.get("/{task_id}/logs", response_model=list[TaskLogOut])
def list_logs(task_id: str, _: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    logs = session.exec(select(TaskLog).where(TaskLog.task_id == task.id).order_by(TaskLog.created_at.asc())).all()
    return [TaskLogOut(id=str(l.id), task_id=str(l.task_id), event=l.event, detail=l.detail, created_at=l.created_at) for l in logs]

@router.post("/{task_id}/logs", response_model=TaskLogOut)
def add_log(task_id: str, payload: TaskLogCreate, _: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    log = TaskLog(task_id=task.id, **payload.model_dump())
    session.add(log)
    session.commit()
    session.refresh(log)
    return TaskLogOut(id=str(log.id), task_id=str(log.task_id), event=log.event, detail=log.detail, created_at=log.created_at)
