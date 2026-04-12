from datetime import datetime
from cogni_flow_app.repositories.json.base_json_repo import BaseJsonRepository
from cogni_flow_app.models.event import Event


class JsonEventRepository(BaseJsonRepository[Event]):
    collection_name = "events"
    model_class = Event
    search_fields = ["title", "description", "location"]

    def get_upcoming(self, from_date: str = None) -> list[Event]:
        cutoff = from_date or datetime.now().isoformat()
        return sorted(
            [e for e in self.get_all() if e.start_time >= cutoff],
            key=lambda e: e.start_time,
        )
