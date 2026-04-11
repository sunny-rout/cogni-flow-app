import { useState, useRef, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useSession } from '../contexts/SessionContext';
import { streamChat, createSession } from '../api/cogniflow';
import { storage } from '../lib/storage';
import type { Session, Message } from '../lib/storage';

export default function Chat() {
  const { userId, sessionId, createSession: createNewSession } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  useEffect(() => {
    loadSessions();
    initializeSession();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    }
  }, [currentSession]);

  const loadSessions = () => {
    const allSessions = storage.sessions.getAll(userId);
    setSessions(allSessions);
  };

  const initializeSession = async () => {
    let session = storage.sessions.getById(sessionId);

    if (!session) {
      session = storage.sessions.create({
        id: sessionId,
        user_id: userId,
        title: 'New Session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await createSession(userId, sessionId);
    }

    setCurrentSession(session);
  };

  const loadMessages = (sessId: string) => {
    const sessionMessages = storage.messages.getBySession(sessId);
    setMessages(sessionMessages);
  };

  const handleNewSession = () => {
    createNewSession();
    window.location.reload();
  };

  const switchSession = (session: Session) => {
    setCurrentSession(session);
    localStorage.setItem('cogniflow_session_id', session.id);
    window.location.reload();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentSession) return;

    const userMessageContent = input;
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    const userMsg = storage.messages.create({
      id: crypto.randomUUID(),
      session_id: currentSession.id,
      role: 'user',
      content: userMessageContent,
      agent_name: null,
      created_at: new Date().toISOString(),
    });

    setMessages((prev) => [...prev, userMsg]);

    storage.sessions.update(currentSession.id, {
      updated_at: new Date().toISOString(),
    });

    let fullResponse = '';
    let detectedAgent = '';

    try {
      await streamChat(
        {
          app_name: 'multi_agent_app',
          user_id: userId,
          session_id: currentSession.id,
          new_message: {
            role: 'user',
            parts: [{ text: userMessageContent }],
          },
        },
        (text) => {
          fullResponse += text;
          setStreamingText(fullResponse);

          const agentMatch = fullResponse.match(/\[([\w_]+_agent)\]/);
          if (agentMatch) {
            detectedAgent = agentMatch[1];
          }
        },
        (error) => {
          console.error('Stream error:', error);
          setStreamingText('Error: ' + error);
        }
      );

      if (fullResponse) {
        const modelMsg = storage.messages.create({
          id: crypto.randomUUID(),
          session_id: currentSession.id,
          role: 'model',
          content: fullResponse,
          agent_name: detectedAgent || null,
          created_at: new Date().toISOString(),
        });

        setMessages((prev) => [...prev, modelMsg]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout title="Chat">
      <div className="flex h-full">
        <div className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <button
              onClick={handleNewSession}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              + New Session
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => switchSession(session)}
                className={`p-3 cursor-pointer border-b border-slate-800 hover:bg-slate-800 transition-colors ${
                  currentSession?.id === session.id ? 'bg-slate-800' : ''
                }`}
              >
                <div className="text-sm font-medium text-white truncate">
                  {session.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(session.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-20">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Start a conversation with CogniFlow</p>
                <p className="text-sm mt-2">Ask about tasks, notes, events, or anything else</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-70 flex items-center gap-2">
                    {message.role === 'user' ? (
                      'You'
                    ) : (
                      <>
                        <span>CogniFlow</span>
                        {message.agent_name && (
                          <span className="px-2 py-0.5 bg-amber-600 text-amber-100 rounded text-xs font-mono">
                            {message.agent_name}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {streamingText && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-lg px-4 py-3 bg-slate-800 text-slate-200">
                  <div className="text-xs font-semibold mb-1 opacity-70 flex items-center gap-2">
                    <span>CogniFlow</span>
                    {streamingText.match(/\[([\w_]+_agent)\]/) && (
                      <span className="px-2 py-0.5 bg-amber-600 text-amber-100 rounded text-xs font-mono">
                        {streamingText.match(/\[([\w_]+_agent)\]/)?.[1]}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{streamingText}</div>
                </div>
              </div>
            )}

            {isLoading && !streamingText && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-lg px-4 py-3 bg-slate-800 text-slate-200">
                  <div className="text-xs font-semibold mb-1 opacity-70">CogniFlow</div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-800 p-4 bg-slate-900">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
