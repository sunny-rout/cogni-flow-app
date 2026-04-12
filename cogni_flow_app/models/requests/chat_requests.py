from pydantic import BaseModel, Field


class MessagePart(BaseModel):
    text: str = Field(..., min_length=1)


class NewMessage(BaseModel):
    role: str = Field("user")
    parts: list[MessagePart]


class ChatRequest(BaseModel):
    app_name: str = Field(..., description="Must be 'cogni_flow_app'")
    user_id: str = Field(..., min_length=1)
    session_id: str = Field(..., min_length=1)
    new_message: NewMessage
