import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/config/site';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Capture d'email contre le code de bienvenue.
 * Permet de constituer une base pour le remarketing.
 *
 * TODO: brancher `persistLead` sur un vrai endpoint (Firebase / backend)
 * pour stocker l'email et déclencher l'envoi du code par email.
 */
function persistLead(email: string) {
  try {
    const raw = window.localStorage.getItem('newsletter-leads');
    const leads: string[] = raw ? JSON.parse(raw) : [];
    if (!leads.includes(email)) leads.push(email);
    window.localStorage.setItem('newsletter-leads', JSON.stringify(leads));
  } catch {
    /* localStorage indisponible — on ignore */
  }
}

export function NewsletterSignup() {
  const root = useRef<HTMLElement>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useGSAP(
    () => {
      gsap.from('.js-news-card', {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
      });
    },
    { scope: root }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({
        title: 'Email invalide',
        description: 'Merci de saisir une adresse email valide.',
        variant: 'destructive',
      });
      return;
    }

    persistLead(value);
    setSubmitted(true);
    toast({
      title: '🎉 Votre code est prêt !',
      description: `Utilisez ${siteConfig.promo.code} pour ${siteConfig.promo.percent}% sur votre première commande.`,
      duration: 6000,
    });
  };

  return (
    <section ref={root} className="news" aria-labelledby="news-title">
      <div className="js-news-card news__card">
        <p className="news__k">L'offre de bienvenue</p>
        <h2 id="news-title" className="news__title">
          {siteConfig.promo.percent}% sur votre <em>première commande</em>
        </h2>
        <p className="news__sub">
          Inscrivez-vous pour recevoir votre code de bienvenue et nos offres exclusives.
        </p>

        {submitted ? (
          <>
            <div className="news__code">
              <Check className="h-5 w-5" />
              {siteConfig.promo.code}
            </div>
            <p className="news__note">Merci ! Appliquez ce code au moment du paiement.</p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="news__form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="votre@email.com"
              aria-label="Adresse email"
              className="news__input"
            />
            <button type="submit" className="bb-btn news__btn">
              Recevoir mon code
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
