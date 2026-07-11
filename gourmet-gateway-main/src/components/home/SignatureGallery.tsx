import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { cldImg } from '@/lib/image';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface SignatureGalleryProps {
  products: Product[];
  loading: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  starter: 'Entrée',
  main: 'Plat signature',
  dessert: 'Dessert',
  drink: 'Boisson',
  side: 'Accompagnement',
};

const fcfa = (n: number) => n.toLocaleString('fr-FR');

/**
 * Acte III — Envie. Retour à la nuit : un plat héros plein cadre,
 * puis une galerie horizontale pinnée (desktop) / swipe natif (mobile).
 */
export function SignatureGallery({ products, loading }: SignatureGalleryProps) {
  const root = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { toast } = useToast();

  const hero = products[0];
  const rest = products.slice(1);

  const handleAdd = (p: Product) => {
    addItem({ productId: p.id, name: p.name, price: p.price, quantity: 1, image: p.image });
    toast({
      title: '✨ Ajouté au panier !',
      description: `${p.name} a été ajouté à votre panier.`,
      duration: 2000,
    });
  };

  useGSAP(
    () => {
      if (loading || !hero) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Titre : lignes masquées
        gsap.from('.js-sig-line > span', {
          yPercent: 110,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: '.js-sig-head', start: 'top 82%', once: true },
        });
        gsap.from('.js-sig-fade', {
          y: 18,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.js-sig-head', start: 'top 78%', once: true },
        });

        // Plat héros : masque + zoom d'installation + parallaxe
        const heroMask = root.current?.querySelector('.js-sig-hero');
        if (heroMask) {
          const img = heroMask.querySelector('img');
          gsap
            .timeline({ scrollTrigger: { trigger: heroMask, start: 'top 80%', once: true } })
            .from(heroMask, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'expo.out' })
            .from(img, { scale: 1.15, duration: 1.6, ease: 'power3.out' }, 0);
          gsap.fromTo(
            img,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: 'none',
              scrollTrigger: { trigger: heroMask, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            }
          );
        }

        // Vignettes : révélation par masque en cascade
        gsap.from('.js-sig-tile', {
          clipPath: 'inset(100% 0% 0% 0%)',
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: trackRef.current, start: 'top 92%', once: true },
        });
      });

      // Galerie pinnée : le scroll vertical devient promenade horizontale
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track || rest.length === 0) return;

        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        if (distance() <= 0) return;

        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: viewport,
            start: 'center 58%',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root, dependencies: [loading, products.length] }
  );

  return (
    <section ref={root} className="sig" aria-labelledby="sig-title">
      <div className="js-sig-head sig__head">
        <div>
          <p className="js-sig-fade sig__eyebrow">Nos signatures</p>
          <h2 id="sig-title" className="sig__title">
            <span className="js-sig-line hero-line">
              <span>La carte</span>
            </span>
            <span className="js-sig-line hero-line">
              <span>
                des <em>envies.</em>
              </span>
            </span>
          </h2>
        </div>
        <Link to="/menu" className="js-sig-fade bb-btn bb-btn--hairline">
          Voir tout le menu
        </Link>
      </div>

      {loading ? (
        <div className="sig__empty" role="status">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--bb-bronze)' }} />
          <p style={{ marginTop: '1rem' }}>Préparation des signatures…</p>
        </div>
      ) : !hero ? (
        <div className="sig__empty">
          <p>Nos plats arrivent bientôt — découvrez le menu complet.</p>
        </div>
      ) : (
        <>
          {/* Plat héros */}
          <div className="sig__hero">
            <figure className="js-sig-hero sig__hero-media" style={{ margin: 0 }}>
              <img
                src={cldImg(hero.image, { width: 1200 })}
                alt={hero.name}
                loading="lazy"
                decoding="async"
              />
              <div className="sig__hero-scrim" aria-hidden="true" />
              <figcaption className="sig__hero-info">
                <div>
                  <p className="sig__hero-k">{CATEGORY_LABELS[hero.category] ?? 'Signature'}</p>
                  <h3 className="sig__hero-name">{hero.name}</h3>
                </div>
                <div className="sig__row-right">
                  <span className="sig__price">
                    {fcfa(hero.price)} <small>FCFA</small>
                  </span>
                  <button
                    className="sig__add"
                    onClick={() => handleAdd(hero)}
                    aria-label={`Ajouter ${hero.name} au panier`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </figcaption>
            </figure>
          </div>

          {/* Galerie horizontale */}
          {rest.length > 0 && (
            <div ref={viewportRef} className="sig__viewport">
              <div ref={trackRef} className="sig__track">
                {rest.map((p) => (
                  <article key={p.id} className="js-sig-tile sig__tile">
                    <div className="sig__tile-media">
                      <img
                        src={cldImg(p.image, { width: 480, height: 640 })}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="sig__tile-info">
                      <div>
                        <p className="sig__tile-k">{CATEGORY_LABELS[p.category] ?? 'Signature'}</p>
                        <h3 className="sig__tile-name">{p.name}</h3>
                        <span className="sig__tile-price">{fcfa(p.price)} FCFA</span>
                      </div>
                      <button
                        className="sig__add"
                        onClick={() => handleAdd(p)}
                        aria-label={`Ajouter ${p.name} au panier`}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
