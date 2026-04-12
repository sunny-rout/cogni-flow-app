interface NavbarProps {
  title: string
  onMenuToggle?: () => void
}

export default function Navbar({ title, onMenuToggle }: NavbarProps) {
  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-5 flex-shrink-0">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-muted hover:text-text-primary transition-colors p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      </div>
    </header>
  )
}
