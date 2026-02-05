import { Link } from 'react-router-dom';
import { ChefHat, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

const socialVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
  hover: { scale: 1.15, rotateZ: 5 },
};

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-slate-950 via-black to-slate-900 text-secondary-foreground border-t border-gold/10 overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl"
        animate={{
          y: [0, 30, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-yellow-300/5 blur-3xl"
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Main Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 lg:mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        >
          {/* Brand Section */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <Link
              to="/"
              className="inline-flex items-center gap-3 group"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 bg-gradient-to-br from-gold/20 to-yellow-300/10 rounded-lg group-hover:from-gold/40 group-hover:to-yellow-300/20 transition-colors"
              >
                <ChefHat className="h-6 w-6 text-gold" />
              </motion.div>
              <span className="font-serif text-2xl font-bold bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
                Le Gourmet
              </span>
            </Link>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed">
              Une expérience culinaire d'exception au cœur de Cotonou. Découvrez notre cuisine gastronomique béninoise.
            </p>
            {/* Social Icons */}
            <motion.div className="flex gap-4" variants={containerVariants}>
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  variants={socialVariants}
                  whileHover="hover"
                  className="p-2.5 bg-gradient-to-br from-gold/10 to-yellow-300/5 rounded-lg border border-gold/20 hover:border-gold/50 transition-colors"
                >
                  <social.icon className="h-5 w-5 text-gold" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-gold to-yellow-300 rounded-full" />
              Navigation
            </h3>
            <ul className="space-y-3">
              {['Accueil', 'Notre Menu', 'Réservation', 'À propos', 'Contact'].map(
                (item, idx) => {
                  const routes = ['/', '/menu', '/reservation', '/about', '/contact'];
                  return (
                    <motion.li
                      key={idx}
                      whileHover={{ x: 8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Link
                        to={routes[idx]}
                        className="text-secondary-foreground/60 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2 group"
                      >
                        {item}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.li>
                  );
                }
              )}
            </ul>
          </motion.div>

          {/* Hours */}
          <motion.div variants={itemVariants}>
            <h3 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-gold to-yellow-300 rounded-full" />
              Horaires
            </h3>
            <ul className="space-y-4">
              {[
                { day: 'Lun - Ven', time: '12h00 - 14h30 | 19h00 - 22h30' },
                { day: 'Sam - Dim', time: '12h00 - 15h00 | 19h00 - 23h00' },
              ].map((schedule, idx) => (
                <li key={idx}>
                  <motion.div
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-gold/10 transition-colors border border-white/5 hover:border-gold/30"
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Clock className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
                    <div>
                      <p className="font-medium text-secondary-foreground/80 text-sm">{schedule.day}</p>
                      <p className="text-secondary-foreground/60 text-xs">{schedule.time}</p>
                    </div>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h3 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-gold to-yellow-300 rounded-full" />
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-gold/10 transition-colors border border-white/5 hover:border-gold/30"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
                  <span className="text-secondary-foreground/60 text-sm">
                    25 Avenue des Champs-Élysées
                    <br />
                    75008 Cotonou, Benin
                  </span>
                </motion.div>
              </li>

              <li>
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-gold/10 transition-colors border border-white/5 hover:border-gold/30"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                  <a
                    href="tel:+22959334483"
                    className="text-secondary-foreground/60 hover:text-gold transition-colors text-sm font-medium"
                  >
                    +229 59334483
                  </a>
                </motion.div>
              </li>

              <li>
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-gold/10 transition-colors border border-white/5 hover:border-gold/30"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                  <a
                    href="mailto:abelbeingar@gmail.com"
                    className="text-secondary-foreground/60 hover:text-gold transition-colors text-sm font-medium truncate"
                  >
                    abelbeingar@gmail.com
                  </a>
                </motion.div>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8 lg:mb-12"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        />

        {/* Signature Section */}
        <motion.div
          className="mb-8 lg:mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-gold/5 via-yellow-300/5 to-gold/5 border border-gold/20"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="text-center text-sm sm:text-base text-secondary-foreground/70 mb-3">
            Conçu et développé avec passion par
          </p>
          <p className="text-center font-serif text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Dev Spark
          </p>
          <p className="text-center text-xs sm:text-sm text-secondary-foreground/50 mt-3">
            Créateur de solutions web modernes et innovantes
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8 lg:mb-12"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        />

        {/* Bottom Bar */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.p className="text-sm text-secondary-foreground/50" variants={itemVariants}>
            © {new Date().getFullYear()} Le Gourmet. Tous droits réservés.
          </motion.p>
          <motion.div className="flex gap-6 text-sm" variants={containerVariants}>
            {['Mentions légales', 'Politique de confidentialité'].map((item, idx) => {
              const routes = ['/legal', '/privacy'];
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Link
                    to={routes[idx]}
                    className="text-secondary-foreground/50 hover:text-gold transition-colors font-medium"
                  >
                    {item}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
