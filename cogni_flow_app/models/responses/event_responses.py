from cogni_flow_app.models.responses.base_response import ApiResponse
from cogni_flow_app.models.event import Event


class EventResponse(ApiResponse[Event]):
    pass


class EventListResponse(ApiResponse[list[Event]]):
    pass
