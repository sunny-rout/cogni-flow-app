from pydantic import BaseModel


class Event(BaseModel):
    id: int
    title: str
    description: str = ""
    start_time: str
    end_time: str
    location: str = ""
    created_at: str
