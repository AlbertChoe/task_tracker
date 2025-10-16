from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from ..deps import get_current_user_id
from ..db import Task, get_session

router = APIRouter(prefix="/dashboard", tags=["dashboard"]) 

@router.get("/summary")
def summary(_: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    statuses = ['BELUM_DIMULAI','SEDANG_DIKERJAKAN','SELESAI']
    by_status = {}
    total = 0
    for s in statuses:
        c = session.exec(select(func.count()).where(Task.status == s)).one()
        by_status[s] = c
        total += c
    rows = session.exec(select(Task.assignee, func.count()).where(Task.assignee.isnot(None)).group_by(Task.assignee)).all()
    top = [{"assignee": r[0], "count": r[1]} for r in rows]
    top.sort(key=lambda x: x["count"], reverse=True)
    top = top[:5]
    return {"total": total, "by_status": by_status, "top_assignees": top}
