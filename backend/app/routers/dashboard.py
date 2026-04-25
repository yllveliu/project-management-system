from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    project_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    now = datetime.utcnow()

    base_query = db.query(Task).filter(Task.is_archived == False)
    if project_id is not None:
        base_query = base_query.filter(Task.project_id == project_id)
    all_tasks = base_query.all()
    total_tasks = len(all_tasks)
    todo = sum(1 for t in all_tasks if t.status == "To Do")
    in_progress = sum(1 for t in all_tasks if t.status == "In Progress")
    completed = sum(1 for t in all_tasks if t.status == "Done")
    overdue = sum(1 for t in all_tasks if t.due_date and t.due_date < now and t.status != "Done")
    archived_query = db.query(Task).filter(Task.is_archived == True)
    if project_id is not None:
        archived_query = archived_query.filter(Task.project_id == project_id)
    archived = archived_query.count()

    completion_rate = round((completed / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    overdue_tasks = [
        {"id": t.id, "title": t.title, "due_date": t.due_date.isoformat() if t.due_date else None}
        for t in all_tasks
        if t.due_date and t.due_date < now and t.status != "Done"
    ]

    return {
        "total_tasks": total_tasks,
        "todo": todo,
        "in_progress": in_progress,
        "completed": completed,
        "archived": archived,
        "overdue": overdue,
        "completion_rate": completion_rate,
        "overdue_tasks": overdue_tasks,
    }
