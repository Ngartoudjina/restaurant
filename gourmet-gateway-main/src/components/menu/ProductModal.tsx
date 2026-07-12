import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/pages/Menu';
import { cldImg } from '@/lib/image';
import '@/styles/braise-bronze.css';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  starter: 'Entrée',
  main: 'Plat principal',
  dessert: 'Dessert',
  drink: 'Boisson',
  side: 'Accompagnement',
};

/** Modale plat — design system « Braise & Bronze ». */
export function ProductModal({ product, open, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    });

    toast({
      title: '✨ Ajouté au panier !',
      description: `${quantity}x ${product.name} ajouté${quantity > 1 ? 's' : ''} à votre panier.`,
      duration: 2000,
    });

    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--bb-surface)',
          borderColor: 'var(--bb-hairline)',
          color: 'var(--bb-ivory)',
          borderRadius: 4,
        }}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Photo */}
          <div className="pmodal__media">
            <img
              src={cldImg(product.image, { width: 800 })}
              alt={product.name}
              decoding="async"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
              }}
            />
          </div>

          {/* Détails */}
          <div className="flex flex-col">
            <p className="pmodal__k">
              {CATEGORY_LABELS[product.category] ?? product.category}
              {product.popular && <span style={{ marginLeft: '0.8rem' }}>✦ Signature</span>}
            </p>
            <h2 className="pmodal__name">{product.name}</h2>

            <p className="pmodal__desc">{product.description}</p>

            {product.ingredients && product.ingredients.length > 0 && (
              <div className="pmodal__list">
                <h4>Ingrédients</h4>
                <p>{product.ingredients.join(', ')}</p>
              </div>
            )}

            {product.allergens && product.allergens.length > 0 && (
              <div className="pmodal__list">
                <h4 style={{ color: 'var(--bb-ember)' }}>Allergènes</h4>
                <p>{product.allergens.join(', ')}</p>
              </div>
            )}

            <div style={{ marginTop: 'auto' }}>
              {/* Quantité */}
              <div className="pmodal__qty">
                <span
                  style={{
                    fontSize: '0.66rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--bb-ivory-mute)',
                  }}
                >
                  Quantité
                </span>
                <button
                  className="pmodal__step"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <b>{quantity}</b>
                <button
                  className="pmodal__step"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Total */}
              <div className="pmodal__total">
                <span
                  style={{
                    fontSize: '0.66rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--bb-ivory-mute)',
                  }}
                >
                  Total
                </span>
                <span className="sig__price">
                  {(product.price * quantity).toLocaleString('fr-FR')} <small>FCFA</small>
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="bb-btn bb-btn--bronze"
                style={{ width: '100%' }}
              >
                <ShoppingCart className="h-5 w-5" />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
