import { X, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/pages/Menu';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function ProductModal({ product, open, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
    };

    addItem(cartItem);

    toast({
      title: 'Ajouté au panier !',
      description: `${quantity}x ${product.name} ajouté${quantity > 1 ? 's' : ''} à votre panier.`,
      duration: 2000,
    });

    // Réinitialiser et fermer
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative h-80 md:h-full rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
              }}
            />
          </div>

          {/* Détails */}
          <div className="flex flex-col">
            <h2 className="font-serif text-3xl font-bold mb-2">
              {product.name}
            </h2>

            {/* Badges diététiques */}
            {product.dietary && product.dietary.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.dietary.map(diet => (
                  <Badge key={diet} variant="outline">
                    {diet}
                  </Badge>
                ))}
                {product.popular && (
                  <Badge className="bg-gold text-black">
                    Populaire
                  </Badge>
                )}
              </div>
            )}

            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>

            {/* Ingrédients si disponibles */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Ingrédients :</h3>
                <p className="text-sm text-muted-foreground">
                  {product.ingredients.join(', ')}
                </p>
              </div>
            )}

            {/* Allergènes si disponibles */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-orange-600">Allergènes :</h3>
                <p className="text-sm text-muted-foreground">
                  {product.allergens.join(', ')}
                </p>
              </div>
            )}

            <div className="mt-auto">
              {/* Prix */}
              <div className="text-3xl font-bold text-gold mb-6">
                {product.price.toLocaleString('fr-FR')} FCFA
              </div>

              {/* Quantité */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium">Quantité :</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                <span className="font-semibold">Total :</span>
                <span className="text-2xl font-bold text-gold">
                  {(product.price * quantity).toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {/* Bouton ajouter */}
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gold hover:bg-gold-dark text-black py-6 text-lg font-semibold"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}