from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.activity import Activity
from app.models.task import Task
from app.models.user import User
from app.schemas.activity import ActivityResponse

router = APIRouter(tags=["activity"])


def log_activity(db: Session, task_id: int, user_id: int, action: str):
    activity = Activity(task_id=task_id, user_id=user_id, action=action)
    db.add(activity)


@router.get("/tasks/{task_id}/activity", response_model=list[ActivityResponse])
def get_task_activity(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    activities = (
        db.query(Activity)
        .filter(Activity.task_id == task_id)
        .order_by(Activity.created_at.asc())
        .all()
    )
    result = []
    for a in activities:
        actor = db.query(User).filter(User.id == a.user_id).first()
        result.append(
            ActivityResponse(
                id=a.id,
                task_id=a.task_id,
                user_id=a.user_id,
                actor_name=actor.full_name if actor else None,
                action=a.action,
                created_at=a.created_at,
            )
        )
    return result
