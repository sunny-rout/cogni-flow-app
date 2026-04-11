import { NavLink } from "react-router-dom"
import { useSession } from "../../hooks/useSession"

const navItems = [
  {
    path: "/",
    label: "Chat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    path: "/tasks",
    label: "Tasks",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    path: "/notes",
    label: "Notes",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    path: "/events",
    label: "Events",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { userId, sessions, createSession, switchSession, sessionId } = useSession()

  return (
    <aside className="w-[220px] bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-bold" style={{ color: "#8b5cf6" }}>CogniFlow</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? "bg-slate-700/80 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4 pb-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider px-3 mb-2">Sessions</div>
          <div className="space-y-0.5 max-h-36 overflow-y-auto">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => switchSession(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                  s.id === sessionId
                    ? "bg-slate-700 text-white"
                    : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                }`}
              >
                {s.id.slice(0, 12)}...
              </button>
            ))}
          </div>
          <button
            onClick={createSession}
            className="w-full mt-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
          </button>
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-slate-800">
        <div className="text-xs text-slate-600 mb-0.5">Signed in as</div>
        <div className="text-xs text-slate-400 font-mono truncate">{userId}</div>
      </div>
    </aside>
  )
}
