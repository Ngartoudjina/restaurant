import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { siteConfig, whatsappUrl } from '@/config/site';
import '@/styles/braise-bronze.css';

// Réseaux sociaux : on n'affiche que ceux qui ont une URL renseignée.
const socialLinks = [
  { icon: Facebook, href: siteConfig.social.facebook, label: 'Facebook' },
  { icon: Instagram, href: siteConfig.social.instagram, label: 'Instagram' },
  { icon: Twitter, href: siteConfig.social.twitter, label: 'Twitter / X' },
].filter((s) => s.href);

const NAV = [
  { label: 'Accueil', to: '/' },
  { label: 'Notre menu', to: '/menu' },
  { label: 'Réservation', to: '/reservation' },
  { label: 'À propos', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

/**
 * Footer « fin de service » — l'écran s'éteint comme une salle
 * après le dernier couvert : ébène, hairlines, une seule voix bronze.
 */
export function Footer() {
  return (
    <footer className="bbf">
      <div className="bbf__inner">
        <div className="bbf__grid">
          {/* Marque */}
          <div>
            <Link to="/" className="bbf__brand">
              Le <em>Gourmet</em>
            </Link>
            <p className="bbf__desc">{siteConfig.shortDescription}</p>
            {socialLinks.length > 0 && (
              <div className="bbf__social">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <h3>Navigation</h3>
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Horaires */}
          <div>
            <h3>Horaires</h3>
            <ul className="bbf__hours">
              {siteConfig.hours.map((h) => (
                <li key={h.day}>
                  <b>{h.day}</b>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3>Contact</h3>
            <ul className="bbf__contact">
              <li>
                <MapPin className="h-4 w-4" />
                <a href={siteConfig.contact.mapUrl} target="_blank" rel="noopener noreferrer">
                  {siteConfig.contact.addressStreet}
                  <br />
                  {siteConfig.contact.addressCity}, {siteConfig.contact.addressCountry}
                </a>
              </li>
              <li>
                <Phone className="h-4 w-4" />
                <a href={siteConfig.contact.phoneLink}>{siteConfig.contact.phoneDisplay}</a>
              </li>
              <li>
                <MessageCircle className="h-4 w-4" />
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                  Commander sur WhatsApp
                </a>
              </li>
              <li>
                <Clock className="h-4 w-4" />
                <span>Service midi &amp; soir</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre finale */}
        <div className="bbf__bottom">
          <span>© {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.</span>
          <nav aria-label="Liens légaux">
            <Link to="/legal">Mentions légales</Link>
            <Link to="/privacy">Politique de confidentialité</Link>
            <span>
              Site par{' '}
              <a href="https://abelbeingar.me" target="_blank" rel="noopener noreferrer">
                Abel Beingar
              </a>
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
