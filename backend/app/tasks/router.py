from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, or_
from ..deps import get_current_user_id
from ..db import Task, TaskLog, get_session
from .schemas import TaskCreate, TaskUpdate, TaskOut
from ..core.pagination import paginate

router = APIRouter(prefix="/tasks", tags=["tasks"]) 

@router.post("/", response_model=TaskOut)
def create_task(payload: TaskCreate, _: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    task = Task(**payload.model_dump())
    session.add(task)
    session.commit()
    session.refresh(task)
    session.add(TaskLog(task_id=task.id, event="CREATED"))
    session.commit()
    return TaskOut(
        id=str(task.id), title=task.title, description=task.description, assignee=task.assignee,
        status=task.status, start_date=task.start_date, due_date=task.due_date,
        created_at=task.created_at, completed_at=task.completed_at
    )

@router.get("/", response_model=list[TaskOut])
def list_tasks(
    status: str | None = Query(default=None),
    q: str | None = Query(default=None),
    page: int = 1,
    size: int = 10,
    _: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    stmt = select(Task)
    if status:
        stmt = stmt.where(Task.status == status)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Task.title.ilike(like), Task.description.ilike(like), Task.assignee.ilike(like)))
    stmt = stmt.order_by(Task.created_at.desc())
    stmt = paginate(stmt, page, size)
    tasks = session.exec(stmt).all()
    return [TaskOut(
        id=str(t.id), title=t.title, description=t.description, assignee=t.assignee,
        status=t.status, start_date=t.start_date, due_date=t.due_date,
        created_at=t.created_at, completed_at=t.completed_at
    ) for t in tasks]

@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: str, _: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Not found")
    return TaskOut(
        id=str(task.id), title=task.title, description=task.description, assignee=task.assignee,
        status=task.status, start_date=task.start_date, due_date=task.due_date,
        created_at=task.created_at, completed_at=task.completed_at
    )

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: str, payload: TaskUpdate, _: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.model_dump(exclude_unset=True)
    old_status = task.status
    for k, v in data.items():
        setattr(task, k, v)
    session.add(task)
    session.commit()
    session.refresh(task)
    if "status" in data and data["status"] != old_status:
        session.add(TaskLog(task_id=task.id, event="STATUS_CHANGED", detail=f"{old_status} -> {data['status']}"))
        session.commit()
    if "completed_at" in data and data["completed_at"] is not None:
        session.add(TaskLog(task_id=task.id, event="COMPLETED"))
        session.commit()
    return TaskOut(
        id=str(task.id), title=task.title, description=task.description, assignee=task.assignee,
        status=task.status, start_date=task.start_date, due_date=task.due_date,
        created_at=task.created_at, completed_at=task.completed_at
    )

@router.delete("/{task_id}")
def delete_task(task_id: str, _: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if task:
        session.query(TaskLog).filter(TaskLog.task_id == task.id).delete()
        session.delete(task)
        session.commit()
    return {"ok": True}
