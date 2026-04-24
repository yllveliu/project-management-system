from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_admin
from app.database import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskStatusUpdate, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    task = Task(
        title=task_in.title,
        description=task_in.description,
        project_id=task_in.project_id,
        assigned_to=task_in.assigned_to,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/archived", response_model=list[TaskResponse])
def get_archived_tasks(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(Task).filter(Task.is_archived == True).order_by(Task.archived_at.desc()).all()


@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task).filter(Task.is_archived == False)
    if current_user.role == "admin":
        if project_id is not None:
            query = query.filter(Task.project_id == project_id)
        if status is not None:
            query = query.filter(Task.status == status)
        if assigned_to is not None:
            query = query.filter(Task.assigned_to == assigned_to)
    else:
        query = query.filter(Task.assigned_to == current_user.id)
        if project_id is not None:
            query = query.filter(Task.project_id == project_id)
        if status is not None:
            query = query.filter(Task.status == status)
    query = query.order_by(Task.created_at.desc())
    return query.all()


@router.patch("/{id}", response_model=TaskResponse)
def update_task(id: int, task_in: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.assigned_to is not None:
        task.assigned_to = task_in.assigned_to
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


@router.patch("/{id}/archive", response_model=TaskResponse)
def archive_task(id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != "Done":
        raise HTTPException(status_code=400, detail="Only completed tasks can be archived")
    task.is_archived = True
    task.archived_at = datetime.now()
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{id}/status", response_model=TaskResponse)
def update_task_status(id: int, task_in: TaskStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this task's status")
    allowed = ["To Do", "In Progress", "Done"]
    if task_in.status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")
    previous_status = task.status
    task.status = task_in.status
    if task_in.status == "In Progress":
        if task.started_at is None:
            task.started_at = datetime.now()
        if previous_status == "Done":
            task.completed_at = None
    elif task_in.status == "Done":
        task.completed_at = datetime.now()
    elif task_in.status == "To Do":
        if previous_status == "Done":
            task.completed_at = None
    db.commit()
    db.refresh(task)
    return task
