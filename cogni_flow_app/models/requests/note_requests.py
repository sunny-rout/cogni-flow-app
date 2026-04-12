from pydantic import BaseModel, Field
from typing import Optional


class CreateNoteRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field("", max_length=50000)
    tags: str = Field("", description="Comma-separated: 'work,meeting,idea'")


class UpdateNoteRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, max_length=50000)
    tags: Optional[str] = None
