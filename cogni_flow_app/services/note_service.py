from typing import Optional
from cogni_flow_app.services.base import BaseService
from cogni_flow_app.repositories.base import BaseRepository
from cogni_flow_app.models.note import Note
from cogni_flow_app.models.requests.note_requests import CreateNoteRequest, UpdateNoteRequest


class NoteService(BaseService[Note]):
    def __init__(self, repository: BaseRepository[Note]):
        super().__init__(repository)

    def create_note(self, request: CreateNoteRequest) -> Note:
        data = request.model_dump()
        data["tags"] = [t.strip() for t in data["tags"].split(",") if t.strip()]
        return self._repo.create(data)

    def update_note(self, note_id: int, request: UpdateNoteRequest) -> Optional[Note]:
        data = {k: v for k, v in request.model_dump().items() if v is not None}
        if "tags" in data:
            data["tags"] = [t.strip() for t in data["tags"].split(",") if t.strip()]
        return self._repo.update(note_id, data)
