import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/config/site';
import { cldImg } from '@/lib/image';
import '@/styles/braise-bronze.css';

const ORDER_TYPES = [
  {
    id: 'takeaway' as const,
    title: 'À emporter',
    desc: 'Récupérez votre commande au restaurant.',
    fee: 0,
  },
  {
    id: 'delivery' as const,
    title: 'Livraison',
    desc: 'Livré à votre adresse sous 45 minutes.',
    fee: 2000,
  },
  {
    id: 'dine-in' as const,
    title: 'Sur place',
    desc: 'Commandez et dînez au restaurant.',
    fee: 0,
  },
];

export default function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    promoCode,
    discount,
    applyPromoCode,
    removePromoCode,
  } = useCart();
  const { toast } = useToast();

  const [promoInput, setPromoInput] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway' | 'dine-in'>('takeaway');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 2000 : 0; // 2000 FCFA
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount + deliveryFee;

  const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

  const handleApplyPromo = () => {
    if (applyPromoCode(promoInput)) {
      toast({
        title: '🎉 Code promo appliqué !',
        description: 'Votre réduction a été prise en compte.',
      });
      setPromoInput('');
    } else {
      toast({
        title: 'Code invalide',
        description: "Ce code promo n'existe pas.",
        variant: 'destructive',
      });
    }
  };

  // Panier vide
  if (items.length === 0) {
    return (
      <Layout>
        <div className="mstate">
          <div>
            <div className="ok-mark" style={{ borderColor: 'var(--bb-hairline)', color: 'var(--bb-bronze)' }}>
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h1
              style={{
                fontFamily: 'var(--bb-display)',
                fontWeight: 600,
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                color: 'var(--bb-ivory)',
                margin: '0 0 0.8rem',
              }}
            >
              Votre panier est vide.
            </h1>
            <p style={{ maxWidth: '42ch', margin: '0 auto 2rem' }}>
              Découvrez notre carte et ajoutez vos plats préférés pour commencer votre expérience.
            </p>
            <Link to="/menu" className="bb-btn bb-btn--bronze">
              Découvrir le menu
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
            Votre panier
          </p>
          <h1 className="mhero__title">
            Le <em>plateau.</em>
          </h1>
          <p className="mhero__sub">
            {items.length} article{items.length > 1 ? 's' : ''} — vérifiez, ajustez, puis passez à
            table.
          </p>
        </div>
      </section>

      {/* Corps — le papier */}
      <section className="resv-body">
        <div className="resv-grid">
          {/* Articles + mode de commande */}
          <div>
            {items.map((item) => (
              <div key={item.productId} className="citem">
                <div className="citem__img">
                  <img
                    src={cldImg(item.image, { width: 180, height: 180 })}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                    }}
                  />
                </div>
                <div className="citem__main">
                  <div className="citem__row">
                    <h3 className="citem__name">{item.name}</h3>
                    <button
                      className="citem__del"
                      onClick={() => {
                        removeItem(item.productId);
                        toast({
                          title: 'Article retiré',
                          description: `${item.name} a été retiré du panier.`,
                        });
                      }}
                      aria-label={`Retirer ${item.name} du panier`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="citem__unit">{fcfa(item.price)} l'unité</span>
                  <div className="citem__row">
                    <span className="citem__qty">
                      <button
                        className="cstep"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        className="cstep"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </span>
                    <span className="citem__total">{fcfa(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Mode de commande */}
            <div className="rcard" style={{ marginTop: '1.6rem' }}>
              <div className="rcard__head">
                <div>
                  <h3>Mode de commande</h3>
                  <p>Comment souhaitez-vous savourer ?</p>
                </div>
              </div>
              <div className="otype" role="radiogroup" aria-label="Mode de commande">
                {ORDER_TYPES.map((t) => (
                  <label
                    key={t.id}
                    className={`otype__opt${orderType === t.id ? ' is-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value={t.id}
                      checked={orderType === t.id}
                      onChange={() => setOrderType(t.id)}
                    />
                    <span>
                      <span className="t">
                        {t.title}
                        {t.fee > 0 && <small>+{fcfa(t.fee)}</small>}
                      </span>
                      <p>{t.desc}</p>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <aside>
            <div className="rform bb-sticky">
              <div className="rform__head">
                <h2 className="rform__title">L'addition</h2>
              </div>

              {/* Code promo */}
              {promoCode ? (
                <div className="promo-chip">
                  <div>
                    <b>{promoCode}</b>
                    <br />
                    <span>-{discount}% de réduction</span>
                  </div>
                  <button
                    className="citem__del"
                    onClick={() => {
                      removePromoCode();
                      toast({
                        title: 'Code promo retiré',
                        description: 'La réduction a été supprimée.',
                      });
                    }}
                    aria-label="Retirer le code promo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <span className="rlabel">Code promo</span>
                  <div className="promo-row">
                    <input
                      className="rinput"
                      placeholder={`Ex : ${siteConfig.promo.code}`}
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    />
                    <button className="bb-btn news__btn bb-btn--sm" onClick={handleApplyPromo}>
                      Appliquer
                    </button>
                  </div>
                </div>
              )}

              {/* Totaux */}
              <div style={{ marginTop: '1.6rem' }}>
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

              {/* Actions */}
              <div style={{ display: 'grid', gap: '0.8rem', marginTop: '1.6rem' }}>
                <Link
                  to="/checkout"
                  state={{ orderType }}
                  className="bb-btn news__btn"
                  style={{ width: '100%' }}
                >
                  Passer commande
                </Link>
                <Link
                  to="/menu"
                  className="bb-btn"
                  style={{
                    width: '100%',
                    border: '1px solid var(--bb-hairline-ink)',
                    color: 'var(--bb-ink)',
                  }}
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
