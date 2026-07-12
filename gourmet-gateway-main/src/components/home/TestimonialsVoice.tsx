import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { mockReviews } from '@/lib/data';
import { siteConfig } from '@/config/site';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ROTATE_MS = 6400;

/**
 * Acte IV — Confiance. Une seule voix à la fois, en grand :
 * une citation forte convainc mieux que trois murmures en grille.
 * Rotation douce, reprise manuelle par les index.
 */
export function TestimonialsVoice() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduceRef = useRef(false);

  // Rotation automatique (coupée si l'utilisateur préfère moins d'animations)
  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceRef.current) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % mockReviews.length),
      ROTATE_MS
    );
    return () => window.clearInterval(id);
  }, []);

  // Entrée de la citation active
  useGSAP(
    () => {
      if (reduceRef.current) return;
      gsap.fromTo(
        '.js-voice-active .js-voice-el',
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.09 }
      );
    },
    { scope: root, dependencies: [active] }
  );

  // Révélation de la section (eyebrow + ancrage local)
  useGSAP(
    () => {
      gsap.from('.js-voice-frame', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="voice" aria-labelledby="voice-title">
      <div className="voice__inner">
        <p className="js-voice-frame philo__eyebrow" id="voice-title">
          Ce qu'ils en disent
        </p>

        <div className="voice__stage">
          {mockReviews.map((review, i) => (
            <blockquote
              key={review.id}
              className={`voice__quote${i === active ? ' is-active js-voice-active' : ''}`}
              aria-hidden={i !== active}
              style={{ margin: 0 }}
            >
              <p className="js-voice-el voice__stars" aria-label={`${review.rating} étoiles sur 5`}>
                {'★'.repeat(review.rating)}
                <span style={{ opacity: 0.25 }}>{'★'.repeat(5 - review.rating)}</span>
              </p>
              <p className="js-voice-el voice__text">« {review.comment} »</p>
              <footer className="js-voice-el voice__author">
                <b>{review.userName}</b> Client vérifié
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="voice__nav" role="tablist" aria-label="Choisir un témoignage">
          {mockReviews.map((r, i) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={i === active}
              aria-label={`Témoignage de ${r.userName}`}
              className={`voice__dot${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span />
            </button>
          ))}
        </div>

        {/* Ancrage local : les preuves tenables, jamais de faux chiffres */}
        <div className="js-voice-frame voice__anchor">
          <span>
            <b>{siteConfig.contact.addressCity}</b> · {siteConfig.contact.addressStreet}
          </span>
          <span>
            <b>Livraison</b> · partout à Cotonou
          </span>
          <span>
            <b>Ce soir</b> · {siteConfig.hours[0].time}
          </span>
        </div>
      </div>
    </section>
  );
}
