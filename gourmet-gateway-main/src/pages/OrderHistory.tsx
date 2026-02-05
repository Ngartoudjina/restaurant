import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingBag, Calendar, MapPin, Phone, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  type: 'delivery' | 'takeaway' | 'dine-in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress?: {
    street: string;
    city: string;
    zipCode: string;
  };
  scheduledFor: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  preparing: 'default',
  ready: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function OrderHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier si l'utilisateur a un token
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentification requise');
      }

      // Essayer de récupérer depuis l'API
      try {
        const response = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const ordersData = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];

        setOrders(ordersData);
      } catch (apiErr) {
        // Si l'API échoue, essayer localStorage en fallback
        console.warn('API indisponible, utilisation du localStorage', apiErr);
        const localOrders: Order[] = JSON.parse(localStorage.getItem('legourmet_orders') || '[]');
        const userOrders = localOrders.filter(o => o.userId === user?.id);
        setOrders(userOrders);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Impossible de charger vos commandes'
        : err instanceof Error ? err.message : 'Une erreur est survenue';

      setError(errorMessage);
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    fetchOrders();
  }, [user, navigate, fetchOrders]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      delivery: 'Livraison',
      takeaway: 'À emporter',
      'dine-in': 'Sur place',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="py-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gold" />
            <p className="text-muted-foreground">Chargement de vos commandes...</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="py-16 bg-black text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Historique des commandes
          </h1>
          <p className="text-secondary-foreground/70 max-w-2xl mx-auto">
            Consultez l'état de vos commandes et leurs détails.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Empty State */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-bold mb-2">Aucune commande</h2>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore passé de commande. Découvrez notre menu !
              </p>
              <Button
                onClick={() => navigate('/menu')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Voir le menu
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <CardHeader className="pb-4 bg-muted/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">Commande #{order.id.slice(-6)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={statusColors[order.status] || 'default'}
                        className="w-fit"
                      >
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  {/* Order Content */}
                  <CardContent className="pt-6">
                    {/* Order Info */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Type de commande</p>
                          <p className="text-sm text-muted-foreground">
                            {getOrderTypeLabel(order.type)}
                          </p>
                        </div>
                      </div>

                      {order.type === 'delivery' && order.deliveryAddress && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Adresse de livraison</p>
                            <p className="text-sm text-muted-foreground">
                              {order.deliveryAddress.street}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.deliveryAddress.zipCode} {order.deliveryAddress.city}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    {/* Items List */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Articles commandés</h3>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantité: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Order Total */}
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold">Total</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(order.total)}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      className="w-full mt-6"
                      onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    >
                      Voir les détails
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="border-destructive bg-destructive/10 mt-6">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchOrders}
                >
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
}
