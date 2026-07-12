import { useEffect, useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { HeroCinematic } from '@/components/home/HeroCinematic';
import { PhilosophySection } from '@/components/home/PhilosophySection';
import { SignatureGallery } from '@/components/home/SignatureGallery';
import { TestimonialsVoice } from '@/components/home/TestimonialsVoice';
import { FinalCta } from '@/components/home/FinalCta';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interface Product alignée avec le backend
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  dietary: string[];
  available: boolean;
  popular?: boolean;
  createdAt?: Date;
}

export default function Index() {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { toast } = useToast();

  // Fetch popular products from backend
  const fetchPopularProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);

      // Récupérer tous les produits depuis le backend
      const response = await axios.get(`${API_URL}/api/products`);
      const raw = response.data?.data ?? response.data ?? [];

      // Normaliser les produits pour tolérer plusieurs formats (imageUrl, img, categoryId, price string...)
      const allProducts = Array.isArray(raw)
        ? raw.map((p) => {
            const obj = p as Record<string, unknown>;
            const get = (k: string) => obj[k];
            const id = (get('id') ?? get('_id') ?? get('productId'));
            const priceVal = get('price');
            const imageVal = get('image') ?? get('imageUrl') ?? get('img');
            const created = get('createdAt');

            return {
              id: typeof id === 'string' ? id : typeof id === 'number' ? String(id) : '',
              name: typeof get('name') === 'string' ? (get('name') as string) : typeof get('title') === 'string' ? (get('title') as string) : 'Plat',
              description: typeof get('description') === 'string' ? (get('description') as string) : typeof get('desc') === 'string' ? (get('desc') as string) : '',
              price: typeof priceVal === 'number' ? priceVal : Number(priceVal as unknown) || 0,
              category: typeof get('category') === 'string' ? (get('category') as string) : typeof get('categoryId') === 'string' ? (get('categoryId') as string) : 'main',
              image: typeof imageVal === 'string' ? (imageVal as string) : '',
              dietary: Array.isArray(get('dietary')) ? (get('dietary') as string[]) : [],
              available: typeof get('available') === 'boolean' ? (get('available') as boolean) : true,
              popular: !!get('popular'),
              createdAt: typeof created === 'string' ? new Date(created) : undefined,
            } as Product;
          })
        : [];

      // Filtrer les produits disponibles
      let products = allProducts.filter((p: Product) => p.available !== false);

      // Prioriser les produits marqués populaires si existants
      const popularOnly = products.filter((p) => (p as { popular?: unknown }).popular === true);
      if (popularOnly.length > 0) products = popularOnly;

      // Limiter à 6 produits et mettre à jour l'état
      setPopularProducts(products.slice(0, 6));
    } catch (error) {
      console.error('Erreur chargement produits populaires:', error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Impossible de charger les plats populaires'
        : 'Une erreur est survenue';

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPopularProducts();
  }, [fetchPopularProducts]);

  return (
    <Layout>
      {/* Hero cinématique — DA « Braise & Bronze », acte I (GSAP) */}
      <HeroCinematic />

      {/* Acte II — Philosophie, bascule vers « le papier » (GSAP) */}
      <PhilosophySection />

      {/* Acte III — Signatures : plat héros + galerie horizontale pinnée (GSAP) */}
      <SignatureGallery products={popularProducts} loading={loadingProducts} />

      {/* Acte IV — La voix des clients, retour au papier (GSAP) */}
      <TestimonialsVoice />

      {/* Newsletter / capture d'email avec code de bienvenue */}
      <NewsletterSignup />

      {/* Acte V — La porte : réservation ou WhatsApp (GSAP) */}
      <FinalCta />
    </Layout>
  );
}