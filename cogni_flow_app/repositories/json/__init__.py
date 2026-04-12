from cogni_flow_app.repositories.json.store import JsonFileStore
from cogni_flow_app.repositories.json.task_repo import JsonTaskRepository
from cogni_flow_app.repositories.json.note_repo import JsonNoteRepository
from cogni_flow_app.repositories.json.event_repo import JsonEventRepository
from cogni_flow_app.config import config

_store = JsonFileStore(config.data_dir)

task_repo  = JsonTaskRepository(_store)
note_repo  = JsonNoteRepository(_store)
event_repo = JsonEventRepository(_store)
