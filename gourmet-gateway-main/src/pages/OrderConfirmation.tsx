import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Gift, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { siteConfig } from '@/config/site';
import '@/styles/braise-bronze.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fcfa = (amount: number) => `${Number(amount || 0).toLocaleString('fr-FR')} FCFA`;

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
        <div className="mstate" role="status">
          <div>
            <Loader2
              className="h-12 w-12 animate-spin"
              style={{ color: 'var(--bb-bronze)', margin: '0 auto 1rem' }}
            />
            <p>Chargement de votre commande…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="mstate">
          <div>
            <h1
              style={{
                fontFamily: 'var(--bb-display)',
                fontWeight: 600,
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                color: 'var(--bb-ivory)',
                margin: '0 0 0.8rem',
              }}
            >
              Commande introuvable.
            </h1>
            {error && <p style={{ margin: '0 0 2rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.9rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/orders" className="bb-btn bb-btn--bronze">
                Mes commandes
              </Link>
              <Link to="/" className="bb-btn bb-btn--hairline">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const estimatedTime = order.scheduledFor
    ? new Date(order.scheduledFor).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const itemsSubtotal =
    order.subtotal ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Layout>
      {/* Le reçu — le papier */}
      <section className="resv-body" style={{ paddingTop: 'clamp(4rem, 10vh, 6rem)' }}>
        <div
          className="resv-grid"
          style={{ gridTemplateColumns: '1fr', maxWidth: 760, marginInline: 'auto' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="ok-mark">
              <CheckCircle className="h-9 w-9" />
            </div>
            <p className="philo__eyebrow" style={{ justifyContent: 'center' }}>
              Commande #{order.id.slice(-6)}
            </p>
            <h1
              style={{
                fontFamily: 'var(--bb-display)',
                fontWeight: 600,
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                lineHeight: 1,
                margin: '0 0 1rem',
              }}
            >
              C'est <em style={{ color: 'var(--bb-bronze-ink)' }}>en cuisine.</em>
            </h1>
            <p style={{ color: 'var(--bb-ink-soft)', margin: '0 auto 2.4rem', maxWidth: '46ch' }}>
              Merci pour votre commande. Vous recevrez une confirmation — et nous, on allume le feu.
            </p>
          </div>

          {/* Infos pratiques */}
          <div className="grid2" style={{ display: 'grid', gap: '1rem' }}>
            <div className="rcard" style={{ margin: 0 }}>
              <div className="rcard__head" style={{ marginBottom: 0 }}>
                <span className="rcard__ico">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3>Estimation</h3>
                  <p>
                    {order.type === 'delivery' ? 'Livraison' : 'Prêt'}
                    {estimatedTime ? ` vers ${estimatedTime}` : ' bientôt'}
                  </p>
                </div>
              </div>
            </div>
            <div className="rcard" style={{ margin: 0 }}>
              <div className="rcard__head" style={{ marginBottom: 0 }}>
                <span className="rcard__ico">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3>
                    {order.type === 'delivery'
                      ? 'Livraison'
                      : order.type === 'takeaway'
                        ? 'Retrait'
                        : 'Sur place'}
                  </h3>
                  <p>
                    {order.type === 'delivery'
                      ? order.deliveryAddress?.street
                      : siteConfig.contact.addressStreet}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Détail */}
          <div className="rform">
            <div className="rform__head">
              <h2 className="rform__title">Le reçu</h2>
            </div>
            {order.items.map((item) => (
              <div key={item.productId} className="sumrow">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <b>{fcfa(item.price * item.quantity)}</b>
              </div>
            ))}
            <div
              style={{ borderTop: '1px solid var(--bb-hairline-ink)', marginTop: '0.8rem', paddingTop: '0.8rem' }}
            >
              <div className="sumrow">
                <span>Sous-total</span>
                <b>{fcfa(itemsSubtotal)}</b>
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div className="sumrow green">
                  <span>Réduction</span>
                  <b>-{fcfa(order.discountAmount!)}</b>
                </div>
              )}
              {(order.deliveryFee ?? 0) > 0 && (
                <div className="sumrow">
                  <span>Livraison</span>
                  <b>{fcfa(order.deliveryFee!)}</b>
                </div>
              )}
              <div className="sumtotal">
                <span className="lbl">Total</span>
                <span className="val">
                  {Number(order.total || 0).toLocaleString('fr-FR')} <small>FCFA</small>
                </span>
              </div>
            </div>
          </div>

          {/* Fidélité : incitation au réachat */}
          <div className="promo-chip">
            <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
              <Gift className="h-5 w-5" style={{ color: 'var(--bb-bronze-ink)', flexShrink: 0 }} />
              <div>
                <span style={{ color: 'var(--bb-ink)', fontWeight: 600 }}>
                  Un cadeau pour votre prochaine visite
                </span>
                <br />
                <span>
                  -{siteConfig.loyalty.percent}% avec le code <b>{siteConfig.loyalty.code}</b>
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.9rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" className="bb-btn news__btn">
              Commander à nouveau
            </Link>
            <Link
              to="/"
              className="bb-btn"
              style={{ border: '1px solid var(--bb-hairline-ink)', color: 'var(--bb-ink)' }}
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
