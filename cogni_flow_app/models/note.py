from pydantic import BaseModel


class Note(BaseModel):
    id: int
    title: str
    content: str = ""
    tags: list[str] = []
    created_at: str
    updated_at: str = ""
