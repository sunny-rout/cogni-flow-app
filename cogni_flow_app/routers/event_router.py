from fastapi import HTTPException, Query
from cogni_flow_app.routers.base_router import create_crud_router
from cogni_flow_app.services import event_service
from cogni_flow_app.models.requests.event_requests import CreateEventRequest, UpdateEventRequest
from cogni_flow_app.models.responses.event_responses import EventResponse, EventListResponse

router = create_crud_router(event_service, "/api/events", ["Events"])


@router.get("/upcoming", response_model=EventListResponse)
def get_upcoming(from_date: str = Query(None)):
    return EventListResponse.ok(data=event_service.get_upcoming(from_date))


@router.post("/", response_model=EventResponse)
def create(request: CreateEventRequest):
    try:
        result = event_service.create_event(request)
        return EventResponse.ok(data=result, message="Event created successfully")
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.patch("/{event_id}", response_model=EventResponse)
def update(event_id: int, request: UpdateEventRequest):
    try:
        result = event_service.update_event(event_id, request)
        if not result:
            raise HTTPException(404, f"Event {event_id} not found")
        return EventResponse.ok(data=result, message="Event updated successfully")
    except ValueError as e:
        raise HTTPException(400, str(e))
