import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import * as api from '../api/cogniflow';

type FilterType = 'all' | 'pending' | 'in_progress' | 'done';

interface TaskData {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'done';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await api.getTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (task?: TaskData) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.due_date || undefined,
        });
      } else {
        await api.createTask(
          formData.title,
          formData.description,
          formData.priority,
          formData.due_date || undefined
        );
      }

      loadTasks();
      closeModal();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (task: TaskData) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setIsLoading(true);

    try {
      await api.deleteTask(task.id);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (task: TaskData, newStatus: 'pending' | 'in_progress' | 'done') => {
    try {
      await api.updateTask(task.id, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-slate-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-700 text-slate-300';
      case 'in_progress':
        return 'bg-teal-700 text-teal-100';
      case 'done':
        return 'bg-green-700 text-green-100';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <Layout title="Task Management">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'in_progress', 'done'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
              <span className="ml-2 text-xs opacity-75">({stats[f]})</span>
            </button>
          ))}
        </div>

        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            style={{ width: '65%' }}
          />
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            + New Task
          </button>
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <div className="text-5xl mb-3">✓</div>
              <p>No tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-slate-800 rounded-lg p-4 border-l-4 ${getPriorityColor(task.priority)} hover:bg-slate-750 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-slate-400 text-sm mb-2">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="text-slate-500 text-xs">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {task.status !== 'pending' && (
                        <button
                          onClick={() => updateTaskStatus(task, 'pending')}
                          className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                        >
                          Mark Pending
                        </button>
                      )}
                      {task.status !== 'in_progress' && (
                        <button
                          onClick={() => updateTaskStatus(task, 'in_progress')}
                          className="text-xs px-3 py-1 bg-teal-700 hover:bg-teal-600 text-teal-100 rounded transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {task.status !== 'done' && (
                        <button
                          onClick={() => updateTaskStatus(task, 'done')}
                          className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600 text-green-100 rounded transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(task)}
                      className="text-slate-400 hover:text-purple-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(task)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold text-white mb-4">
                {editingTask ? 'Edit Task' : 'New Task'}
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
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                    {isLoading ? 'Saving...' : editingTask ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
