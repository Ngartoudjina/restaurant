import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Package, Menu as MenuIcon, X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { siteConfig, whatsappUrl } from '@/config/site';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(useGSAP);

const NAV_ITEMS = [
  { label: 'Accueil', path: '/' },
  { label: 'Menu', path: '/menu' },
  { label: 'Réservation', path: '/reservation' },
  { label: 'À propos', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

/**
 * Navigation « Braise & Bronze » : barre ébène translucide + menu
 * plein écran cinématique (rideau clip-path, items en stagger).
 */
export function Navbar() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Timeline du menu plein écran (construite une fois)
  useGSAP(
    () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const tl = gsap.timeline({
        paused: true,
        onReverseComplete: () => gsap.set(overlay, { visibility: 'hidden' }),
      });

      if (reduce) {
        tl.set(overlay, { visibility: 'visible', clipPath: 'inset(0% 0 0% 0)' });
      } else {
        tl.set(overlay, { visibility: 'visible' })
          .to(overlay, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.inOut' })
          .from(
            '.js-ov-item > a',
            { yPercent: 110, duration: 0.7, ease: 'expo.out', stagger: 0.06 },
            '-=0.25'
          )
          .from('.js-ov-foot', { opacity: 0, y: 14, duration: 0.5, ease: 'power2.out' }, '-=0.3');
      }
      tlRef.current = tl;
    },
    { scope: rootRef }
  );

  // Ouvre / ferme + verrouille le scroll
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) {
      document.body.style.overflow = 'hidden';
      tl.play();
    } else {
      document.body.style.overflow = '';
      tl.reverse();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header ref={rootRef} className="bbnav">
      <div className="bbnav__bar">
        <Link to="/" className="bbnav__brand" aria-label="Le Gourmet — accueil">
          Le <em>Gourmet</em>
        </Link>

        {/* Liens desktop */}
        <nav className="bbnav__links" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} className="bbnav__link">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="bbnav__actions">
          {user && (
            <button
              className="bbnav__icon bbnav__hide-sm"
              onClick={() => navigate('/orders')}
              aria-label="Historique des commandes"
              title="Mes commandes"
            >
              <Package className="h-5 w-5" />
            </button>
          )}

          <button
            className="bbnav__icon"
            onClick={() => navigate('/cart')}
            aria-label={`Panier — ${itemCount} article${itemCount > 1 ? 's' : ''}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="bbnav__badge">{itemCount > 9 ? '9+' : itemCount}</span>
            )}
          </button>

          {user ? (
            <button
              className="bbnav__icon bbnav__hide-sm"
              onClick={() => navigate('/account')}
              aria-label="Mon compte"
            >
              <User className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bb-btn bb-btn--bronze bb-btn--sm bbnav__hide-sm"
            >
              Connexion
            </button>
          )}

          <button
            className="bbnav__icon bbnav__burger"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Menu plein écran */}
      <div ref={overlayRef} className="bbnav-overlay" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="bbnav-overlay__head">
          <span className="bbnav__brand" aria-hidden="true">
            Le <em>Gourmet</em>
          </span>
          <button className="bbnav__icon" onClick={() => setOpen(false)} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="bbnav-overlay__menu" aria-label="Navigation">
          {NAV_ITEMS.map((item, i) => (
            <div key={item.path} className="js-ov-item bbnav-overlay__item">
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.path);
                }}
              >
                <span className="idx">0{i + 1}</span>
                {item.label}
              </a>
            </div>
          ))}
          {user && (
            <div className="js-ov-item bbnav-overlay__item">
              <a
                href="/orders"
                onClick={(e) => {
                  e.preventDefault();
                  go('/orders');
                }}
              >
                <span className="idx">0{NAV_ITEMS.length + 1}</span>
                Mes commandes
              </a>
            </div>
          )}
        </nav>

        <div className="js-ov-foot bbnav-overlay__foot">
          <a href={siteConfig.contact.phoneLink}>{siteConfig.contact.phoneDisplay}</a>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          {user ? (
            <a
              href="/account"
              onClick={(e) => {
                e.preventDefault();
                go('/account');
              }}
            >
              Mon compte
            </a>
          ) : (
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                go('/login');
              }}
            >
              Connexion
            </a>
          )}
          <span>{siteConfig.contact.addressCity} · {siteConfig.contact.addressCountry}</span>
        </div>
      </div>
    </header>
  );
}
