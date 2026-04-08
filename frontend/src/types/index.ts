export interface Message {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface ChatRequest {
  app_name: string;
  user_id: string;
  session_id: string;
  new_message: Message;
}

export interface Session {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  created_at: string;
}
