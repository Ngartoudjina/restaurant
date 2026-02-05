import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, Package, Truck, Store, Sparkles, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    total,
    promoCode,
    discount,
    applyPromoCode,
    removePromoCode
  } = useCart();
  const { toast } = useToast();
  
  const [promoInput, setPromoInput] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway' | 'dine-in'>('takeaway');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 2000 : 0; // 2000 FCFA
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount + deliveryFee;

  const handleApplyPromo = () => {
    if (applyPromoCode(promoInput)) {
      toast({
        title: '🎉 Code promo appliqué !',
        description: `Vous bénéficiez de ${discount}% de réduction.`,
      });
      setPromoInput('');
    } else {
      toast({
        title: 'Code invalide',
        description: 'Ce code promo n\'existe pas.',
        variant: 'destructive',
      });
    }
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <Layout>
        <section className="py-20 min-h-[70vh] flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              {/* Animated Empty Icon */}
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center mx-auto animate-pulse">
                  <ShoppingBag className="h-16 w-16 text-gold/40" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-ping" style={{ animationDuration: '2s' }} />
              </div>

              <h1 className="font-serif text-4xl font-bold mb-4 text-foreground">
                Votre panier est vide
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Découvrez notre menu et ajoutez vos plats préférés pour commencer votre expérience gastronomique.
              </p>
              
              <Link to="/menu">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Package className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Découvrir le menu
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Votre Panier
            </h1>
            <p className="text-muted-foreground text-lg">
              {items.length} article{items.length > 1 ? 's' : ''} dans votre panier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item, index) => (
                <Card 
                  key={item.productId} 
                  className="group overflow-hidden border-0 shadow-card hover:shadow-elegant transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Image */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gradient-to-br from-gold/5 to-gold/10">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                            }}
                          />
                        </div>
                        {/* Quantity badge */}
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-gold to-gold-dark flex items-center justify-center text-black text-sm font-bold shadow-lg">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif font-bold text-xl text-foreground truncate group-hover:text-gold transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-gold font-bold text-lg mt-1">
                              {item.price.toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => {
                              removeItem(item.productId);
                              toast({
                                title: 'Article retiré',
                                description: `${item.name} a été retiré du panier.`,
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3 bg-muted rounded-full p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-gold hover:text-black transition-colors"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-bold text-lg">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-gold hover:text-black transition-colors"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-bold text-xl text-gold">
                              {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Order Type */}
              <Card className="border-0 shadow-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gold/5 to-gold/10">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Package className="h-5 w-5 text-gold" />
                    Mode de commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup
                    value={orderType}
                    onValueChange={(v) => setOrderType(v as typeof orderType)}
                    className="space-y-4"
                  >
                    {/* Takeaway */}
                    <div
                      className={`relative flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        orderType === 'takeaway'
                          ? 'border-gold bg-gold/5 shadow-md'
                          : 'border-border hover:border-gold/50 hover:bg-gold/5'
                      }`}
                    >
                      <RadioGroupItem value="takeaway" id="takeaway" className="mt-1" />
                      <Label htmlFor="takeaway" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-bold text-lg">À emporter</span>
                            {orderType === 'takeaway' && (
                              <Sparkles className="inline h-4 w-4 ml-2 text-gold" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground ml-13">
                          Récupérez votre commande au restaurant
                        </p>
                      </Label>
                    </div>

                    {/* Delivery */}
                    <div
                      className={`relative flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        orderType === 'delivery'
                          ? 'border-gold bg-gold/5 shadow-md'
                          : 'border-border hover:border-gold/50 hover:bg-gold/5'
                      }`}
                    >
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/10 to-green-600/10 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <span className="font-bold text-lg">Livraison</span>
                            <span className="text-gold font-semibold ml-2">(+2 000 FCFA)</span>
                            {orderType === 'delivery' && (
                              <Sparkles className="inline h-4 w-4 ml-2 text-gold" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground ml-13">
                          Livré à votre adresse sous 45 minutes
                        </p>
                      </Label>
                    </div>

                    {/* Dine-in */}
                    <div
                      className={`relative flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        orderType === 'dine-in'
                          ? 'border-gold bg-gold/5 shadow-md'
                          : 'border-border hover:border-gold/50 hover:bg-gold/5'
                      }`}
                    >
                      <RadioGroupItem value="dine-in" id="dine-in" className="mt-1" />
                      <Label htmlFor="dine-in" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center">
                            <Store className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <span className="font-bold text-lg">Sur place</span>
                            {orderType === 'dine-in' && (
                              <Sparkles className="inline h-4 w-4 ml-2 text-gold" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground ml-13">
                          Commandez et dînez au restaurant
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div>
              <Card className="sticky top-20 md:top-24 border-0 shadow-elegant overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-gold/10 via-gold/5 to-transparent pb-6">
                  <CardTitle className="text-2xl font-serif">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Promo Code Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gold" />
                      Code promo
                    </Label>
                    
                    {promoCode ? (
                      <div className="relative overflow-hidden p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border-2 border-green-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-green-700">{promoCode}</p>
                              <p className="text-sm text-green-600">-{discount}% de réduction</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removePromoCode();
                              toast({
                                title: 'Code promo retiré',
                                description: 'La réduction a été supprimée.',
                              });
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: BIENVENUE10"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                          className="border-gold/30 focus:border-gold"
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleApplyPromo}
                          className="border-gold text-gold hover:bg-gold hover:text-black font-semibold"
                        >
                          Appliquer
                        </Button>
                      </div>
                    )}
                    
                    {/* Promo hints */}
                    {!promoCode && (
                      <p className="text-xs text-muted-foreground italic">
                        💡 Codes disponibles : BIENVENUE10, FIDELE20, GOURMET15
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-semibold">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4" />
                          Réduction ({discount}%)
                        </span>
                        <span className="font-bold">-{discountAmount.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}
                    
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          Livraison
                        </span>
                        <span className="font-semibold">{deliveryFee.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-gold/20" />

                  {/* Final Total */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-gold/10 to-gold/5 border-2 border-gold/20">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <div className="text-right">
                        <p className="font-bold text-3xl bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                          {finalTotal.toLocaleString('fr-FR')}
                        </p>
                        <p className="text-sm text-gold font-semibold -mt-1">FCFA</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <Link to="/checkout" state={{ orderType }}>
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        Passer commande
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                    <Link to="/menu">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:border-gold font-semibold"
                      >
                        <Package className="h-5 w-5 mr-2" />
                        Continuer les achats
                      </Button>
                    </Link>
                  </div>

                  {/* Security badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    <span>Paiement sécurisé</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}