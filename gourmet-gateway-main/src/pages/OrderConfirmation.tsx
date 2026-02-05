import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, ShoppingBag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Order } from '@/lib/data';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('legourmet_orders') || '[]');
    const found = orders.find((o: Order) => o.id === orderId);
    setOrder(found || null);
  }, [orderId]);

  if (!order) {
    return (
      <Layout>
        <section className="py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Commande introuvable</h1>
          <Link to="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </section>
      </Layout>
    );
  }

  const estimatedTime = new Date(order.scheduledFor).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

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
                      {order.type === 'delivery' ? 'Livraison vers' : 'Prêt vers'} {estimatedTime}
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
                        : '25 Avenue des Champs-Élysées'}
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
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{order.total.toFixed(2)}€</span>
                  </div>
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
