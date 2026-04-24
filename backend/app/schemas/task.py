from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    project_id: int
    assigned_to: Optional[int]
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    is_archived: bool = False
    archived_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TaskStatusUpdate(BaseModel):
    status: str
