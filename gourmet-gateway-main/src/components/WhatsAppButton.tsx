import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/config/site';

/**
 * Bouton WhatsApp flottant — canal de commande prioritaire au Bénin.
 * Présent sur toutes les pages via le Layout.
 */
export function WhatsAppButton() {
  return (
    <motion.a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Commander sur WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.6, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] pl-4 pr-5 py-3 text-black font-semibold shadow-2xl shadow-[#25D366]/40 hover:bg-[#1ebe5b] transition-colors"
    >
      {/* Halo pulsant (désactivé si l'utilisateur préfère moins d'animations) */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping motion-reduce:hidden" />
      <MessageCircle className="relative h-6 w-6" />
      <span className="relative hidden sm:inline">Commander</span>
    </motion.a>
  );
}
