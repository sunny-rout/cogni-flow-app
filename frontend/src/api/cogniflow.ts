import type { ChatRequest } from '../types';

const BASE_URL = 'http://localhost:8080';

export async function streamChat(
  request: ChatRequest,
  onMessage: (text: string) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/run_sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]')
            {
              continue;
            }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content?.parts?.[0]?.text && parsed.role === 'model') {
              onMessage(parsed.content.parts[0].text);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function createSession(userId: string, sessionId: string): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/apps/multi_agent_app/users/${userId}/sessions/${sessionId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`);
  }
}

export async function getSessions(userId: string): Promise<any[]> {
  const response = await fetch(
    `${BASE_URL}/apps/multi_agent_app/users/${userId}/sessions`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.status}`);
  }

  return response.json();
}

// ── Direct Storage API ─────────────────────────────────

// Tasks
export async function getTasks(status?: string): Promise<any[]> {
  const url = status ? `${BASE_URL}/api/tasks?status=${encodeURIComponent(status)}` : `${BASE_URL}/api/tasks`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);
  return response.json();
}

export async function getTask(taskId: number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/tasks/${taskId}`);
  if (!response.ok) throw new Error(`Failed to fetch task: ${response.status}`);
  return response.json();
}

export async function createTask(title: string, description = "", priority = "medium", dueDate?: string): Promise<any> {
  const params = new URLSearchParams({ title, description, priority });
  if (dueDate) params.append("due_date", dueDate);
  const response = await fetch(`${BASE_URL}/api/tasks?${params}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to create task: ${response.status}`);
  return response.json();
}

export async function updateTask(taskId: number, fields: { title?: string; description?: string; priority?: string; due_date?: string; status?: string }): Promise<any> {
  const params = new URLSearchParams();
  if (fields.title) params.append("title", fields.title);
  if (fields.description) params.append("description", fields.description);
  if (fields.priority) params.append("priority", fields.priority);
  if (fields.due_date) params.append("due_date", fields.due_date);
  if (fields.status) params.append("status", fields.status);
  const response = await fetch(`${BASE_URL}/api/tasks/${taskId}?${params}`, { method: 'PATCH' });
  if (!response.ok) throw new Error(`Failed to update task: ${response.status}`);
  return response.json();
}

export async function deleteTask(taskId: number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Failed to delete task: ${response.status}`);
  return response.json();
}

export async function searchTasks(keyword: string): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/api/tasks/search/${encodeURIComponent(keyword)}`);
  if (!response.ok) throw new Error(`Failed to search tasks: ${response.status}`);
  return response.json();
}

// Notes
export async function getNotes(): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/api/notes`);
  if (!response.ok) throw new Error(`Failed to fetch notes: ${response.status}`);
  return response.json();
}

export async function getNote(noteId: number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/notes/${noteId}`);
  if (!response.ok) throw new Error(`Failed to fetch note: ${response.status}`);
  return response.json();
}

export async function createNote(title: string, content = "", tags = ""): Promise<any> {
  const params = new URLSearchParams({ title, content, tags });
  const response = await fetch(`${BASE_URL}/api/notes?${params}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to create note: ${response.status}`);
  return response.json();
}

export async function updateNote(noteId: number, fields: { title?: string; content?: string; tags?: string }): Promise<any> {
  const params = new URLSearchParams();
  if (fields.title) params.append("title", fields.title);
  if (fields.content) params.append("content", fields.content);
  if (fields.tags) params.append("tags", fields.tags);
  const response = await fetch(`${BASE_URL}/api/notes/${noteId}?${params}`, { method: 'PATCH' });
  if (!response.ok) throw new Error(`Failed to update note: ${response.status}`);
  return response.json();
}

export async function deleteNote(noteId: number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/notes/${noteId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Failed to delete note: ${response.status}`);
  return response.json();
}

export async function searchNotes(keyword: string): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/api/notes/search/${encodeURIComponent(keyword)}`);
  if (!response.ok) throw new Error(`Failed to search notes: ${response.status}`);
  return response.json();
}

// Events
export async function getEvents(fromDate?: string): Promise<any[]> {
  const url = fromDate ? `${BASE_URL}/api/events?from_date=${encodeURIComponent(fromDate)}` : `${BASE_URL}/api/events`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
  return response.json();
}

export async function getEvent(eventId: number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/events/${eventId}`);
  if (!response.ok) throw new Error(`Failed to fetch event: ${response.status}`);
  return response.json();
}

export async function createEvent(title: string, startTime: string, endTime = "", description = "", location = ""): Promise<any> {
  const params = new URLSearchParams({ title, start_time: startTime, end_time: endTime, description, location });
  const response = await fetch(`${BASE_URL}/api/events?${params}`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to create event: ${response.status}`);
  return response.json();
}

export async function updateEvent(eventId: number, fields: { title?: string; description?: string; start_time?: string; end_time?: string; location?: string }): Promise<any> {
  const params = new URLSearchParams();
  if (fields.title) params.append("title", fields.title);
  if (fields.description) params.append("description", fields.description);
  if (fields.start_time) params.append("start_time", fields.start_time);
  if (fields.end_time) params.append("end_time", fields.end_time);
  if (fields.location) params.append("location", fields.location);
  const response = await fetch(`${BASE_URL}/api/events/${eventId}?${params}`, { method: 'PATCH' });
  if (!response.ok) throw new Error(`Failed to update event: ${response.status}`);
  return response.json();
}

export async function deleteEvent(eventId: number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/events/${eventId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Failed to delete event: ${response.status}`);
  return response.json();
}

export async function searchEvents(keyword: string): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/api/events/search/${encodeURIComponent(keyword)}`);
  if (!response.ok) throw new Error(`Failed to search events: ${response.status}`);
  return response.json();
}
