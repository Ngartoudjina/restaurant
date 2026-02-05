import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/menu/ProductCard';
import { ProductModal } from '@/components/menu/ProductModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// URL de votre backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const filterButtonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

const productGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // Changé de imageUrl à image (comme dans votre backend)
  category: string; // Changé de categoryId à category
  dietary: string[];
  available: boolean;
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

  /* =======================
     FETCH DATA FROM BACKEND
     ======================= */
  
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer les produits depuis le backend
      const productsResponse = await axios.get(`${API_URL}/products`);
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

  /* =======================
     LOADING & ERROR STATES
     ======================= */
  if (isLoading) {
    return (
      <Layout>
        <section className="py-20 min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2b1b04] to-[#3a2406]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Loader2 className="h-16 w-16 text-gold mb-6" />
            </motion.div>
            <motion.p
              className="text-secondary-foreground/80 text-lg font-medium"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Préparation du menu...
            </motion.p>
          </motion.div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-20 min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2b1b04] to-[#3a2406]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-destructive mb-6 text-lg">{error}</p>
            <Button
              onClick={fetchData}
              className="bg-gold hover:bg-gold/90 text-[#2b1b04] font-semibold"
            >
              Réessayer
            </Button>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HERO HEADER */}
        <motion.section
        className="relative py-20 sm:py-28 lg:py-32 bg-gradient-to-br from-[#2b1b04] via-[#3a2406] to-[#2b1b04] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Background Elements */}
        <motion.div
          className="absolute inset-0 opacity-40"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.15) 0%, transparent 50%)',
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['100% 100%', '0% 0%'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 80%, rgba(253, 185, 19, 0.1) 0%, transparent 50%)',
          }}
        />

        <motion.div
          className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-block text-[#D97706] font-semibold text-sm sm:text-base mb-4 bg-gradient-to-r from-[#2b2b2b]/5 to-[#D97706]/8 px-4 py-2 rounded-full border border-[#D97706]/20">
              ✨ Nos Spécialités
            </span>
          </motion.div>

          <motion.h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Notre Menu Gastronomique
          </motion.h1>

          <motion.p
            className="text-secondary-foreground/70 text-base sm:text-lg max-w-3xl mx-auto mb-8"
            variants={itemVariants}
          >
            Explorez {products.length} plats savoureux, préparés avec passion et les meilleurs ingrédients. Une expérience culinaire qui ravira vos sens.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-transparent to-[#D97706]/8 border border-[#D97706]/20 text-[#D97706] font-medium text-sm shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#D97706]" />
              {filteredProducts.length} plat{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FILTERS SECTION */}
      <motion.section
        className="sticky top-16 z-40 py-6 sm:py-8 bg-gradient-to-b from-[#2b1b04] via-[#3a2406] to-[#2b1b04] backdrop-blur-sm border-b border-[#D97706]/10 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* SEARCH */}
            <motion.div
              className="relative flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gold/50" />
              <Input
                type="text"
                placeholder="Rechercher un plat..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                className="pl-12 py-3 bg-[#2b1b04]/70 border-[#D97706]/20 hover:border-[#D97706]/40 focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]/60 transition-colors text-secondary-foreground placeholder:text-secondary-foreground/40"
              />
              {search && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-foreground/40 hover:text-secondary-foreground/80 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              )}
            </motion.div>

            {/* ACTIVE FILTERS INDICATOR */}
            <AnimatePresence>
              {(search || selectedCategory !== 'all' || selectedDietary.length > 0) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                    setSelectedDietary([]);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-transparent to-[#D97706]/8 hover:to-[#D97706]/16 border border-[#D97706]/20 rounded-lg text-[#D97706] font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <X className="h-4 w-4" />
                  Réinitialiser
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* FILTER BUTTONS */}
          <motion.div
            className="mt-6 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {/* CATEGORIES */}
            <div>
              <p className="text-secondary-foreground/60 text-sm font-medium mb-3">Catégories</p>
              <motion.div
                className="flex flex-wrap gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {categories.map((cat, idx) => (
                    <motion.button
                      key={cat.id}
                      variants={filterButtonVariants}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300',
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-900 shadow-2xl shadow-[#D97706]/30'
                          : 'bg-[#2b1b04]/60 border border-[#D97706]/20 text-secondary-foreground hover:border-[#D97706]/40 hover:bg-[#3a2406]/40'
                      )}
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* DIETARY FILTERS */}
            {dietaryFilters.length > 0 && (
              <div>
                <p className="text-secondary-foreground/60 text-sm font-medium mb-3">Filtres diététiques</p>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence mode="popLayout">
                    {dietaryFilters.map((filter) => (
                      <motion.button
                        key={filter.id}
                        variants={filterButtonVariants}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDietary(filter.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300',
                          selectedDietary.includes(filter.id)
                            ? 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-slate-900 shadow-2xl shadow-[#F59E0B]/30'
                            : 'bg-[#2b1b04]/60 border border-[#F59E0B]/20 text-secondary-foreground hover:border-[#F59E0B]/40 hover:bg-[#3a2406]/40'
                        )}
                      >
                        {filter.name}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* PRODUCTS GRID */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#2b1b04] via-[#3a2406]/50 to-[#2b1b04]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-6"
              >
                <div className="text-6xl mb-4">🍽️</div>
              </motion.div>
              <p className="text-secondary-foreground/70 text-lg mb-6">
                {products.length === 0
                  ? 'Aucun produit disponible pour le moment.'
                  : 'Aucun plat ne correspond à votre recherche.'}
              </p>
              {search || selectedCategory !== 'all' || selectedDietary.length > 0 ? (
                <Button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                    setSelectedDietary([]);
                  }}
                  className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:from-[#C16207] text-slate-900 font-semibold shadow-lg px-5 py-3 rounded-lg"
                >
                  Voir tous les plats
                </Button>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              variants={productGridVariants}
              initial="hidden"
              animate="visible"
              key={`${selectedCategory}-${selectedDietary.join(',')}-${search}`}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    variants={itemVariants}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-xl p-1 bg-transparent hover:shadow-2xl hover:shadow-[#D97706]/20 transition-shadow transform-gpu will-change-transform"
                  >
                    <div className="rounded-lg overflow-hidden bg-gradient-to-br from-slate-900/40 to-transparent p-1">
                      <div className="rounded-lg overflow-hidden bg-card">
                        <ProductCard
                          product={product}
                          onViewDetails={setSelectedProduct}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* PRODUCT MODAL */}
      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </Layout>
  );
}