from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CommentCreate(BaseModel):
    content: str
    task_id: int


class CommentResponse(BaseModel):
    id: int
    content: str
    task_id: int
    user_id: int
    author_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
