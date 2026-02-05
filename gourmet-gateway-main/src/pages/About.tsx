import { Award, ChefHat, Leaf, Heart, Users, Sparkles, Star, Crown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 20 } 
  },
  hover: { 
    y: -12,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

const floatingAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const shimmerAnimation = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "linear"
  }
};

export default function About() {
  return (
    <Layout>
      {/* HERO HEADER - Thème luxueux doré */}
      <motion.section
        className="relative py-24 sm:py-32 lg:py-40 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF8E7 25%, #FFEFD5 50%, #FFF8E7 75%, #FFFBF0 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        {/* Éléments décoratifs flottants */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(218, 165, 32, 0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={floatingAnimation}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{
            y: [0, 20, 0],
            transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* Motif géométrique subtil */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(218, 165, 32, 0.1) 35px, rgba(218, 165, 32, 0.1) 70px),
              repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255, 215, 0, 0.1) 35px, rgba(255, 215, 0, 0.1) 70px)
            `,
          }}
        />

        <motion.div
          className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <span className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm sm:text-base px-6 py-3 rounded-full border-2 border-amber-300/50 bg-white/80 backdrop-blur-sm shadow-lg shadow-amber-200/50">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Crown className="h-4 w-4" />
              </motion.div>
              Notre Histoire
            </span>
          </motion.div>

          <motion.h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 25%, #FFD700 50%, #DAA520 75%, #B8860B 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={shimmerAnimation}
            variants={itemVariants}
          >
            Découvrez Le Gourmet
          </motion.h1>

          <motion.p
            className="text-amber-900/70 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-light"
            variants={itemVariants}
          >
            L'âme d'un restaurant fondé sur la passion et l'excellence culinaire. 
            Explorez notre histoire, nos valeurs et notre équipe d'exception.
          </motion.p>

          {/* Ligne décorative */}
          <motion.div 
            className="mt-12 flex items-center justify-center gap-4"
            variants={itemVariants}
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <Sparkles className="h-6 w-6 text-amber-600" />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* STORY SECTION - Fond blanc luxueux */}
      <section 
        className="py-16 sm:py-20 lg:py-28"
        style={{
          background: 'linear-gradient(180deg, #FFFBF0 0%, #FFFFFF 50%, #FFF8E7 100%)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          >
            <motion.div
              className="bg-white border-2 border-amber-200/60 rounded-3xl p-10 sm:p-14 shadow-2xl shadow-amber-200/30 relative overflow-hidden"
              whileHover={{ 
                borderColor: 'rgba(218, 165, 32, 0.8)',
                boxShadow: '0 30px 60px rgba(218, 165, 32, 0.2)'
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Effet de brillance */}
              <motion.div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
                }}
              />

              <div className="space-y-8 text-center relative z-10">
                <motion.div
                  className="inline-flex items-center gap-3 mb-4"
                  variants={itemVariants}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="h-8 w-8 text-amber-500" />
                  </motion.div>
                  <h2 className="font-serif text-3xl font-bold text-amber-900">Notre Histoire</h2>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="h-8 w-8 text-amber-500" />
                  </motion.div>
                </motion.div>

                <motion.p
                  className="text-amber-800/90 text-lg leading-relaxed"
                  variants={itemVariants}
                >
                  Fondé en 2010 au cœur de Cotonou, Le Gourmet est né de la vision d'un chef passionné :
                  <span className="font-bold text-amber-700"> créer un lieu où la gastronomie béninoise rencontre l'innovation moderne.</span>
                </motion.p>

                <motion.div
                  className="h-1 w-32 mx-auto rounded-full relative overflow-hidden"
                  variants={itemVariants}
                  style={{
                    background: 'linear-gradient(90deg, #DAA520, #FFD700, #DAA520)',
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/50"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>

                <motion.p
                  className="text-amber-800/90 text-lg leading-relaxed"
                  variants={itemVariants}
                >
                  Notre restaurant est bien plus qu'un simple lieu de restauration. C'est une expérience
                  sensorielle complète où chaque détail, de l'ambiance à la présentation des plats,
                  est pensé pour émerveiller nos convives.
                </motion.p>

                <motion.div
                  className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-l-4 border-amber-500 p-6 rounded-r-2xl"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-amber-900/90 text-lg leading-relaxed font-medium">
                    Nous travaillons exclusivement avec des producteurs locaux sélectionnés pour la qualité
                    exceptionnelle de leurs produits, garantissant{' '}
                    <span className="text-amber-700 font-bold">fraîcheur et authenticité</span> à chaque bouchée.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* VALUES SECTION - Fond crème */}
      <section 
        className="py-16 sm:py-20 lg:py-28"
        style={{
          background: 'linear-gradient(180deg, #FFF8E7 0%, #FFFBF0 50%, #FFF8E7 100%)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14 sm:mb-20"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm px-5 py-2 rounded-full bg-white border-2 border-amber-300/50 shadow-lg shadow-amber-200/50">
                <Sparkles className="h-4 w-4" />
                Ce qui nous anime
              </span>
            </motion.div>

            <motion.h2
              className="font-serif text-4xl sm:text-5xl font-bold mb-6 text-amber-900"
              variants={itemVariants}
            >
              Nos Valeurs
            </motion.h2>

            <motion.div
              className="h-1 w-32 mx-auto rounded-full"
              style={{
                background: 'linear-gradient(90deg, #DAA520, #FFD700, #DAA520)',
              }}
              variants={itemVariants}
            />
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          >
            {[
              { 
                icon: Award, 
                title: 'Excellence', 
                desc: 'La quête permanente de la perfection dans chaque plat.',
                color: 'from-amber-500 to-orange-500'
              },
              { 
                icon: Leaf, 
                title: 'Fraîcheur', 
                desc: 'Des produits frais livrés quotidiennement par nos partenaires.',
                color: 'from-emerald-500 to-teal-500'
              },
              { 
                icon: Heart, 
                title: 'Passion', 
                desc: 'L\'amour de la cuisine qui se ressent dans chaque création.',
                color: 'from-rose-500 to-pink-500'
              },
              { 
                icon: Users, 
                title: 'Service', 
                desc: 'Un accueil chaleureux et un service irréprochable.',
                color: 'from-blue-500 to-indigo-500'
              }
            ].map((value, idx) => (
              <motion.div key={idx} variants={cardVariants} whileHover="hover">
                <div className="bg-white border-2 border-amber-200/50 rounded-2xl p-8 h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400 group">
                  <motion.div
                    className={`p-5 rounded-2xl mb-6 w-fit mx-auto relative overflow-hidden`}
                    style={{
                      background: `linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(255, 215, 0, 0.1))`,
                    }}
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <value.icon className="h-10 w-10 text-amber-600 relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                  
                  <h3 className="font-serif text-xl font-bold mb-3 text-amber-900 group-hover:text-amber-700 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-amber-800/70 text-sm leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TEAM SECTION - Fond blanc */}
      <section 
        className="py-16 sm:py-20 lg:py-28"
        style={{
          background: 'linear-gradient(180deg, #FFF8E7 0%, #FFFFFF 50%, #FFFBF0 100%)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14 sm:mb-20"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm px-5 py-2 rounded-full bg-white border-2 border-amber-300/50 shadow-lg shadow-amber-200/50">
                <ChefHat className="h-4 w-4" />
                L'équipe d'exception
              </span>
            </motion.div>

            <motion.h2
              className="font-serif text-4xl sm:text-5xl font-bold mb-6 text-amber-900"
              variants={itemVariants}
            >
              Notre Équipe
            </motion.h2>

            <motion.p
              className="text-amber-900/70 text-lg max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Des professionnels passionnés au service de votre expérience culinaire
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          >
            {[
              { 
                name: 'Abel Beingar', 
                role: 'Chef Exécutif', 
                desc: '25 ans d\'expérience, étoilé Michelin, passionné par la cuisine béninoise contemporaine.',
                gradient: 'from-amber-400 to-orange-400'
              },
              { 
                name: 'Marie Laurent', 
                role: 'Sous-Chef', 
                desc: 'Spécialiste des desserts, formation au Cordon Bleu, créatrice de saveurs uniques.',
                gradient: 'from-yellow-400 to-amber-400'
              },
              { 
                name: 'Jean-Paul Martin', 
                role: 'Sommelier', 
                desc: 'Expert en vins béninois et internationaux, conseils personnalisés pour chaque plat.',
                gradient: 'from-orange-400 to-red-400'
              }
            ].map((member, idx) => (
              <motion.div key={idx} variants={cardVariants} whileHover="hover">
                <div className="bg-white border-2 border-amber-200/50 rounded-3xl p-8 text-center h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400 group relative overflow-hidden">
                  {/* Effet de fond au survol */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at 50% 0%, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
                    }}
                  />

                  <motion.div
                    className="relative z-10 w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(255, 215, 0, 0.2))',
                      border: '3px solid rgba(218, 165, 32, 0.3)',
                    }}
                    whileHover={{ 
                      scale: 1.15,
                      rotate: 360
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <ChefHat className="h-14 w-14 text-amber-600" />
                    
                    {/* Cercle décoratif animé */}
                    <motion.div
                      className="absolute inset-0 border-2 border-amber-400/30 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>

                  <h3 className="font-serif text-2xl font-bold mb-2 text-amber-900 relative z-10">
                    {member.name}
                  </h3>
                  
                  <motion.p 
                    className="font-semibold text-sm mb-4 relative z-10 inline-block px-4 py-2 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.15), rgba(255, 215, 0, 0.1))',
                      color: '#B8860B',
                    }}
                  >
                    {member.role}
                  </motion.p>
                  
                  <p className="text-amber-800/80 text-sm leading-relaxed relative z-10">
                    {member.desc}
                  </p>

                  {/* Badge décoratif */}
                  <motion.div
                    className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity"
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Star className="h-12 w-12 text-amber-500" fill="currentColor" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Citation finale */}
          <motion.div
            className="mt-20 max-w-3xl mx-auto text-center"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-gradient-to-br from-white to-amber-50/50 border-2 border-amber-300/50 rounded-3xl p-10 shadow-xl shadow-amber-200/30"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="text-6xl text-amber-400/30 mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                "
              </motion.div>
              <p className="font-serif text-2xl italic text-amber-900 mb-4 leading-relaxed">
                La cuisine est un art, et chaque plat est une œuvre d'amour
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
                <span className="text-amber-700 font-medium text-sm">Chef Abel Beingar</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}