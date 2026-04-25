from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project = Project(
        title=project_in.title,
        description=project_in.description,
        client_name=project_in.client_name,
        start_date=project_in.start_date,
        deadline=project_in.deadline,
        priority=project_in.priority or "Medium",
        status=project_in.status or "Active",
        created_by=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(Project).all()


@router.get("/{id}", response_model=ProjectResponse)
def get_project(id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()


@router.get("/{id}/details")
def get_project_details(id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    all_tasks = db.query(Task).filter(Task.project_id == id).all()
    active = [t for t in all_tasks if not t.is_archived and t.status != "Done"]
    completed = [t for t in all_tasks if not t.is_archived and t.status == "Done"]
    archived = [t for t in all_tasks if t.is_archived]

    total = len(active) + len(completed)
    completion_rate = round(len(completed) / total * 100, 1) if total > 0 else 0.0

    def serialize_task(t: Task):
        return {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "assigned_to": t.assigned_to,
            "started_at": t.started_at.isoformat() if t.started_at else None,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None,
            "archived_at": t.archived_at.isoformat() if t.archived_at else None,
            "completion_note": t.completion_note,
            "is_archived": t.is_archived,
            "project_id": t.project_id,
        }

    return {
        "project": {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "client_name": project.client_name,
            "start_date": project.start_date.isoformat() if project.start_date else None,
            "deadline": project.deadline.isoformat() if project.deadline else None,
            "priority": project.priority,
            "status": project.status,
            "created_at": project.created_at.isoformat() if project.created_at else None,
        },
        "stats": {
            "total_tasks": total,
            "todo": sum(1 for t in active if t.status == "To Do"),
            "in_progress": sum(1 for t in active if t.status == "In Progress"),
            "completed": len(completed),
            "archived": len(archived),
            "completion_rate": completion_rate,
        },
        "tasks": {
            "active": [serialize_task(t) for t in active],
            "completed": [serialize_task(t) for t in completed],
            "archived": [serialize_task(t) for t in archived],
        },
    }
