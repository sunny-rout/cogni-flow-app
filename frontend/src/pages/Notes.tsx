import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import type { Note } from '../types';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('cogniflow_notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cogniflow_notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes((prev) => [...prev, newNote]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
  };

  const saveNote = () => {
    if (!selectedNote) return;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              title: editTitle,
              content: editContent,
              updated_at: new Date().toISOString(),
            }
          : note
      )
    );

    setSelectedNote({
      ...selectedNote,
      title: editTitle,
      content: editContent,
      updated_at: new Date().toISOString(),
    });

    setIsEditing(false);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
    }
  };

  return (
    <Layout title="Notes">
      <div className="flex h-full">
        <div className="w-80 border-r border-slate-800 bg-slate-900 overflow-auto">
          <div className="p-4">
            <button
              onClick={createNote}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              + New Note
            </button>
          </div>

          <div className="px-2">
            {notes.length === 0 ? (
              <div className="text-center text-slate-500 py-8 px-4">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">No notes yet</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                  }}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    selectedNote?.id === note.id
                      ? 'bg-slate-800'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium text-white truncate">{note.title}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {note.content || 'No content'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="text-sm text-slate-400">
                  Last updated: {new Date(selectedNote.updated_at).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveNote}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(selectedNote)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNote(selectedNote.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-auto">
                {isEditing ? (
                  <div className="max-w-4xl mx-auto space-y-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 text-2xl font-bold bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="Note title"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-96 px-4 py-3 bg-slate-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="Start writing..."
                    />
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-6">
                      {selectedNote.title}
                    </h2>
                    <div className="text-slate-300 whitespace-pre-wrap">
                      {selectedNote.content || (
                        <span className="text-slate-500 italic">No content</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg">Select a note or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
