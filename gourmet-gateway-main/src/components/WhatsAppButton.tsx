import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/config/site';

/**
 * Bouton WhatsApp flottant — canal de commande prioritaire au Bénin.
 * Présent sur toutes les pages via le Layout.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Commander sur WhatsApp"
      className="group fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] p-3.5 sm:pl-4 sm:pr-5 sm:py-3 text-black font-semibold shadow-2xl shadow-[#25D366]/40 hover:bg-[#1ebe5b] transition-all duration-300 hover:scale-105 active:scale-95 motion-safe:animate-[wa-pop_0.5s_cubic-bezier(0.16,1,0.3,1)_0.6s_both]"
    >
      {/* Halo pulsant (désactivé si l'utilisateur préfère moins d'animations) */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping motion-reduce:hidden" />
      <MessageCircle className="relative h-6 w-6" />
      <span className="relative hidden sm:inline">Commander</span>
    </a>
  );
}
