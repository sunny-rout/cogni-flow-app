from fastapi import HTTPException
from cogni_flow_app.routers.base_router import create_crud_router
from cogni_flow_app.services import note_service
from cogni_flow_app.models.requests.note_requests import CreateNoteRequest, UpdateNoteRequest
from cogni_flow_app.models.responses.note_responses import NoteResponse, NoteListResponse

router = create_crud_router(note_service, "/api/notes", ["Notes"])


@router.post("/", response_model=NoteResponse)
def create(request: CreateNoteRequest):
    try:
        result = note_service.create_note(request)
        return NoteResponse.ok(data=result, message="Note created successfully")
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.patch("/{note_id}", response_model=NoteResponse)
def update(note_id: int, request: UpdateNoteRequest):
    try:
        result = note_service.update_note(note_id, request)
        if not result:
            raise HTTPException(404, f"Note {note_id} not found")
        return NoteResponse.ok(data=result, message="Note updated successfully")
    except ValueError as e:
        raise HTTPException(400, str(e))
