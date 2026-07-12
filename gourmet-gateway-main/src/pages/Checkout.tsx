import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CreditCard, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
import axios from 'axios';
import '@/styles/braise-bronze.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Téléphone invalide'),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  cardNumber: z.string().min(16, 'Numéro de carte invalide'),
  cardExpiry: z.string().min(5, "Date d'expiration invalide"),
  cardCvc: z.string().min(3, 'CVC invalide'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, discount, promoCode, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const orderType = (location.state?.orderType as 'delivery' | 'takeaway' | 'dine-in') || 'takeaway';
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 2000 : 0; // 2000 FCFA
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount + deliveryFee;

  const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.addresses?.[0]?.street || '',
      city: user?.addresses?.[0]?.city || '',
      zipCode: user?.addresses?.[0]?.zipCode || '',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour passer commande',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    setIsProcessing(true);

    try {
      // Simuler le traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Créer la commande via l'API
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: finalTotal, // indicatif — le serveur recalcule le total faisant foi
        type: orderType,
        ...(promoCode && { promoCode }),
        ...(orderType === 'delivery' && {
          deliveryAddress: {
            street: data.address || '',
            city: data.city || '',
            zipCode: data.zipCode || '',
          },
        }),
        scheduledFor: Date.now() + 3600000, // +1 heure
      };

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const orderId = response.data.id;

      // Vider le panier
      clearCart();

      toast({
        title: 'Commande confirmée !',
        description: `Votre commande #${orderId.slice(-6)} a été enregistrée.`,
      });

      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Erreur création commande:', error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || 'Impossible de créer la commande'
        : 'Une erreur est survenue';

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
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
              Panier vide.
            </h1>
            <p style={{ margin: '0 0 2rem' }}>Ajoutez des articles avant de passer commande.</p>
            <Link to="/menu" className="bb-btn bb-btn--bronze">
              Voir le menu
            </Link>
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
            Dernière étape
          </p>
          <h1 className="mhero__title">
            Passer <em>à table.</em>
          </h1>
          <p className="mhero__sub">
            {orderType === 'delivery' && 'Livraison à domicile — on arrive vite.'}
            {orderType === 'takeaway' && 'Retrait au restaurant — ce sera prêt.'}
            {orderType === 'dine-in' && 'Sur place — votre table vous attend.'}
          </p>
        </div>
      </section>

      {/* Corps — le papier */}
      <section className="resv-body">
        <div className="resv-grid">
          {/* Formulaire */}
          <div className="rform">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: '2rem' }}>
                {/* Contact */}
                <div>
                  <div className="rform__head">
                    <h2 className="rform__title">Vos coordonnées</h2>
                  </div>
                  <div style={{ display: 'grid', gap: '1.4rem' }}>
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
                    <div className="grid2">
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
                    </div>
                  </div>
                </div>

                {/* Adresse de livraison */}
                {orderType === 'delivery' && (
                  <div>
                    <div className="rform__head">
                      <h2 className="rform__title">Adresse de livraison</h2>
                    </div>
                    <div style={{ display: 'grid', gap: '1.4rem' }}>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <span className="rlabel">Adresse</span>
                            <FormControl>
                              <input className="rinput" placeholder="Carré, rue, repère…" {...field} />
                            </FormControl>
                            <FormMessage className="rerror" />
                          </FormItem>
                        )}
                      />
                      <div className="grid2">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <span className="rlabel">Ville</span>
                              <FormControl>
                                <input className="rinput" placeholder="Cotonou" {...field} />
                              </FormControl>
                              <FormMessage className="rerror" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <span className="rlabel">Code postal</span>
                              <FormControl>
                                <input className="rinput" placeholder="00229" {...field} />
                              </FormControl>
                              <FormMessage className="rerror" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Paiement */}
                <div>
                  <div className="rform__head">
                    <h2 className="rform__title" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CreditCard className="h-5 w-5" style={{ color: 'var(--bb-bronze-ink)' }} />
                      Paiement
                    </h2>
                    <span className="rform__note">Simulation — aucun débit réel</span>
                  </div>
                  <div style={{ display: 'grid', gap: '1.4rem' }}>
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <span className="rlabel">Numéro de carte</span>
                          <FormControl>
                            <input className="rinput" placeholder="4242 4242 4242 4242" {...field} />
                          </FormControl>
                          <FormMessage className="rerror" />
                        </FormItem>
                      )}
                    />
                    <div className="grid2">
                      <FormField
                        control={form.control}
                        name="cardExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <span className="rlabel">Expiration</span>
                            <FormControl>
                              <input className="rinput" placeholder="MM/AA" {...field} />
                            </FormControl>
                            <FormMessage className="rerror" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cardCvc"
                        render={({ field }) => (
                          <FormItem>
                            <span className="rlabel">CVC</span>
                            <FormControl>
                              <input className="rinput" placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage className="rerror" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bb-btn news__btn"
                  style={{ width: '100%' }}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Traitement en cours…
                    </>
                  ) : (
                    `Payer ${fcfa(finalTotal)}`
                  )}
                </button>
              </form>
            </Form>
          </div>

          {/* Récapitulatif */}
          <aside>
            <div className="rform bb-sticky">
              <div className="rform__head">
                <h2 className="rform__title">Votre commande</h2>
              </div>

              <div>
                {items.map((item) => (
                  <div key={item.productId} className="sumrow">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <b>{fcfa(item.price * item.quantity)}</b>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--bb-hairline-ink)', marginTop: '0.8rem', paddingTop: '0.8rem' }}>
                <div className="sumrow">
                  <span>Sous-total</span>
                  <b>{fcfa(subtotal)}</b>
                </div>
                {discount > 0 && (
                  <div className="sumrow green">
                    <span>Réduction ({discount}%)</span>
                    <b>-{fcfa(discountAmount)}</b>
                  </div>
                )}
                {orderType === 'delivery' && (
                  <div className="sumrow">
                    <span>Livraison</span>
                    <b>{fcfa(deliveryFee)}</b>
                  </div>
                )}
                <div className="sumtotal">
                  <span className="lbl">Total</span>
                  <span className="val">
                    {finalTotal.toLocaleString('fr-FR')} <small>FCFA</small>
                  </span>
                </div>
              </div>

              <p className="rform__note" style={{ display: 'block', marginTop: '1.2rem' }}>
                {orderType === 'delivery' && '🛵 Livraison à domicile'}
                {orderType === 'takeaway' && '🛍️ Retrait au restaurant'}
                {orderType === 'dine-in' && '🍽️ Sur place'}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
