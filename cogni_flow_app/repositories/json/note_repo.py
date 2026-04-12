from cogni_flow_app.repositories.json.base_json_repo import BaseJsonRepository
from cogni_flow_app.models.note import Note


class JsonNoteRepository(BaseJsonRepository[Note]):
    collection_name = "notes"
    model_class = Note
    search_fields = ["title", "content", "tags"]
