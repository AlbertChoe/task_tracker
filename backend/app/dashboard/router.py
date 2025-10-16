from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, func, select
from datetime import date, timedelta
from ..db import Task, get_session, TaskLog
from ..deps import get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _parse_user_id(raw_user_id: str) -> UUID:
    try:
        return UUID(raw_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


@router.get("/summary")
def summary(_: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    today = date.today()
    in_3d = today + timedelta(days=3)
    last_7d = today - timedelta(days=7)
    last_30d = today - timedelta(days=30)

    statuses = ['BELUM_DIMULAI', 'SEDANG_DIKERJAKAN', 'SELESAI']
    by_status = {}
    total = 0
    for s in statuses:
        c = session.exec(select(func.count()).where(Task.status == s)).one()
        by_status[s] = c
        total += c

    overdue = session.exec(
        select(func.count()).where(Task.due_date <
                                   today, Task.status != 'SELESAI')
    ).one()

    due_soon = session.exec(
        select(func.count()).where(
            Task.due_date >= today,
            Task.due_date <= in_3d,
            Task.status != 'SELESAI'
        )
    ).one()

    # WIP by assignee
    wip_rows = session.exec(
        select(Task.assignee, func.count())
        .where(Task.assignee.isnot(None), Task.status == 'SEDANG_DIKERJAKAN')
        .group_by(Task.assignee)
        .order_by(func.count().desc())
        .limit(5)
    ).all()
    wip_by_assignee = [{"assignee": r[0], "count": r[1]} for r in wip_rows]

    return {
        "total": total,
        "by_status": by_status,
        "overdue": overdue,
        "due_soon": due_soon,
        "wip_by_assignee": wip_by_assignee,  # [{assignee,count}]
    }
