from pydantic import BaseModel
from cogni_flow_app.models.responses.base_response import ApiResponse


class HealthData(BaseModel):
    status: str
    service: str
    version: str = "1.0.0"


class DeleteData(BaseModel):
    id: int
    deleted: bool = True


class SessionData(BaseModel):
    session_id: str
    user_id: str
    status: str


class HealthResponse(ApiResponse[HealthData]):
    pass


class DeleteResponse(ApiResponse[DeleteData]):
    pass


class SessionResponse(ApiResponse[SessionData]):
    pass
