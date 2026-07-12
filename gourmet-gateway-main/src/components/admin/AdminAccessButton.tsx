import { Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AdminAccessButton() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) return null;

  return (
    <button
      onClick={() => navigate('/admin')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 active:scale-95 motion-safe:animate-[wa-pop_0.5s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]"
      style={{ background: 'var(--bb-bronze, #c39a5a)', color: 'var(--bb-ebony, #15100c)' }}
    >
      <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
      <span>Admin</span>
      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
    </button>
  );
}
