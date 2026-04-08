import type { ChatRequest, Session } from '../types';

const BASE_URL = 'https://cogni-flow-service-302696717488.us-central1.run.app';

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
          if (data === '[DONE]') continue;

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

export async function getSessions(userId: string): Promise<Session[]> {
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
