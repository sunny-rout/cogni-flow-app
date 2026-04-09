import { streamChat } from '../api/cogniflow';

export async function sendMessage(
  userId: string,
  sessionId: string,
  text: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullResponse = '';

    streamChat(
      {
        app_name: 'multi_agent_app',
        user_id: userId,
        session_id: sessionId,
        new_message: {
          role: 'user',
          parts: [{ text }],
        },
      },
      (chunk) => {
        fullResponse += chunk;
      },
      (error) => {
        reject(new Error(error));
      }
    ).then(() => {
      resolve(fullResponse);
    }).catch((error) => {
      reject(error);
    });
  });
}
