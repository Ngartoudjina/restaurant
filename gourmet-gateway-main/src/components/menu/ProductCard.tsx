import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/pages/Menu';
import { cldImg, cldSrcSet } from '@/lib/image';
import '@/styles/braise-bronze.css';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  starter: 'Entrée',
  main: 'Plat principal',
  dessert: 'Dessert',
  drink: 'Boisson',
  side: 'Accompagnement',
};

const DIETARY_LABELS: Record<string, string> = {
  vegetarian: 'Végétarien',
  vegan: 'Végan',
  'gluten-free': 'Sans gluten',
  halal: 'Halal',
  spicy: 'Épicé',
  organic: 'Bio',
};

/** Carte plat — design system « Braise & Bronze ». */
export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });

    toast({
      title: '✨ Ajouté au panier !',
      description: `${product.name} a été ajouté à votre panier.`,
      duration: 2000,
    });
  };

  return (
    <article className="bbcard">
      {/* Photo */}
      <div
        className="bbcard__media"
        onClick={() => onViewDetails(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onViewDetails(product)}
        aria-label={`Voir les détails de ${product.name}`}
      >
        <img
          src={cldImg(product.image, { width: 600, height: 450 })}
          srcSet={cldSrcSet(product.image, 400)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={600}
          height={450}
          onError={(e) => {
            e.currentTarget.srcset = '';
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
          }}
        />

        <div className="bbcard__badges">
          <div className="bbcard__diet">
            {(product.dietary ?? []).slice(0, 2).map((diet) => (
              <span key={diet} className="bbcard__tag">
                {DIETARY_LABELS[diet] ?? diet}
              </span>
            ))}
          </div>
          {product.popular && <span className="bbcard__tag bbcard__tag--sig">✦ Signature</span>}
        </div>

        {!product.available && (
          <div className="bbcard__unavailable">
            <span className="bbcard__tag">Indisponible</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="bbcard__body">
        <p className="bbcard__k">{CATEGORY_LABELS[product.category] ?? product.category}</p>
        <h3 className="bbcard__name" onClick={() => onViewDetails(product)}>
          {product.name}
        </h3>
        <p className="bbcard__desc">{product.description}</p>

        <div className="bbcard__foot">
          <span className="bbcard__price">{product.price.toLocaleString('fr-FR')} FCFA</span>
          <button
            className="sig__add"
            onClick={handleAddToCart}
            disabled={!product.available}
            aria-label={`Ajouter ${product.name} au panier`}
            style={!product.available ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
