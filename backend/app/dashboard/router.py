from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, func, select

from ..db import Task, get_session
from ..deps import get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _parse_user_id(raw_user_id: str) -> UUID:
    try:
        return UUID(raw_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


@router.get("/summary")
def summary(
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    owner_id = _parse_user_id(user_id)
    statuses = ["BELUM_DIMULAI", "SEDANG_DIKERJAKAN", "SELESAI"]
    by_status = {}
    total = 0
    for status in statuses:
        count_stmt = (
            select(func.count())
            .where(Task.created_by == owner_id)
            .where(Task.status == status)
        )
        count = session.exec(count_stmt).one()
        by_status[status] = count
        total += count
    rows = session.exec(
        select(Task.assignee, func.count())
        .where(Task.created_by == owner_id)
        .where(Task.assignee.isnot(None))
        .group_by(Task.assignee)
    ).all()
    top = [{"assignee": row[0], "count": row[1]} for row in rows]
    top.sort(key=lambda item: item["count"], reverse=True)
    top = top[:5]
    return {"total": total, "by_status": by_status, "top_assignees": top}
