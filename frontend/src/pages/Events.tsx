import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useSession } from '../contexts/SessionContext';
import { sendMessage } from '../lib/messaging';
import { useToast } from '../hooks/useToast';
import * as api from '../api/cogniflow';

interface EventData {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  location: string;
  created_at: string;
  updated_at?: string;
}

type FilterType = 'upcoming' | 'all';

export default function Events() {
  const { userId, sessionId } = useSession();
  const { showToast, ToastContainer } = useToast();
  const [events, setEvents] = useState<EventData[]>([]);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const allEvents = await api.getEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      showToast('Failed to load events', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time || '',
        location: event.location,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.start_time) return;

    setIsLoading(true);

    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, {
          title: formData.title,
          description: formData.description,
          start_time: formData.start_time,
          end_time: formData.end_time || undefined,
          location: formData.location,
        });
        showToast('Event updated!', 'success');
      } else {
        await api.createEvent(
          formData.title,
          formData.start_time,
          formData.end_time,
          formData.description,
          formData.location
        );
        showToast('Event created!', 'success');
      }

      loadEvents();
      closeModal();
    } catch (error) {
      showToast('Failed to save event', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (event: EventData) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setIsLoading(true);

    try {
      await api.deleteEvent(event.id);
      loadEvents();
      showToast('Event deleted!', 'success');
    } catch (error) {
      showToast('Failed to delete event', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === 'upcoming') {
      return new Date(event.start_time) >= new Date();
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <Layout title="Events / Schedule">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex gap-3 items-center justify-between">
          <div className="flex gap-2">
            {(['upcoming', 'all'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            + New Event
          </button>
        </div>

        {isLoading && events.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-4 animate-pulse border-l-4 border-blue-500">
                <div className="h-6 bg-slate-700 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <div className="text-6xl mb-3">📅</div>
            <p className="text-lg">No events found</p>
            <p className="text-sm mt-2">Create your first event to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-slate-800 rounded-lg p-4 border-l-4 border-blue-500 hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{event.title}</h3>
                      {isUpcoming(event.start_time) && (
                        <span className="px-2 py-1 bg-blue-700 text-blue-100 rounded text-xs font-medium">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <div className="flex items-center gap-1 text-teal-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-teal-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {formatTime(event.start_time)}
                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-slate-400 text-sm">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(event)}
                      className="text-slate-400 hover:text-purple-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-xl font-semibold text-white mb-4">
                {editingEvent ? 'Edit Event' : 'New Event'}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Start Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Meeting room, address, etc."
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={3}
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
                    {isLoading ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
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
