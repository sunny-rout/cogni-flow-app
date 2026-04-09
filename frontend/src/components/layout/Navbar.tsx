import { useSession } from '../../contexts/SessionContext';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { createNewSession } = useSession();

  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <button
        onClick={createNewSession}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
      >
        New Session
      </button>
    </div>
  );
}
