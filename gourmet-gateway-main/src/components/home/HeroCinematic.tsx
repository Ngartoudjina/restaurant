import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import heroImage from '@/assets/hero-restaurant.jpg';
import { siteConfig } from '@/config/site';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(useGSAP);

/** Le préchargeur ne joue qu'une fois par session : au retour, entrée rapide. */
const PRELOADER_KEY = 'bb-preloader-shown';
const RING_LENGTH = 289; // 2πr, r = 46

export function HeroCinematic() {
  const root = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const showPreloader =
    typeof window !== 'undefined' && window.sessionStorage.getItem(PRELOADER_KEY) !== '1';

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // — Animations réduites : tout apparaît immédiatement —
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.js-preloader', { display: 'none' });
      });

      // — Séquence complète (cf. dossier « Braise & Bronze », acte I) —
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        let mediaAt = 0;

        if (showPreloader) {
          const counter = { v: 0 };
          tl.to('.js-ring', { strokeDashoffset: 0, duration: 1.4, ease: 'none' }, 0)
            .to(
              counter,
              {
                v: 100,
                duration: 1.45,
                ease: 'power1.inOut',
                onUpdate: () => {
                  if (countRef.current) {
                    countRef.current.textContent = String(Math.round(counter.v)).padStart(2, '0');
                  }
                },
              },
              0
            )
            .from('.js-g', { opacity: 0, y: 10, duration: 0.8, ease: 'power2.out' }, 0.15)
            // Rideau : le panneau ébène se lève (origine haut)
            .to(
              '.js-preloader',
              { scaleY: 0, duration: 0.9, ease: 'expo.inOut', transformOrigin: '50% 0%' },
              1.55
            )
            .add(() => {
              window.sessionStorage.setItem(PRELOADER_KEY, '1');
              gsap.set('.js-preloader', { display: 'none' });
            });
          mediaAt = 2.05; // chevauchement −0.4 avec la fin du rideau
        } else {
          gsap.set('.js-preloader', { display: 'none' });
        }

        // Photo : présence qui s'installe
        tl.from(
          '.js-media',
          { scale: 1.12, opacity: 0, duration: 1.4, transformOrigin: '50% 50%' },
          mediaAt
        )
          // Titre : lignes masquées qui se lèvent
          .from(
            '.js-line > span',
            { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.12 },
            '-=1.0'
          )
          // Filet bronze vertical
          .from('.js-filament', { scaleY: 0, duration: 1.2, ease: 'expo.out' }, '<')
          // Kicker, sous-titre, CTA, promo
          .from(
            '.js-fade',
            { y: 16, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 },
            '-=0.55'
          )
          // Kenburns : la photo vit, très lentement
          .add(() => {
            gsap.to('.js-media img', {
              scale: 1.06,
              duration: 14,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            });
          });
      });

      // — Boutons magnétiques (desktop, souris uniquement) —
      mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const buttons = gsap.utils.toArray<HTMLElement>('.js-magnet');
        const cleanups = buttons.map((btn) => {
          const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
          const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
          const move = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          btn.addEventListener('pointermove', move);
          btn.addEventListener('pointerleave', leave);
          return () => {
            btn.removeEventListener('pointermove', move);
            btn.removeEventListener('pointerleave', leave);
          };
        });
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="hero-cine" aria-label="Le Gourmet — restaurant gastronomique béninois">
      {/* Préchargeur / rideau */}
      {showPreloader && (
        <div className="js-preloader bb-preloader" aria-hidden="true">
          <div className="bb-preloader__mark">
            <svg viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" stroke="var(--bb-hairline)" strokeWidth="1" />
              <circle
                className="js-ring"
                cx="50"
                cy="50"
                r="46"
                stroke="var(--bb-bronze)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="js-g bb-preloader__g">G</span>
          </div>
          <span className="bb-preloader__count">
            <span ref={countRef}>00</span> — LE GOURMET
          </span>
        </div>
      )}

      {/* Photo plein cadre + voile */}
      <div className="js-media hero-cine__media" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-cine__scrim" />
      </div>

      {/* Filet bronze vertical */}
      <div className="js-filament hero-cine__filament" aria-hidden="true" />

      {/* Composition bas-gauche */}
      <div className="hero-cine__content">
        <p className="js-fade hero-cine__kicker">Gastronomie béninoise · Cotonou</p>

        <h1 className="hero-cine__title">
          <span className="js-line hero-line">
            <span className="le">Le</span>
          </span>
          <span className="js-line hero-line">
            <span>Gourmet</span>
          </span>
        </h1>

        <p className="js-fade hero-cine__sub">
          Le meilleur de la <strong>cuisine béninoise</strong>, préparé avec des produits frais et
          locaux. Commandez en ligne avec <strong>livraison rapide à Cotonou</strong>, ou réservez
          votre table.
        </p>

        <div className="js-fade hero-cine__ctas">
          <Link to="/menu" className="js-magnet bb-btn bb-btn--bronze">
            Commander en ligne
          </Link>
          <Link to="/reservation" className="js-magnet bb-btn bb-btn--hairline">
            Réserver une table
          </Link>
        </div>

        <p className="js-fade hero-cine__promo">
          <span aria-hidden="true">🎁</span>
          <span>
            {siteConfig.promo.percent}% sur votre 1ʳᵉ commande avec le code{' '}
            <b>{siteConfig.promo.code}</b>
          </span>
        </p>
      </div>

      {/* Fil de scroll */}
      <div className="hero-cine__cue" aria-hidden="true" />
    </section>
  );
}
