import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Gift } from 'lucide-react';
import { siteConfig } from '@/config/site';

const STORAGE_KEY = 'promo-banner-dismissed';

/**
 * Bandeau d'annonce promotionnelle (offre 1ʳᵉ commande).
 * Dismissible et mémorisé dans le localStorage. Défile avec la page
 * (la navbar sticky reste accessible une fois le bandeau passé).
 */
export function PromoBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(STORAGE_KEY) !== '1';
  });

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* localStorage indisponible — on ignore */
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-gold via-yellow-300 to-gold text-black">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 py-2 text-sm font-medium text-center">
          <Gift className="h-4 w-4 flex-shrink-0" />
          <p>
            <span className="font-bold">{siteConfig.promo.label}</span>
            {' '}avec le code{' '}
            <Link
              to="/menu"
              className="font-bold underline decoration-2 underline-offset-2 hover:opacity-80"
            >
              {siteConfig.promo.code}
            </Link>
          </p>
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Fermer l'annonce"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
