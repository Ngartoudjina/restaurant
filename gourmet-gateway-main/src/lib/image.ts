/**
 * Optimisation des images Cloudinary à la livraison.
 *
 * Insère des transformations (`f_auto` = WebP/AVIF selon le navigateur,
 * `q_auto` = compression intelligente, largeur cible) dans l'URL afin de
 * servir une image bien plus légère que l'originale 1200×900.
 *
 * Les URLs non‑Cloudinary (ex. fallback Unsplash) sont renvoyées telles quelles.
 */
interface CldOptions {
  width?: number;
  height?: number;
  quality?: string; // 'auto' | 'auto:good' | '80' ...
}

export function cldImg(url?: string, opts: CldOptions = {}): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;

  const t = ['f_auto', `q_${opts.quality ?? 'auto'}`];
  if (opts.width) t.push(`w_${opts.width}`);
  if (opts.height) t.push(`h_${opts.height}`);
  if (opts.width || opts.height) t.push('c_fill');

  // Insère la transformation juste après le premier /upload/
  return url.replace('/upload/', `/upload/${t.join(',')}/`);
}

/** Construit un srcSet (densités 1x/2x) pour des images Cloudinary nettes et légères. */
export function cldSrcSet(url: string | undefined, width: number): string | undefined {
  if (!url || !url.includes('res.cloudinary.com')) return undefined;
  return `${cldImg(url, { width })} 1x, ${cldImg(url, { width: width * 2 })} 2x`;
}
