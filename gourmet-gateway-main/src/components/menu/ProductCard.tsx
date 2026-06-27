import { ShoppingCart, Eye, Star, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/pages/Menu';
import { cldImg, cldSrcSet } from '@/lib/image';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    };

    addItem(cartItem);

    toast({
      title: '✨ Ajouté au panier !',
      description: (
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>{product.name} a été ajouté à votre panier.</span>
        </div>
      ),
      duration: 2000,
    });
  };

  const getDietaryLabel = (diet: string): string => {
    const labels: Record<string, string> = {
      vegetarian: '🌱 Végétarien',
      vegan: '🥬 Végan',
      'gluten-free': '🌾 Sans gluten',
      halal: '☪️ Halal',
      spicy: '🌶️ Épicé',
      organic: '🌿 Bio',
    };
    return labels[diet] || diet;
  };

  return (
    <Card className="group relative overflow-hidden border-0 shadow-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 bg-card">
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gold/5 to-gold/10">
        {/* Image (optimisée Cloudinary : format + qualité + largeur adaptés) */}
        <img
          src={cldImg(product.image, { width: 600, height: 450 })}
          srcSet={cldSrcSet(product.image, 400)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px"
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={600}
          height={450}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.currentTarget.srcset = '';
            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
          {/* Dietary Badges */}
          {product.dietary && product.dietary.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {product.dietary.slice(0, 2).map((diet) => (
                <Badge
                  key={diet}
                  variant="secondary"
                  className="text-xs backdrop-blur-md bg-white/90 text-black border-0 shadow-sm"
                >
                  {getDietaryLabel(diet)}
                </Badge>
              ))}
              {product.dietary.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-xs backdrop-blur-md bg-white/90 text-black border-0 shadow-sm"
                >
                  +{product.dietary.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Popular Badge */}
          {product.popular && (
            <Badge className="bg-gradient-to-r from-gold to-gold-dark text-black border-0 shadow-lg backdrop-blur-sm flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Populaire
            </Badge>
          )}
        </div>

        {/* View Details Button - Appears on hover */}
        <button
          onClick={() => onViewDetails(product)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
          aria-label="Voir les détails"
        >
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-white hover:bg-gold rounded-full p-4 shadow-2xl transition-colors duration-300">
              <Eye className="h-6 w-6 text-black" />
            </div>
            <p className="text-white text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              Voir les détails
            </p>
          </div>
        </button>

        {/* Availability indicator */}
        {!product.available && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg py-2 px-4">
              Indisponible
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-5 space-y-3">
        {/* Category & Name */}
        <div>
          <p className="text-xs text-gold font-medium uppercase tracking-wider mb-1">
            {product.category === 'starter' && 'Entrée'}
            {product.category === 'main' && 'Plat Principal'}
            {product.category === 'dessert' && 'Dessert'}
            {product.category === 'drink' && 'Boisson'}
          </p>
          <h3
            className="font-serif text-xl font-bold text-foreground line-clamp-1 group-hover:text-gold transition-colors duration-300 cursor-pointer"
            onClick={() => onViewDetails(product)}
          >
            {product.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">Prix</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              {product.price.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-gold font-semibold -mt-1">FCFA</span>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!product.available}
            className="bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardContent>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-gold/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  );
}