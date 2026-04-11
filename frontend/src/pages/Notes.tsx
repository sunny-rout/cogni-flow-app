import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import * as api from '../api/cogniflow';
import { useToast } from '../hooks/useToast';

interface NoteData {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export default function Notes() {
  const { showToast, ToastContainer } = useToast();
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const allNotes = await api.getNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      showToast('Failed to load notes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadNotes();
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await api.searchNotes(searchQuery);
      setNotes(searchResults);
    } catch (error) {
      showToast('Failed to search notes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (note?: NoteData) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags?.join(', ') || '',
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        tags: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      tags: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);

    try {
      if (editingNote) {
        await api.updateNote(editingNote.id, {
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
        });
        showToast('Note updated!', 'success');
      } else {
        await api.createNote(formData.title, formData.content, formData.tags);
        showToast('Note created!', 'success');
      }

      loadNotes();
      closeModal();
    } catch (error) {
      showToast('Failed to save note', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (note: NoteData) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setIsLoading(true);

    try {
      await api.deleteNote(note.id);
      loadNotes();
      showToast('Note deleted!', 'success');
    } catch (error) {
      showToast('Failed to delete note', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Notes">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex gap-3 items-center">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search notes..."
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            + New Note
          </button>
        </div>

        {isLoading && notes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <div className="text-6xl mb-3">📝</div>
            <p className="text-lg">No notes found</p>
            <p className="text-sm mt-2">Create your first note to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex-1">{note.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(note)}
                      className="text-slate-400 hover:text-purple-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(note)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {note.content || 'No content'}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-700 text-green-100 rounded text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-xl font-semibold text-white mb-4">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="work, ideas, personal"
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    {isLoading ? 'Saving...' : editingNote ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </Layout>
  );
}
