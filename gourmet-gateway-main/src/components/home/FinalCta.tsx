import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { siteConfig, whatsappUrl } from '@/config/site';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Acte V — Passage à l'acte. Retour à l'ébène le plus profond :
 * une invitation, deux portes. L'écran s'éteint comme une salle
 * après le service.
 */
export function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.js-final-line > span', {
          yPercent: 110,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        });
        gsap.from('.js-final-fade', {
          y: 18,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: 'top 66%', once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="final" aria-labelledby="final-title">
      <div className="final__inner">
        <p className="js-final-fade final__kicker">Commande · Livraison · Réservation</p>

        <h2 id="final-title" className="final__title">
          <span className="js-final-line hero-line">
            <span>Prêt à passer</span>
          </span>
          <span className="js-final-line hero-line">
            <span>
              <em>à table&nbsp;?</em>
            </span>
          </span>
        </h2>

        <p className="js-final-fade final__sub">
          Réservez votre table pour ce soir, ou faites-vous livrer nos créations à la maison.
          Deux portes, la même exigence.
        </p>

        <div className="js-final-fade final__ctas">
          <Link to="/reservation" className="bb-btn bb-btn--bronze">
            Réserver une table
          </Link>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bb-btn bb-btn--hairline"
          >
            Commander sur WhatsApp
          </a>
        </div>

        <div className="js-final-fade final__trust">
          {siteConfig.trust.map((item) => (
            <div key={item.label}>
              <div className="v">{item.value}</div>
              <div className="l">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
