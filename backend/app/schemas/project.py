from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    created_by: int


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}
