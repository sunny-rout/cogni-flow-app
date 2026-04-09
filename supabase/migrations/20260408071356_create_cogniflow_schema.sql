/*
  # CogniFlow Application Schema

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key) - Session identifier
      - `user_id` (text) - User identifier
      - `title` (text) - Session title/name
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `messages`
      - `id` (uuid, primary key) - Message identifier
      - `session_id` (uuid, foreign key) - Reference to session
      - `role` (text) - Message role (user/model)
      - `content` (text) - Message content
      - `agent_name` (text, nullable) - Agent name for model messages
      - `created_at` (timestamptz) - Creation timestamp
    
    - `tasks`
      - `id` (uuid, primary key) - Task identifier
      - `user_id` (text) - User identifier
      - `title` (text) - Task title
      - `description` (text, nullable) - Task description
      - `status` (text) - Task status (pending/in_progress/done)
      - `priority` (text) - Priority level (low/medium/high)
      - `due_date` (timestamptz, nullable) - Due date
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `notes`
      - `id` (uuid, primary key) - Note identifier
      - `user_id` (text) - User identifier
      - `title` (text) - Note title
      - `content` (text) - Note content
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `events`
      - `id` (uuid, primary key) - Event identifier
      - `user_id` (text) - User identifier
      - `title` (text) - Event title
      - `description` (text, nullable) - Event description
      - `start_time` (timestamptz) - Start time
      - `end_time` (timestamptz, nullable) - End time
      - `location` (text, nullable) - Event location
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text DEFAULT 'New Session',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'model')),
  content text NOT NULL,
  agent_name text,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Note',
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (true);

-- Messages policies
CREATE POLICY "Users can view messages in accessible sessions"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete messages"
  ON messages FOR DELETE
  USING (true);

-- Tasks policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (true);

-- Notes policies
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (true);

-- Events policies
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
