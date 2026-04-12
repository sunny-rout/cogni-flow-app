from cogni_flow_app.models.responses.base_response import ApiResponse
from cogni_flow_app.models.note import Note


class NoteResponse(ApiResponse[Note]):
    pass


class NoteListResponse(ApiResponse[list[Note]]):
    pass
