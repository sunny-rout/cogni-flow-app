from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from cogni_flow_app.constants import VALID_PRIORITIES, VALID_STATUSES


class CreateTaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field("", max_length=2000)
    priority: str = Field("medium")
    due_date: Optional[str] = Field(None, description="YYYY-MM-DD")

    @validator("priority")
    def priority_valid(cls, v):
        if v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {sorted(VALID_PRIORITIES)}")
        return v

    @validator("due_date")
    def due_date_format(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("due_date must be YYYY-MM-DD")
        return v


class UpdateTaskRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None

    @validator("priority")
    def priority_valid(cls, v):
        if v and v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {sorted(VALID_PRIORITIES)}")
        return v

    @validator("status")
    def status_valid(cls, v):
        if v and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {sorted(VALID_STATUSES)}")
        return v
