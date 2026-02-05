import { ShoppingCart, User, Menu as MenuIcon, Package, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Accueil', path: '/' },
  { label: 'Menu', path: '/menu' },
  { label: 'Réservation', path: '/reservation' },
  { label: 'À propos', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export function Navbar() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav 
      className="bg-gradient-to-r from-black via-black to-slate-900 text-white sticky top-0 z-50 backdrop-blur-md bg-opacity-95 border-b border-gold/10"
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="py-3 lg:py-4 flex items-center justify-between">
          {/* Logo avec animation */}
          <Link to="/" className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="text-2xl lg:text-3xl font-serif font-bold">
                <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                  Le Gourmet
                </span>
              </div>
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-gold to-yellow-300"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </Link>

          {/* Navigation Desktop */}
          <motion.div 
            className="hidden lg:flex items-center space-x-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                variants={itemVariants}
              >
                <Link 
                  to={item.path}
                  className="relative px-4 py-2 text-sm font-medium group overflow-hidden rounded-lg"
                >
                  <motion.div
                    className="absolute inset-0 bg-gold/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 group-hover:text-gold transition duration-300">
                    {item.label}
                  </span>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gold to-yellow-300"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Mes commandes (Desktop) */}
            {user && (
              <motion.button
                onClick={() => navigate('/orders')}
                className="hidden sm:flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Historique des commandes"
              >
                <Package className="h-5 w-5" />
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 to-yellow-300/50 rounded-lg -z-10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            )}

            {/* Panier */}
            <motion.button
              onClick={() => navigate('/cart')}
              className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-gradient-to-br from-gold/20 to-gold/10 hover:from-gold/30 hover:to-gold/20 text-gold transition-all duration-300 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.div
                className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 to-yellow-300/50 rounded-lg -z-10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            {/* Utilisateur / Connexion */}
            {user ? (
              <motion.button
                onClick={() => navigate('/account')}
                className="hidden sm:flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="h-5 w-5" />
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 to-yellow-300/50 rounded-lg -z-10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-gold to-yellow-300 text-black hover:from-yellow-300 hover:to-gold font-semibold text-sm h-10 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Connexion
                </Button>
              </motion.div>
            )}

            {/* Menu mobile */}
            <motion.button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MenuIcon className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Menu Mobile avec design moderne */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="lg:hidden pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="pt-4 border-t border-gold/10 space-y-2">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className="block px-4 py-3 rounded-lg hover:bg-gold/10 transition-colors text-sm font-medium group relative overflow-hidden"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-gold/0 to-gold/10"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative z-10 group-hover:text-gold transition duration-300">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {/* Mes commandes (Mobile) */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: navItems.length * 0.05 }}
                  >
                    <Link
                      to="/orders"
                      className="block px-4 py-3 rounded-lg hover:bg-gold/10 transition-colors text-sm font-medium group relative overflow-hidden"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-gold/0 to-gold/10"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative z-10 group-hover:text-gold transition duration-300 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Mes commandes
                      </span>
                    </Link>
                  </motion.div>
                )}

                {/* Divider */}
                <div className="my-2 h-px bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0" />

                {/* User actions (Mobile) */}
                <motion.div
                  className="flex flex-col gap-2 pt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navItems.length + 1) * 0.05 }}
                >
                  {user ? (
                    <button
                      onClick={() => {
                        navigate('/account');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Mon compte
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-gold to-yellow-300 text-black text-sm font-semibold transition-all duration-300 hover:shadow-lg"
                    >
                      Connexion
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}