import { useState } from "react"
import type { ReactNode } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { useToast } from "../../hooks/useToast"
import ToastContainer from "../ui/ToastContainer"
import { NavLink } from "react-router-dom"

interface LayoutProps {
  children: ReactNode
  title: string
}

const mobileNavItems = [
  { path: "/", label: "Chat", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )},
  { path: "/tasks", label: "Tasks", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )},
  { path: "/notes", label: "Notes", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )},
  { path: "/events", label: "Events", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )},
]

export default function Layout({ children, title }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toasts, removeToast } = useToast()

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-full lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex-1 lg:ml-[220px] flex flex-col min-w-0">
        <Navbar title={title} onMenuToggle={() => setMobileMenuOpen((v) => !v)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        <nav className="lg:hidden flex border-t border-slate-800 bg-slate-900">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`
              }
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
