import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PILLARS = [
  {
    n: '01',
    title: 'Excellence',
    desc: 'Des ingrédients de première qualité, sélectionnés avec soin auprès de producteurs locaux.',
  },
  {
    n: '02',
    title: 'Fraîcheur',
    desc: 'Des produits frais livrés quotidiennement pour garantir une qualité optimale.',
  },
  {
    n: '03',
    title: 'Service',
    desc: 'Une équipe dévouée pour vous offrir une expérience mémorable à chaque visite.',
  },
];

const IMG_FIRE =
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&auto=format&fit=crop';
const IMG_HANDS =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=700&q=80&auto=format&fit=crop';

/**
 * Acte II — Immersion. Bascule vers « le papier » : respiration claire
 * après l'apnée du hero. Spread asymétrique, piliers éditoriaux,
 * photos qui cassent la grille avec parallaxe discret.
 */
export function PhilosophySection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Titre : lignes masquées qui se lèvent
        gsap.from('.js-ph-line > span', {
          yPercent: 110,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: '.js-ph-title', start: 'top 82%', once: true },
        });

        // Eyebrow + prose
        gsap.from('.js-ph-fade', {
          y: 18,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
        });

        // Piliers : contenu + filets qui se tracent
        gsap.from('.js-pillar', {
          y: 26,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.js-pillars', start: 'top 80%', once: true },
        });
        gsap.from('.js-rule', {
          scaleX: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.js-pillars', start: 'top 80%', once: true },
        });

        // Photos : révélation par masque (bas → haut) + zoom d'installation,
        // puis parallaxe subtil lié au scroll
        gsap.utils.toArray<HTMLElement>('.js-ph-mask').forEach((mask) => {
          const img = mask.querySelector('img');
          gsap
            .timeline({
              scrollTrigger: { trigger: mask, start: 'top 84%', once: true },
            })
            .from(mask, {
              clipPath: 'inset(100% 0% 0% 0%)',
              duration: 1.1,
              ease: 'expo.out',
            })
            .from(img, { scale: 1.15, duration: 1.5, ease: 'power3.out' }, 0);

          gsap.fromTo(
            img,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: 'none',
              scrollTrigger: {
                trigger: mask,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            }
          );
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="philo" aria-labelledby="philo-title">
      <div className="philo__inner">
        {/* Colonne éditoriale */}
        <div>
          <p className="js-ph-fade philo__eyebrow">Notre philosophie</p>

          <h2 id="philo-title" className="js-ph-title philo__title">
            <span className="js-ph-line hero-line">
              <span>Chaque plat raconte</span>
            </span>
            <span className="js-ph-line hero-line">
              <span>
                <em>une terre.</em>
              </span>
            </span>
          </h2>

          <p className="js-ph-fade philo__prose">
            Découvrez ce qui fait du Gourmet une destination culinaire unique : une cuisine
            béninoise sublimée, née du feu, des marchés de Cotonou et d'un savoir-faire
            transmis — puis affiné, assiette après assiette.
          </p>

          <div className="js-pillars philo__pillars">
            {PILLARS.map((p) => (
              <div key={p.n} className="js-pillar philo__pillar">
                <span className="js-rule philo__rule" aria-hidden="true" />
                <span className="n">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne images — cassent légèrement la grille */}
        <div className="philo__media">
          <figure className="js-ph-mask philo__ph philo__ph--a">
            <img src={IMG_FIRE} alt="Braisé au feu de bois" loading="lazy" decoding="async" />
            <figcaption>Le feu</figcaption>
          </figure>
          <figure className="js-ph-mask philo__ph philo__ph--b">
            <img src={IMG_HANDS} alt="Les mains du chef au travail" loading="lazy" decoding="async" />
            <figcaption>La main</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
