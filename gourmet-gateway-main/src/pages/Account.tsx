import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, ShoppingBag, Calendar, Settings, LogOut } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Order, Reservation } from '@/lib/data';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import '@/styles/braise-bronze.css';

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type TabId = 'profile' | 'orders' | 'reservations' | 'settings';

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'orders', label: 'Commandes', icon: ShoppingBag },
  { id: 'reservations', label: 'Réservations', icon: Calendar },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function Account() {
  const { user, isLoading, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<TabId>('profile');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      });

      const allOrders: Order[] = JSON.parse(localStorage.getItem('legourmet_orders') || '[]');
      setOrders(allOrders.filter((o) => o.userId === user.id).reverse());

      const allReservations: Reservation[] = JSON.parse(
        localStorage.getItem('legourmet_reservations') || '[]'
      );
      setReservations(
        allReservations.filter((r) => r.userId === user.id || r.email === user.email).reverse()
      );
    }
  }, [user, form]);

  if (isLoading) {
    return (
      <Layout>
        <div className="mstate">
          <p>Chargement…</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: '/account' } }} />;
  }

  const onSubmit = (data: ProfileFormData) => {
    updateUser(data);
    toast({ title: 'Profil mis à jour', description: 'Vos informations ont été sauvegardées.' });
  };

  const fcfa = (n: number) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

  return (
    <Layout>
      {/* En-tête — la nuit */}
      <section className="mhero" style={{ paddingBottom: 'clamp(2rem, 5vh, 3rem)' }}>
        <div className="mhero__inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p className="philo__eyebrow" style={{ color: 'var(--bb-bronze)' }}>
              Bonjour {user.firstName}
            </p>
            <h1 className="mhero__title">
              Mon <em>compte.</em>
            </h1>
          </div>
          <button onClick={logout} className="bb-btn bb-btn--hairline bb-btn--sm">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </section>

      {/* Corps — le papier */}
      <section className="resv-body">
        <div className="resv-grid" style={{ gridTemplateColumns: '1fr', maxWidth: 820, marginInline: 'auto' }}>
          <div className="rform">
            {/* Onglets */}
            <div className="acct-tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`acct-tab${tab === t.id ? ' is-active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Profil */}
            {tab === 'profile' && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1.4rem' }}>
                  <div className="grid2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <span className="rlabel">Prénom</span>
                          <FormControl>
                            <input className="rinput" {...field} />
                          </FormControl>
                          <FormMessage className="rerror" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <span className="rlabel">Nom</span>
                          <FormControl>
                            <input className="rinput" {...field} />
                          </FormControl>
                          <FormMessage className="rerror" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <span className="rlabel">Email</span>
                        <FormControl>
                          <input type="email" className="rinput" {...field} />
                        </FormControl>
                        <FormMessage className="rerror" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <span className="rlabel">Téléphone</span>
                        <FormControl>
                          <input className="rinput" {...field} />
                        </FormControl>
                        <FormMessage className="rerror" />
                      </FormItem>
                    )}
                  />
                  <button type="submit" className="bb-btn news__btn" style={{ justifySelf: 'start' }}>
                    Sauvegarder
                  </button>
                </form>
              </Form>
            )}

            {/* Commandes */}
            {tab === 'orders' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {orders.length === 0 ? (
                  <p className="txt" style={{ textAlign: 'center', padding: '2rem 0' }}>
                    Aucune commande pour le moment.
                  </p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} style={{ border: '1px solid var(--bb-hairline-ink)', borderRadius: 4, padding: '1rem 1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.7rem' }}>
                        <div>
                          <p style={{ fontFamily: 'var(--bb-display)', fontWeight: 600, margin: 0, color: 'var(--bb-ink)' }}>
                            Commande #{order.id.slice(-6)}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--bb-ink-mute)', margin: '0.2rem 0 0' }}>
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <span className="acct-status">{STATUS_LABELS[order.status]}</span>
                      </div>
                      <div style={{ display: 'grid', gap: '0.2rem', marginBottom: '0.6rem' }}>
                        {order.items.map((item) => (
                          <p key={item.productId} style={{ fontSize: '0.85rem', color: 'var(--bb-ink-soft)', margin: 0 }}>
                            {item.quantity}× {item.name}
                          </p>
                        ))}
                      </div>
                      <div className="sumrow" style={{ borderTop: '1px solid var(--bb-hairline-ink)', paddingTop: '0.6rem' }}>
                        <span>
                          {order.type === 'delivery' ? 'Livraison' : order.type === 'takeaway' ? 'À emporter' : 'Sur place'}
                        </span>
                        <b style={{ color: 'var(--bb-bronze-ink)' }}>{fcfa(order.total)}</b>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Réservations */}
            {tab === 'reservations' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {reservations.length === 0 ? (
                  <p className="txt" style={{ textAlign: 'center', padding: '2rem 0' }}>
                    Aucune réservation pour le moment.
                  </p>
                ) : (
                  reservations.map((res) => (
                    <div key={res.id} style={{ border: '1px solid var(--bb-hairline-ink)', borderRadius: 4, padding: '1rem 1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div>
                          <p style={{ fontFamily: 'var(--bb-display)', fontWeight: 600, margin: 0, color: 'var(--bb-ink)' }}>
                            {new Date(res.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--bb-ink-soft)', margin: '0.2rem 0 0' }}>
                            {res.time} · {res.guests} personne{res.guests > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className={`acct-status${res.status === 'confirmed' ? ' ok' : res.status === 'cancelled' ? ' no' : ''}`}>
                          {res.status === 'confirmed' ? 'Confirmée' : res.status === 'cancelled' ? 'Annulée' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Paramètres */}
            {tab === 'settings' && (
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                <p className="txt">Gérez vos préférences et la sécurité de votre compte.</p>
                <button onClick={logout} className="bb-btn bb-btn--hairline" style={{ justifySelf: 'start', color: 'var(--bb-ember)', borderColor: 'rgba(178,76,34,0.4)' }}>
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
