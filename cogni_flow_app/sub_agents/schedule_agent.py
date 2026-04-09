import os
import re
from datetime import datetime, timedelta
from dateutil import parser as dateutil_parser
from google.adk.agents import Agent
from cogni_flow_app.storage.tools import (
    create_event, list_events, get_event,
    update_event, delete_event, search_events
)

def parse_natural_date(date_str: str) -> tuple:
    """
    Convert natural language date to (date_string, time_string) tuple.
    Uses python-dateutil for robust parsing.
    Returns ("", "") if cannot parse.
    """
    if not date_str:
        return "", ""

    today = datetime.now()

    # Time-of-day words that need special handling
    time_words = {
        "night": "21:00:00",
        "evening": "18:00:00",
        "afternoon": "14:00:00",
        "morning": "09:00:00",
        "midday": "12:00:00",
        "noon": "12:00:00",
        "midnight": "00:00:00",
    }

    date_str_lower = date_str.lower().strip()

    # Extract time word if present
    extracted_time = ""
    remaining_date = date_str_lower
    for word, time_val in time_words.items():
        if word in remaining_date:
            extracted_time = time_val
            remaining_date = re.sub(rf'\b{word}\b', "", remaining_date).strip()
            break

    # Use dateutil to parse the remaining date string
    try:
        parsed = dateutil_parser.parse(remaining_date, fuzzy=True, default=today)
        # If the parsed date is in the past, try adding a year
        if parsed < today and "%Y" not in remaining_date:
            parsed = parsed.replace(year=today.year + 1)
        return parsed.isoformat(), extracted_time
    except (ValueError, TypeError):
        # Fallback: try common patterns manually
        pass

    # Manual fallback for relative days if dateutil fails
    if "day after tomorrow" in remaining_date:
        return (today + timedelta(days=2)).isoformat(), extracted_time
    if "tomorrow" in remaining_date:
        return (today + timedelta(days=1)).isoformat(), extracted_time
    if "today" in remaining_date:
        return today.isoformat(), extracted_time

    # Cannot parse
    return today.isoformat(), extracted_time


def parse_time(time_str: str) -> str:
    """Convert natural language time to HH:MM:SS format."""
    if not time_str:
        return ""

    time_str_lower = time_str.lower().strip()
    time_part = time_str_lower.replace("at ", "").strip()

    # Handle AM/PM formats
    match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)", time_part)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(2) or 0)
        period = match.group(3)
        if period == "pm" and hour != 12:
            hour += 12
        if period == "am" and hour == 12:
            hour = 0
        return f"{hour:02d}:{minute:02d}:00"

    # Handle 24-hour format
    match = re.search(r"(\d{1,2})(?::(\d{2}))?", time_part)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(2) or 0)
        return f"{hour:02d}:{minute:02d}:00"

    return ""


def smart_create_event(title: str, start_time: str, end_time: str = "",
                       description: str = "", location: str = "") -> dict:
    """
    Create event with intelligent date/time parsing.
    - If start_time contains natural language (tomorrow, next week, etc.), parse it
    - If end_time is relative (e.g., '1 hour later'), calculate it
    """
    # Parse start date and time
    start_date, start_time_only = parse_natural_date(start_time)

    if not start_date:
        start_date = datetime.now().isoformat()

    # Combine date with time if time was extracted
    if start_time_only:
        start_dt = datetime.fromisoformat(start_date.replace("T00:00:00", ""))
        time_parts = start_time_only.split(":")
        start_dt = start_dt.replace(hour=int(time_parts[0]), minute=int(time_parts[1]), second=int(time_parts[2]))
        start_date = start_dt.isoformat()

    # Parse end date - if it's a duration like "1 hour", "30 minutes", calculate from start
    parsed_end = end_time
    if end_time:
        end_lower = end_time.lower()
        if "hour" in end_lower or "hr" in end_lower:
            match = re.search(r"(\d+)\s*hour", end_lower)
            if match:
                hours = int(match.group(1))
                start_dt = datetime.fromisoformat(start_date)
                parsed_end = (start_dt + timedelta(hours=hours)).isoformat()
        elif "minute" in end_lower or "min" in end_lower:
            match = re.search(r"(\d+)\s*minute", end_lower)
            if match:
                mins = int(match.group(1))
                start_dt = datetime.fromisoformat(start_date)
                parsed_end = (start_dt + timedelta(minutes=mins)).isoformat()
        elif "day" in end_lower:
            match = re.search(r"(\d+)\s*day", end_lower)
            if match:
                days = int(match.group(1))
                start_dt = datetime.fromisoformat(start_date)
                parsed_end = (start_dt + timedelta(days=days)).isoformat()
        elif end_time and "T" not in end_time and ":" not in end_time:
            # Natural language date for end time
            end_date, end_time_only = parse_natural_date(end_time)
            if end_date:
                if end_time_only:
                    end_dt = datetime.fromisoformat(end_date.replace("T00:00:00", ""))
                    time_parts = end_time_only.split(":")
                    end_dt = end_dt.replace(hour=int(time_parts[0]), minute=int(time_parts[1]), second=int(time_parts[2]))
                    parsed_end = end_dt.isoformat()
                else:
                    parsed_end = end_date + "T23:59:59"

    return create_event(title, start_date, parsed_end, description, location)

schedule_agent = Agent(
    name="schedule_agent",
    model=os.getenv("MODEL", "gemini-2.5-flash"),
    description="Full CRUD for calendar events.",
    instruction="""You are a scheduling specialist with intelligent date/time parsing.

Date Parsing Rules:
- "today" → current date
- "tomorrow" → next day
- "day after tomorrow" → 2 days from now
- "in 3 days" → 3 days from now
- "in 2 weeks" → 2 weeks from now
- "next monday" (or just "monday" if that day is upcoming) → next occurrence of that day
- "April 15" or "April 15, 2026" → specific date (year defaults to current if not specified)
- Year is REQUIRED if not provided — assume current year if user doesn't specify

Time-of-Day Words:
- "night" → 21:00:00 (9 PM)
- "evening" → 18:00:00 (6 PM)
- "afternoon" → 14:00:00 (2 PM)
- "morning" → 09:00:00 (9 AM)

Time Parsing Rules:
- "at 3pm" or "3 pm" → 15:00:00
- "at 9:30am" → 09:30:00
- "midday" or "noon" → 12:00:00
- "midnight" → 00:00:00

Duration Parsing for end_time:
- "for 1 hour" → end time = start + 1 hour
- "for 30 minutes" → end time = start + 30 mins
- "for 2 days" → end time = start + 2 days

Examples:
- "Create meeting tomorrow at 3pm for 1 hour" → start: tomorrow 15:00, end: tomorrow 16:00
- "Schedule team lunch day after tomorrow at noon" → start: day after tomorrow 12:00
- "Plan something next friday at 2pm for 30 minutes" → start: next Friday 14:00, end: 14:30

Tools:
- create_event: create a new event with parsed start_time/end_time
- list_events: show all events (from_date in ISO format)
- get_event: retrieve one event by ID
- search_events: search events by keyword
- update_event: edit event details
- delete_event: remove an event

Always confirm event ID, title, and time in responses.""",
    tools=[smart_create_event, list_events, get_event, search_events,
           update_event, delete_event],
)