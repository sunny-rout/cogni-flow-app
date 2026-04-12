from pydantic import BaseModel
from typing import Optional


class Task(BaseModel):
    id: int
    title: str
    description: str = ""
    priority: str = "medium"
    status: str = "pending"
    due_date: Optional[str] = None
    created_at: str
    updated_at: str = ""
