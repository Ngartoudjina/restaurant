import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, ShoppingBag, Gift, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { siteConfig } from '@/config/site';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatFCFA = (amount: number) => `${Number(amount || 0).toLocaleString('fr-FR')} FCFA`;

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal?: number;
  discountAmount?: number;
  deliveryFee?: number;
  total: number;
  type: 'delivery' | 'takeaway' | 'dine-in';
  status: string;
  deliveryAddress?: { street: string; city: string; zipCode: string };
  scheduledFor?: number;
}

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { getToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = (await getToken()) || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Vous devez être connecté pour voir cette commande.');
        }

        const response = await axios.get(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data?.data ?? response.data;
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (cancelled) return;
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || 'Commande introuvable'
          : err instanceof Error
            ? err.message
            : 'Une erreur est survenue';
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId, getToken]);

  if (isLoading) {
    return (
      <Layout>
        <section className="py-20 min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gold" />
            <p className="text-muted-foreground">Chargement de votre commande...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <section className="py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Commande introuvable</h1>
          {error && <p className="text-muted-foreground mb-6">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
            <Link to="/orders">
              <Button>Mes commandes</Button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const estimatedTime = order.scheduledFor
    ? new Date(order.scheduledFor).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Commande confirmée !
            </h1>
            <p className="text-muted-foreground mb-2">
              Merci pour votre commande. Vous recevrez un email de confirmation.
            </p>
            <p className="text-lg font-medium text-primary mb-8">
              Commande #{order.id.slice(-6)}
            </p>

            {/* Order Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Estimation</p>
                    <p className="font-medium">
                      {order.type === 'delivery' ? 'Livraison' : 'Prêt'}
                      {estimatedTime ? ` vers ${estimatedTime}` : ''}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">
                      {order.type === 'delivery' ? 'Livraison' : order.type === 'takeaway' ? 'Retrait' : 'Sur place'}
                    </p>
                    <p className="font-medium">
                      {order.type === 'delivery'
                        ? order.deliveryAddress?.street
                        : siteConfig.contact.addressStreet}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Details */}
            <Card className="mb-8 text-left">
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Détails de la commande
                </h3>
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.productId} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        {formatFCFA(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  {(order.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Réduction</span>
                      <span>-{formatFCFA(order.discountAmount!)}</span>
                    </div>
                  )}
                  {(order.deliveryFee ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Livraison</span>
                      <span>{formatFCFA(order.deliveryFee!)}</span>
                    </div>
                  )}

                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatFCFA(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fidélité : incitation au réachat */}
            <Card className="mb-8 border-gold/30 bg-gold/5">
              <CardContent className="p-5 flex items-center gap-4 text-left">
                <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-semibold">Un cadeau pour votre prochaine visite</p>
                  <p className="text-sm text-muted-foreground">
                    Profitez de <span className="font-bold text-gold">{siteConfig.loyalty.percent}%</span> de réduction avec le code{' '}
                    <span className="font-bold tracking-wider text-gold">{siteConfig.loyalty.code}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="outline">Retour à l'accueil</Button>
              </Link>
              <Link to="/menu">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Commander à nouveau
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
