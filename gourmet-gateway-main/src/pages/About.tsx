import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Layout } from '@/components/layout/Layout';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VALUES = [
  { n: '01', title: 'Excellence', desc: 'La quête permanente de la perfection dans chaque plat.' },
  { n: '02', title: 'Fraîcheur', desc: 'Des produits frais livrés quotidiennement par nos partenaires.' },
  { n: '03', title: 'Passion', desc: "L'amour de la cuisine qui se ressent dans chaque création." },
  { n: '04', title: 'Service', desc: 'Un accueil chaleureux et un service irréprochable.' },
];

const TEAM = [
  {
    name: 'Abel Beingar',
    role: 'Chef Exécutif',
    desc: "Passionné par la cuisine béninoise contemporaine, il signe une carte où la tradition rencontre l'audace.",
  },
  {
    name: 'Marie Laurent',
    role: 'Sous-Chef',
    desc: 'Spécialiste des desserts, formée au Cordon Bleu, créatrice de saveurs uniques.',
  },
  {
    name: 'Jean-Paul Martin',
    role: 'Sommelier',
    desc: 'Expert en accords mets et vins, conseils personnalisés pour chaque plat.',
  },
];

export default function About() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('.js-a-line > span', { yPercent: 110, duration: 1, stagger: 0.1 })
          .from(
            '.js-a-fade',
            { y: 16, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 },
            '-=0.6'
          );

        // Révélations au scroll, groupées par section
        gsap.utils.toArray<HTMLElement>('.js-a-section').forEach((section) => {
          gsap.from(section.querySelectorAll('.js-a-item'), {
            y: 26,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: section, start: 'top 78%', once: true },
          });
        });

        gsap.from('.js-a-rule', {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.js-a-values', start: 'top 80%', once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <Layout>
      <div ref={root}>
        {/* En-tête — la nuit */}
        <section className="mhero" aria-labelledby="about-title">
          <div className="mhero__inner">
            <p className="js-a-fade philo__eyebrow" style={{ color: 'var(--bb-bronze)' }}>
              À propos
            </p>
            <h1 id="about-title" className="mhero__title">
              <span className="js-a-line hero-line">
                <span>La maison</span>
              </span>
              <span className="js-a-line hero-line">
                <span>
                  <em>Le Gourmet.</em>
                </span>
              </span>
            </h1>
            <p className="js-a-fade mhero__sub">
              Une table née à Cotonou, où la gastronomie béninoise rencontre l'exigence
              contemporaine.
            </p>
          </div>
        </section>

        {/* Histoire — le papier */}
        <section className="js-a-section astory" aria-labelledby="story-title">
          <div className="astory__inner">
            <div className="astory__text">
              <p className="js-a-item philo__eyebrow" id="story-title">
                Notre histoire
              </p>
              <p className="js-a-item">
                Fondé en 2010 au cœur de Cotonou, Le Gourmet est né de la vision d'un chef
                passionné : <strong>créer un lieu où la gastronomie béninoise rencontre
                l'innovation moderne.</strong>
              </p>
              <p className="js-a-item">
                Notre restaurant est bien plus qu'un simple lieu de restauration. C'est une
                expérience sensorielle complète où chaque détail, de l'ambiance à la présentation
                des plats, est pensé pour émerveiller nos convives.
              </p>
              <div className="js-a-item astory__pull">
                <p>
                  Nous travaillons exclusivement avec des producteurs locaux sélectionnés pour la
                  qualité exceptionnelle de leurs produits — fraîcheur et authenticité à chaque
                  bouchée.
                </p>
              </div>
            </div>

            <div className="astory__facts">
              <div className="js-a-item astory__fact">
                <div className="v">2010</div>
                <div className="l">Année de fondation</div>
              </div>
              <div className="js-a-item astory__fact">
                <div className="v">Cotonou</div>
                <div className="l">Au cœur du Bénin</div>
              </div>
              <div className="js-a-item astory__fact">
                <div className="v">100 % local</div>
                <div className="l">Producteurs partenaires</div>
              </div>
            </div>
          </div>
        </section>

        {/* Valeurs — le papier, lignes éditoriales */}
        <section
          className="js-a-section astory js-a-values"
          style={{ paddingTop: 0 }}
          aria-label="Nos valeurs"
        >
          <div className="astory__inner" style={{ gridTemplateColumns: '1fr' }}>
            <div>
              <p className="js-a-item philo__eyebrow">Nos valeurs</p>
              <div className="philo__pillars" style={{ maxWidth: 780 }}>
                {VALUES.map((v) => (
                  <div key={v.n} className="js-a-item philo__pillar">
                    <span className="js-a-rule philo__rule" aria-hidden="true" />
                    <span className="n">{v.n}</span>
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Équipe — retour à la nuit */}
        <section className="js-a-section team" aria-labelledby="team-title">
          <div className="team__inner">
            <p className="js-a-item sig__eyebrow" id="team-title">
              La brigade
            </p>
            <h2 className="js-a-item sig__title">
              Ceux qui font <em>la maison.</em>
            </h2>
            <div className="team__grid">
              {TEAM.map((m) => (
                <article key={m.name} className="js-a-item tcard">
                  <div className="tcard__initial" aria-hidden="true">
                    {m.name.charAt(0)}
                  </div>
                  <h3>{m.name}</h3>
                  <p className="role">{m.role}</p>
                  <p className="d">{m.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Citation finale + porte */}
        <section className="js-a-section aquote">
          <blockquote className="js-a-item">
            « On ne quitte pas une table du Gourmet — <em>on s'en souvient.</em> »
          </blockquote>
          <p className="js-a-item who">La maison</p>
          <div className="js-a-item" style={{ marginTop: '2.4rem' }}>
            <Link to="/reservation" className="bb-btn bb-btn--bronze">
              Réserver une table
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
