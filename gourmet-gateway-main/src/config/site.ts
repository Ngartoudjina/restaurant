/**
 * Configuration centrale du site — source unique de vérité.
 *
 * ⚠️ Les valeurs marquées « TODO » doivent être remplacées par les vraies
 * informations du restaurant avant la mise en production (adresse exacte,
 * liens réseaux sociaux, chiffres vérifiables).
 */

export const siteConfig = {
  name: 'Le Gourmet',
  legalName: 'Le Gourmet',
  tagline: 'Restaurant Gastronomique Béninois',
  shortDescription:
    'Cuisine gastronomique béninoise à Cotonou. Réservez votre table ou commandez en ligne, livraison rapide à domicile.',
  longDescription:
    "Le Gourmet sublime la cuisine béninoise dans une expérience gastronomique d'exception. " +
    'Produits frais et locaux, plats préparés avec passion, à savourer sur place ou livrés chez vous à Cotonou.',

  // URL publique du site (utilisée pour le SEO / Open Graph)
  url: 'https://le-gourmet.bj', // TODO: domaine de production réel

  // ── Coordonnées ────────────────────────────────────────────────
  contact: {
    // TODO: remplacer par l'adresse réelle du restaurant
    addressStreet: 'Carré 304, Quartier Ciné Concorde',
    addressCity: 'Cotonou',
    addressCountry: 'Bénin',
    get addressFull() {
      return `${this.addressStreet}, ${this.addressCity}, ${this.addressCountry}`;
    },
    // TODO: lien Google Maps réel
    mapUrl: 'https://maps.app.goo.gl/2QYrYXTmzjqNRbCv8',

    phoneDisplay: '+229 01 97 62 10 16',
    phoneLink: 'tel:+2290197621016',

    // Numéro WhatsApp au format international sans « + » ni espaces
    whatsapp: '2290197621016',
    whatsappDefaultMessage:
      'Bonjour Le Gourmet 👋, je souhaite passer une commande / réserver une table.',
  },

  // ── Horaires (affichage + schema.org) ──────────────────────────
  hours: [
    { day: 'Lun - Ven', time: '12h00 - 14h30 · 19h00 - 22h30' },
    { day: 'Sam - Dim', time: '12h00 - 15h00 · 19h00 - 23h00' },
  ],

  // ── Réseaux sociaux (laisser vide pour masquer l'icône) ────────
  social: {
    facebook: '', // TODO: URL réelle
    instagram: 'https://www.instagram.com/nodam597/', // TODO: URL réelle
    twitter: 'https://x.com/ABeingar84308', // TODO: URL réelle
  },

  // ── Offres / fidélité ──────────────────────────────────────────
  promo: {
    code: 'BIENVENUE10',
    percent: 10,
    label: '-10% sur votre première commande',
  },
  loyalty: {
    code: 'FIDELE20',
    percent: 20,
    label: '-20% pour nos clients fidèles',
  },

  // ── Arguments de confiance (honnêtes et vérifiables) ───────────
  // Remplacent les anciens faux indicateurs « 24/7 / 5/5 / 🔥 ».
  trust: [
    { value: 'Livraison', label: 'Rapide à Cotonou' },
    { value: 'Paiement', label: 'À la livraison' },
    { value: 'Réservation', label: 'En ligne en 2 min' },
  ],
} as const;

/** Construit l'URL WhatsApp (clic-to-chat) avec un message pré-rempli. */
export function whatsappUrl(message?: string): string {
  const text = encodeURIComponent(message ?? siteConfig.contact.whatsappDefaultMessage);
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${text}`;
}

export type SiteConfig = typeof siteConfig;
