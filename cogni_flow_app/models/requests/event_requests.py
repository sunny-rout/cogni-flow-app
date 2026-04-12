from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class CreateEventRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    start_time: str = Field(..., description="ISO: YYYY-MM-DDTHH:MM:SS")
    end_time: str = Field(..., description="ISO: YYYY-MM-DDTHH:MM:SS")
    description: str = Field("", max_length=2000)
    location: str = Field("", max_length=500)

    @validator("start_time", "end_time")
    def must_be_iso(cls, v):
        try:
            datetime.fromisoformat(v)
        except ValueError:
            raise ValueError("Must be ISO format: YYYY-MM-DDTHH:MM:SS")
        return v

    @validator("end_time")
    def end_after_start(cls, end, values):
        start = values.get("start_time")
        if start and end <= start:
            raise ValueError("end_time must be after start_time")
        return end


class UpdateEventRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = Field(None, max_length=500)

    @validator("start_time", "end_time")
    def iso_if_provided(cls, v):
        if v is None:
            return v
        try:
            datetime.fromisoformat(v)
        except ValueError:
            raise ValueError("Must be ISO format: YYYY-MM-DDTHH:MM:SS")
        return v
