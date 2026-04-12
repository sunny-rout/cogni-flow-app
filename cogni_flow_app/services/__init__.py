from cogni_flow_app.repositories import task_repo, note_repo, event_repo
from cogni_flow_app.services.task_service import TaskService
from cogni_flow_app.services.note_service import NoteService
from cogni_flow_app.services.event_service import EventService

task_service  = TaskService(task_repo)
note_service  = NoteService(note_repo)
event_service = EventService(event_repo)
