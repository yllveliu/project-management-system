from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    client_name: Optional[str] = None
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Active"


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    client_name: Optional[str]
    start_date: Optional[date]
    deadline: Optional[date]
    priority: str
    status: str
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}
