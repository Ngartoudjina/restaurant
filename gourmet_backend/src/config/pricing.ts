// src/config/pricing.ts
// Source de vérité des règles tarifaires côté serveur.
// NE JAMAIS faire confiance aux prix / totaux envoyés par le client.

// Codes promo et pourcentage de réduction associé.
export const PROMO_CODES: Record<string, number> = {
  BIENVENUE10: 10,
  FIDELE20: 20,
  GOURMET15: 15,
};

// Frais de livraison fixes (FCFA).
export const DELIVERY_FEE = 2000;

/** Retourne le pourcentage de remise d'un code promo (0 si invalide). */
export function getDiscountPercent(code?: unknown): number {
  if (typeof code !== 'string') return 0;
  return PROMO_CODES[code.trim().toUpperCase()] ?? 0;
}
