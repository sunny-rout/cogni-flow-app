from cogni_flow_app.services import event_service
from cogni_flow_app.models.requests.event_requests import CreateEventRequest, UpdateEventRequest


def create_event(
    title: str,
    start_time: str,
    end_time: str,
    description: str = "",
    location: str = ""
) -> dict:
    """
    Create a calendar event.
    Args:
        title: Event title (required)
        start_time: ISO format YYYY-MM-DDTHH:MM:SS (required)
                    Resolve ALL natural language BEFORE calling:
                    'tomorrow night' -> '2026-04-13T21:00:00'
                    'next Monday 3pm' -> '2026-04-13T15:00:00'
        end_time: ISO format YYYY-MM-DDTHH:MM:SS (required)
                  If user says 'for 1 hour', calculate end = start + 1hr
        description: Optional details
        location: Optional venue or meeting URL
    """
    try:
        return event_service.create_event(
            CreateEventRequest(title=title, start_time=start_time,
                               end_time=end_time, description=description,
                               location=location)
        ).model_dump()
    except ValueError as e:
        return {"error": str(e)}


def list_events(from_date: str = None) -> list:
    """
    List upcoming events sorted by start_time.
    Args:
        from_date: ISO datetime string. Defaults to now.
    """
    return [e.model_dump() for e in event_service.get_upcoming(from_date)]


def get_event(event_id: int) -> dict:
    """Get an event by ID."""
    result = event_service.get_by_id(event_id)
    return result.model_dump() if result else {"error": f"Event {event_id} not found"}


def update_event(event_id: int, title: str = None, description: str = None,
                 start_time: str = None, end_time: str = None,
                 location: str = None) -> dict:
    """Update event fields."""
    try:
        result = event_service.update_event(
            event_id,
            UpdateEventRequest(title=title, description=description,
                               start_time=start_time, end_time=end_time,
                               location=location)
        )
        return result.model_dump() if result else {"error": f"Event {event_id} not found"}
    except ValueError as e:
        return {"error": str(e)}


def delete_event(event_id: int) -> dict:
    """Delete an event by ID."""
    deleted = event_service.delete(event_id)
    return {"success": True, "id": event_id} if deleted else {"error": f"Event {event_id} not found"}


def search_events(keyword: str) -> list:
    """Search events by keyword in title, description, or location."""
    return [e.model_dump() for e in event_service.search(keyword)]
