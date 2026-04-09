import { NavLink } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';

export default function Sidebar() {
  const { userId, sessionId } = useSession();

  const navItems = [
    { path: '/', label: 'Chat', icon: '💬' },
    { path: '/tasks', label: 'Tasks', icon: '✓' },
    { path: '/notes', label: 'Notes', icon: '📝' },
    { path: '/events', label: 'Events', icon: '📅' },
  ];

  return (
    <div className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 text-2xl font-bold text-purple-500">
          <span>⚡</span>
          <span>CogniFlow</span>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-1">Active Session</div>
        <div className="text-xs text-slate-400 font-mono truncate" title={sessionId}>
          {sessionId.slice(0, 8)}...
        </div>
        <div className="text-xs text-slate-500 mt-2">User ID</div>
        <div className="text-xs text-slate-400 font-mono">{userId}</div>
      </div>
    </div>
  );
}
