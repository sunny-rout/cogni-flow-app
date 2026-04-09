import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface SessionContextType {
  userId: string;
  sessionId: string;
  createNewSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userId] = useState(() => {
    const stored = localStorage.getItem('cogniflow_user_id');
    if (stored) return stored;
    const newId = `user_${uuidv4().slice(0, 8)}`;
    localStorage.setItem('cogniflow_user_id', newId);
    return newId;
  });

  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem('cogniflow_session_id');
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem('cogniflow_session_id', newId);
    return newId;
  });

  const createNewSession = () => {
    const newId = uuidv4();
    setSessionId(newId);
    localStorage.setItem('cogniflow_session_id', newId);
  };

  return (
    <SessionContext.Provider value={{ userId, sessionId, createNewSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
