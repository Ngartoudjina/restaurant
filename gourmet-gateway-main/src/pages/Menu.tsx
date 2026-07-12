import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/menu/ProductCard';
import { ProductModal } from '@/components/menu/ProductModal';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(useGSAP);

// URL de votre backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  dietary: string[];
  available: boolean;
  popular?: boolean;
  allergens?: string[];
  ingredients?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface Category {
  id: string;
  name: string;
}

interface DietaryFilter {
  id: string;
  name: string;
}

export default function Menu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilter[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { toast } = useToast();
  const root = useRef<HTMLDivElement>(null);

  /* =======================
     FETCH DATA FROM BACKEND
     ======================= */

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer les produits depuis le backend
      const productsResponse = await axios.get(`${API_URL}/api/products`);
      const productsData = productsResponse.data.data || productsResponse.data;

      // Filtrer uniquement les produits disponibles
      const availableProducts = productsData.filter((p: Product) => p.available !== false);
      setProducts(availableProducts);

      // Extraire les catégories uniques des produits
      const uniqueCategories = Array.from(
        new Set(productsData.map((p: Product) => p.category))
      ).map((cat) => ({
        id: cat as string,
        name: getCategoryDisplayName(cat as string)
      }));

      setCategories([
        { id: 'all', name: 'Tous' },
        ...uniqueCategories
      ]);

      // Extraire les filtres diététiques uniques
      const allDietary = productsData.flatMap((p: Product) => p.dietary || []);
      const uniqueDietary = Array.from(new Set(allDietary)).map((diet) => ({
        id: diet as string,
        name: getDietaryDisplayName(diet as string)
      }));

      setDietaryFilters(uniqueDietary);

    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Impossible de charger les produits'
        : 'Une erreur est survenue';

      setError(errorMessage);

      toast({
        title: 'Erreur',
        description: 'Impossible de charger les produits. Vérifiez que le serveur est lancé.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fonction helper pour afficher les noms de catégories en français
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'starter': 'Entrées',
      'main': 'Plats principaux',
      'dessert': 'Desserts',
      'drink': 'Boissons',
      'side': 'Accompagnements',
    };
    return categoryNames[category] || category;
  };

  // Fonction helper pour afficher les noms de filtres diététiques
  const getDietaryDisplayName = (dietary: string): string => {
    const dietaryNames: Record<string, string> = {
      'vegetarian': 'Végétarien',
      'vegan': 'Végan',
      'gluten-free': 'Sans gluten',
      'halal': 'Halal',
      'spicy': 'Épicé',
      'organic': 'Bio',
    };
    return dietaryNames[dietary] || dietary;
  };

  /* =======================
     FILTER LOGIC
     ======================= */
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        (product.name && product.name.toLowerCase().includes(search.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const matchesDietary =
        selectedDietary.length === 0 ||
        selectedDietary.some(diet => product.dietary?.includes(diet));

      return matchesSearch && matchesCategory && matchesDietary;
    });
  }, [products, search, selectedCategory, selectedDietary]);

  const toggleDietary = (diet: string) => {
    setSelectedDietary(prev =>
      prev.includes(diet)
        ? prev.filter(d => d !== diet)
        : [...prev, diet]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedDietary([]);
  };

  const hasActiveFilters = Boolean(search) || selectedCategory !== 'all' || selectedDietary.length > 0;

  /* =======================
     ANIMATIONS (GSAP)
     ======================= */

  // Entrée de la page : titre masqué + filtres
  useGSAP(
    () => {
      if (isLoading || error) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('.js-m-line > span', { yPercent: 110, duration: 1, stagger: 0.1 })
          .from(
            '.js-m-fade',
            { y: 16, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 },
            '-=0.6'
          );
      });
    },
    { scope: root, dependencies: [isLoading, error] }
  );

  // Cartes : cascade à chaque changement de filtre
  useGSAP(
    () => {
      if (isLoading || error) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      gsap.fromTo(
        '.js-m-card',
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: { each: 0.045 }, overwrite: true }
      );
    },
    { scope: root, dependencies: [isLoading, error, selectedCategory, selectedDietary, search, products.length] }
  );

  /* =======================
     LOADING & ERROR STATES
     ======================= */
  if (isLoading) {
    return (
      <Layout>
        <div className="mstate" role="status">
          <div>
            <Loader2
              className="h-12 w-12 animate-spin"
              style={{ color: 'var(--bb-bronze)', margin: '0 auto 1rem' }}
            />
            <p>Préparation de la carte…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mstate">
          <div>
            <p style={{ marginBottom: '1.4rem' }}>{error}</p>
            <button onClick={fetchData} className="bb-btn bb-btn--bronze">
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div ref={root}>
        {/* En-tête de la carte */}
        <section className="mhero" aria-labelledby="menu-title">
          <div className="mhero__inner">
            <p className="js-m-fade philo__eyebrow" style={{ color: 'var(--bb-bronze)' }}>
              La carte
            </p>
            <h1 id="menu-title" className="mhero__title">
              <span className="js-m-line hero-line">
                <span>Notre menu</span>
              </span>
              <span className="js-m-line hero-line">
                <span>
                  <em>gastronomique.</em>
                </span>
              </span>
            </h1>
            <p className="js-m-fade mhero__sub">
              Explorez {products.length} plats savoureux, préparés avec passion et les meilleurs
              ingrédients du marché.
            </p>
            <p className="js-m-fade mhero__count">
              {filteredProducts.length} plat{filteredProducts.length > 1 ? 's' : ''} disponible
              {filteredProducts.length > 1 ? 's' : ''}
            </p>
          </div>
        </section>

        {/* Filtres */}
        <section className="js-m-fade mfilters" aria-label="Filtres du menu">
          <div className="mfilters__inner">
            <div className="mfilters__search">
              <Search className="h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un plat…"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                aria-label="Rechercher un plat"
              />
              {search && (
                <button className="mfilters__clear" onClick={() => setSearch('')} aria-label="Effacer la recherche">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mfilters__row">
              <span className="mfilters__label">Catégories</span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`bb-chip${selectedCategory === cat.id ? ' is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={selectedCategory === cat.id}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {dietaryFilters.length > 0 && (
              <div className="mfilters__row">
                <span className="mfilters__label">Régimes</span>
                {dietaryFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`bb-chip${selectedDietary.includes(filter.id) ? ' is-active' : ''}`}
                    onClick={() => toggleDietary(filter.id)}
                    aria-pressed={selectedDietary.includes(filter.id)}
                  >
                    {filter.name}
                  </button>
                ))}
                {hasActiveFilters && (
                  <button className="bb-chip" onClick={resetFilters}>
                    ✕ Réinitialiser
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Grille */}
        <section className="mgrid-wrap">
          {filteredProducts.length === 0 ? (
            <div className="mempty">
              <p style={{ fontSize: '2.4rem', marginBottom: '0.8rem' }} aria-hidden="true">
                🍽️
              </p>
              <p style={{ marginBottom: '1.6rem' }}>
                {products.length === 0
                  ? 'Aucun produit disponible pour le moment.'
                  : 'Aucun plat ne correspond à votre recherche.'}
              </p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="bb-btn bb-btn--bronze">
                  Voir tous les plats
                </button>
              )}
            </div>
          ) : (
            <div className="mgrid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="js-m-card">
                  <ProductCard product={product} onViewDetails={setSelectedProduct} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modale détail */}
        <ProductModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </Layout>
  );
}
