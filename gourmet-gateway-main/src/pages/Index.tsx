import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, Award, Leaf, Clock, ChevronRight, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/menu/ProductCard';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import heroImage from '@/assets/hero-restaurant.jpg';
import { mockReviews } from '@/lib/data';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Variants d'animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    transition: { duration: 4, repeat: Infinity }
  }
};

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
      const response = await axios.get(`${API_URL}/products`);
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
      {/* Hero Section - Ultra Modern */}
      <section className="relative h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image avec Overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Restaurant interior"
            className="w-full h-full object-cover"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Animated Background Elements */}
          <motion.div
            className="absolute top-20 right-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-40 left-20 w-96 h-96 bg-gold/5 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <motion.div 
          className="relative z-10 container mx-auto px-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full mb-6 border border-gold/30 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-gold font-medium tracking-wider uppercase text-sm">
              Restaurant Gastronomique
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
              Le Gourmet
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Une expérience culinaire d'exception où chaque plat raconte une histoire de <span className="text-gold font-semibold">passion</span>, de <span className="text-gold font-semibold">tradition</span> et d'<span className="text-gold font-semibold">innovation</span>
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/reservation">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-gold to-yellow-300 text-black hover:from-yellow-300 hover:to-gold font-semibold text-base px-8 h-12 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Réserver une table
                </Button>
              </motion.div>
            </Link>
            <Link to="/menu">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-gold px-8 h-12 font-semibold text-base backdrop-blur-sm transition-all duration-300"
                >
                  Découvrir le menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gold/50 flex justify-center pt-2">
            <motion.div 
              className="w-1 h-2 bg-gold rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="py-24 bg-gradient-to-b from-black to-slate-950 relative overflow-hidden">
        {/* Background Decorations */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Notre <span className="text-gold">Philosophie</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Découvrez ce qui fait de Le Gourmet une destination culinaire unique
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: 'Excellence', desc: 'Des ingrédients de première qualité, sélectionnés avec soin auprès de producteurs locaux.' },
              { icon: Leaf, title: 'Fraîcheur', desc: 'Des produits frais livrés quotidiennement pour garantir une qualité optimale.' },
              { icon: Clock, title: 'Service', desc: 'Une équipe dévouée pour vous offrir une expérience mémorable à chaque visite.' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="relative h-full p-8 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 hover:border-gold/50 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center mb-4 group-hover:from-gold/50 group-hover:to-gold/20 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <feature.icon className="h-8 w-8 text-gold" />
                    </motion.div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes - Modern Grid */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-black relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">
                Nos Plats <span className="text-gold">Populaires</span>
              </h2>
              <p className="text-white/70 text-lg">
                Les favoris de nos clients
              </p>
            </div>
            <Link to="/menu">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="group border-gold/50 text-gold hover:bg-gold hover:text-black font-semibold">
                  Voir tout le menu
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {loadingProducts ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gold" />
                <p className="text-white/70">
                  Chargement des plats populaires...
                </p>
              </div>
            </div>
          ) : popularProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/70 mb-4 text-lg">
                Aucun plat populaire pour le moment
              </p>
              <Link to="/menu">
                <Button className="bg-gold text-black hover:bg-gold-dark">Découvrir notre menu</Button>
              </Link>
            </div>
          ) : (
            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {popularProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                >
                  <ProductCard 
                    product={product}
                    onViewDetails={() => {}} 
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials - Modern Design */}
      <section className="py-24 bg-black relative overflow-hidden">
        <motion.div
          className="absolute top-20 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Ce que disent nos <span className="text-gold">clients</span>
            </h2>
            <p className="text-white/70 text-lg">
              Des expériences qui parlent d'elles-mêmes
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {mockReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                whileHover={{ y: -8, borderColor: 'rgb(217, 119, 6)' }}
                className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md hover:border-gold/50 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 transition-all duration-300 ${
                        i < review.rating
                          ? 'fill-gold text-gold'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-white/80 mb-6 italic text-lg leading-relaxed">
                  "{review.comment}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/40 to-gold/20 flex items-center justify-center font-bold text-gold text-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    {review.userName.charAt(0)}
                  </motion.div>
                  <div>
                    <p className="font-semibold text-white">{review.userName}</p>
                    <p className="text-sm text-white/50">Client vérifiés</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
        {/* Ultra Premium Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-amber-900/20 to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
        
        {/* Animated Decorative Elements */}
        <motion.div
          className="absolute top-10 right-20 w-72 h-72 bg-gradient-to-br from-gold/40 to-amber-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-amber-600/30 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.35, 0.15],
            y: [0, -50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Decorative line elements */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 mb-6 sm:mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 bg-gold/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-sm font-semibold text-gold">Réservation & Livraison</span>
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2 
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Prêt pour une expérience 
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
                  véritablement unique
                </span>
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gold to-amber-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                  viewport={{ once: true }}
                />
              </span>
              <span className="text-white"> ?</span>
            </motion.h2>

            {/* Descriptive Text */}
            <motion.p 
              className="text-base sm:text-lg lg:text-xl text-white/75 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              Découvrez nos délicieuses créations culinaires en réservant directement votre table 
              ou en passant commande pour savourer à la maison.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Reservation Button */}
              <Link to="/reservation" className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto relative overflow-hidden group bg-gradient-to-r from-gold via-yellow-300 to-gold text-black hover:text-white font-bold text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 shadow-2xl shadow-gold/50 hover:shadow-gold/70 transition-all duration-300 border-0"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      <span>🍽️</span>
                      Réserver une table
                    </span>
                  </Button>
                </motion.div>
              </Link>

              {/* Order Button */}
              <Link to="/menu" className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto relative overflow-hidden group border-2 border-gold/60 bg-transparent hover:bg-gradient-to-r hover:from-gold/20 hover:to-gold/10 text-white hover:text-gold font-bold text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 transition-all duration-300 backdrop-blur-sm"
                  >
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      <span>🛵</span>
                      Commander en ligne
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-gold/20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <p className="text-gold text-2xl sm:text-3xl font-bold">24/7</p>
                <p className="text-white/60 text-xs sm:text-sm mt-1">Disponible</p>
              </div>
              <div className="text-center">
                <p className="text-gold text-2xl sm:text-3xl font-bold">⭐</p>
                <p className="text-white/60 text-xs sm:text-sm mt-1">5/5 Avis</p>
              </div>
              <div className="text-center">
                <p className="text-gold text-2xl sm:text-3xl font-bold">🔥</p>
                <p className="text-white/60 text-xs sm:text-sm mt-1">Trending</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}