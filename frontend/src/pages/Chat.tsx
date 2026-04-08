import { useState, useRef, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useSession } from '../contexts/SessionContext';
import { streamChat } from '../api/cogniflow';
import type { Message } from '../types';

export default function Chat() {
  const { userId, sessionId } = useSession();
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      parts: [{ text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      await streamChat(
        {
          app_name: 'multi_agent_app',
          user_id: userId,
          session_id: sessionId,
          new_message: userMessage,
        },
        (text) => {
          setStreamingText((prev) => prev + text);
        },
        (error) => {
          console.error('Stream error:', error);
          setStreamingText('Error: ' + error);
        }
      );

      if (streamingText) {
        setMessages((prev) => [
          ...prev,
          { role: 'model', parts: [{ text: streamingText }] },
        ]);
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
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-20">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg">Start a conversation with CogniFlow</p>
              <p className="text-sm mt-2">Ask about tasks, notes, events, or anything else</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                <div className="text-xs font-semibold mb-1 opacity-70">
                  {message.role === 'user' ? 'You' : 'CogniFlow'}
                </div>
                <div className="whitespace-pre-wrap">{message.parts[0].text}</div>
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-2xl rounded-lg px-4 py-3 bg-slate-800 text-slate-200">
                <div className="text-xs font-semibold mb-1 opacity-70">CogniFlow</div>
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
    </Layout>
  );
}
