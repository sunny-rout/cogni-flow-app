from typing import Optional
from cogni_flow_app.services.base import BaseService
from cogni_flow_app.repositories.json.event_repo import JsonEventRepository
from cogni_flow_app.models.event import Event
from cogni_flow_app.models.requests.event_requests import CreateEventRequest, UpdateEventRequest


class EventService(BaseService[Event]):
    def __init__(self, repository: JsonEventRepository):
        super().__init__(repository)
        self._event_repo = repository

    def get_upcoming(self, from_date: str = None) -> list[Event]:
        return self._event_repo.get_upcoming(from_date)

    def create_event(self, request: CreateEventRequest) -> Event:
        return self._repo.create(request.model_dump())

    def update_event(self, event_id: int, request: UpdateEventRequest) -> Optional[Event]:
        data = {k: v for k, v in request.model_dump().items() if v is not None}
        return self._repo.update(event_id, data)
