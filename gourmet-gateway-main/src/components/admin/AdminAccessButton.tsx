import { Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export function AdminAccessButton() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) return null;

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      onClick={() => navigate('/admin')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:from-[#C16207] hover:to-[#E8932F] transition-all duration-300 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
      <span>Admin</span>
      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
    </motion.button>
  );
}