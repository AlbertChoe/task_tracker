from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, or_

from ..core.pagination import paginate
from ..db import Task, TaskLog, get_session
from ..deps import get_current_user_id
from .schemas import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _parse_user_id(raw_user_id: str) -> UUID:
    try:
        return UUID(raw_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


def _ensure_owner(task: Task | None, owner_id: UUID) -> Task:
    if not task:
        raise HTTPException(status_code=404, detail="Not found")
    if task.created_by != owner_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return task


def _to_task_out(task: Task) -> TaskOut:
    return TaskOut(
        id=str(task.id),
        title=task.title,
        description=task.description,
        assignee=task.assignee,
        status=task.status,
        start_date=task.start_date,
        due_date=task.due_date,
        created_at=task.created_at,
        completed_at=task.completed_at,
        created_by=str(task.created_by),
    )


@router.post("/", response_model=TaskOut)
def create_task(
    payload: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    owner_id = _parse_user_id(user_id)
    data = payload.model_dump()
    assignee = data.get("assignee")
    if assignee:
        data["assignee"] = assignee.lower()
    task = Task(**data, created_by=owner_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    session.add(TaskLog(task_id=task.id, event="CREATED"))
    session.commit()
    return _to_task_out(task)


@router.get("/", response_model=list[TaskOut])
def list_tasks(
    status: str | None = Query(default=None),
    q: str | None = Query(default=None),
    page: int = 1,
    size: int = 10,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    owner_id = _parse_user_id(user_id)
    stmt = select(Task).where(Task.created_by == owner_id)
    if status:
        stmt = stmt.where(Task.status == status)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                Task.title.ilike(like),
                Task.description.ilike(like),
                Task.assignee.ilike(like),
            )
        )
    stmt = stmt.order_by(Task.created_at.desc())
    stmt = paginate(stmt, page, size)
    tasks = session.exec(stmt).all()
    return [_to_task_out(t) for t in tasks]


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    owner_id = _parse_user_id(user_id)
    task = session.get(Task, task_id)
    task = _ensure_owner(task, owner_id)
    return _to_task_out(task)


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    owner_id = _parse_user_id(user_id)
    task = session.get(Task, task_id)
    task = _ensure_owner(task, owner_id)
    data = payload.model_dump(exclude_unset=True)
    if "assignee" in data and data["assignee"]:
        data["assignee"] = data["assignee"].lower()
    old_status = task.status
    for key, value in data.items():
        setattr(task, key, value)
    session.add(task)
    session.commit()
    session.refresh(task)
    if "status" in data and data["status"] != old_status:
        session.add(
            TaskLog(
                task_id=task.id,
                event="STATUS_CHANGED",
                detail=f"{old_status} -> {data['status']}",
            )
        )
        session.commit()
    if "completed_at" in data and data["completed_at"] is not None:
        session.add(TaskLog(task_id=task.id, event="COMPLETED"))
        session.commit()
    return _to_task_out(task)


@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    owner_id = _parse_user_id(user_id)
    task = session.get(Task, task_id)
    if task and task.created_by == owner_id:
        session.query(TaskLog).filter(TaskLog.task_id == task.id).delete()
        session.delete(task)
        session.commit()
    elif task:
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"ok": True}
