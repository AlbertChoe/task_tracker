from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import Task, TaskLog, get_session
from ..deps import get_current_user_id
from .schemas import TaskLogCreate, TaskLogOut

router = APIRouter(prefix="/tasks", tags=["task-logs"])


def _parse_user_id(raw_user_id: str) -> UUID:
    try:
        return UUID(raw_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


def _ensure_owner(task: Task | None, owner_id: UUID) -> Task:
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.created_by != owner_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return task


@router.get("/{task_id}/logs", response_model=list[TaskLogOut])
def list_logs(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    owner_id = _parse_user_id(user_id)
    task = session.get(Task, task_id)
    task = _ensure_owner(task, owner_id)
    logs = (
        session.exec(
            select(TaskLog)
            .where(TaskLog.task_id == task.id)
            .order_by(TaskLog.created_at.asc())
        ).all()
    )
    return [
        TaskLogOut(
            id=str(log.id),
            task_id=str(log.task_id),
            event=log.event,
            detail=log.detail,
            created_at=log.created_at,
        )
        for log in logs
    ]


@router.post("/{task_id}/logs", response_model=TaskLogOut)
def add_log(
    task_id: str,
    payload: TaskLogCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    owner_id = _parse_user_id(user_id)
    task = session.get(Task, task_id)
    task = _ensure_owner(task, owner_id)
    log = TaskLog(task_id=task.id, **payload.model_dump())
    session.add(log)
    session.commit()
    session.refresh(log)
    return TaskLogOut(
        id=str(log.id),
        task_id=str(log.task_id),
        event=log.event,
        detail=log.detail,
        created_at=log.created_at,
    )
