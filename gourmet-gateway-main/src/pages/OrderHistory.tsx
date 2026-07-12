import { useState, useEffect, useCallback } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/braise-bronze.css';

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
  deliveryAddress?: { street: string; city: string; zipCode: string };
  scheduledFor: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const TYPE_LABELS: Record<string, string> = {
  delivery: 'Livraison',
  takeaway: 'À emporter',
  'dine-in': 'Sur place',
};

const fcfa = (n: number) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

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

      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentification requise');

      try {
        // Même base que le tunnel de commande (Checkout)
        const response = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const ordersData = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setOrders(ordersData);
      } catch (apiErr) {
        console.warn('API indisponible, fallback localStorage', apiErr);
        const localOrders: Order[] = JSON.parse(localStorage.getItem('legourmet_orders') || '[]');
        setOrders(localOrders.filter((o) => o.userId === user?.id));
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Impossible de charger vos commandes'
        : err instanceof Error
          ? err.message
          : 'Une erreur est survenue';
      setError(errorMessage);
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/orders' } } });
      return;
    }
    fetchOrders();
  }, [user, navigate, fetchOrders]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="mstate" role="status">
          <div>
            <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--bb-bronze)', margin: '0 auto 1rem' }} />
            <p>Chargement de vos commandes…</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* En-tête — la nuit */}
      <section className="mhero" style={{ paddingBottom: 'clamp(2rem, 5vh, 3rem)' }}>
        <div className="mhero__inner">
          <p className="philo__eyebrow" style={{ color: 'var(--bb-bronze)' }}>
            Historique
          </p>
          <h1 className="mhero__title">
            Vos <em>commandes.</em>
          </h1>
          <p className="mhero__sub">Retrouvez l'état et le détail de chacune de vos commandes.</p>
        </div>
      </section>

      {/* Corps — le papier */}
      <section className="resv-body">
        <div className="resv-grid" style={{ gridTemplateColumns: '1fr', maxWidth: 860, marginInline: 'auto' }}>
          {orders.length === 0 ? (
            <div className="rcard" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--bb-display)', fontSize: '1.5rem', margin: '0 0 0.6rem', color: 'var(--bb-ink)' }}>
                Aucune commande pour l'instant.
              </h2>
              <p className="txt" style={{ marginBottom: '1.6rem' }}>Découvrez notre carte et passez votre première commande.</p>
              <button onClick={() => navigate('/menu')} className="bb-btn news__btn">
                Voir le menu
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="rcard" style={{ margin: 0 }}>
                <div className="rcard__head" style={{ marginBottom: '1rem', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <h3>Commande #{order.id.slice(-6)}</h3>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="bb-chip is-active" style={{ cursor: 'default' }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '1rem' }}>
                  {order.items.map((item, i) => (
                    <div key={i} className="sumrow" style={{ padding: '0.2rem 0' }}>
                      <span>
                        {item.quantity}× {item.name}
                      </span>
                      <b>{fcfa(item.price * item.quantity)}</b>
                    </div>
                  ))}
                </div>

                {order.type === 'delivery' && order.deliveryAddress && (
                  <p className="txt" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.9rem' }}>
                    <MapPin className="h-4 w-4" style={{ color: 'var(--bb-bronze-ink)' }} />
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </p>
                )}

                <div className="sumtotal" style={{ marginTop: 0 }}>
                  <span className="lbl">{TYPE_LABELS[order.type] || order.type}</span>
                  <span className="val" style={{ fontSize: '1.4rem' }}>
                    {Number(order.total || 0).toLocaleString('fr-FR')} <small>FCFA</small>
                  </span>
                </div>
              </article>
            ))
          )}

          {error && orders.length === 0 && (
            <div className="rcard" style={{ margin: 0 }}>
              <p className="txt" style={{ color: 'var(--bb-ember)' }}>{error}</p>
              <button onClick={fetchOrders} className="bb-btn news__btn bb-btn--sm" style={{ marginTop: '1rem' }}>
                Réessayer
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
