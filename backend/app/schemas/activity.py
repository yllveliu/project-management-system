from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    actor_name: Optional[str] = None
    action: str
    created_at: datetime

    model_config = {"from_attributes": True}
