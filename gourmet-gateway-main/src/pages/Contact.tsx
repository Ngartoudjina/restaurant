import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Sparkles, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

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

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // send to backend messages route
      const payload = {
        name: data.name,
        email: data.email,
        // include subject in message body so admin can see it
        message: `${data.subject}\n\n${data.message}`,
      };

      const res = await api.post('/messages', payload);

      toast({
        title: 'Message envoyé !',
        description: 'Nous vous répondrons dans les plus brefs délais.',
      });

      form.reset();
    } catch (error: any) {
      console.error('Erreur envoi message:', error);
      toast({
        title: 'Erreur envoi',
        description: error?.response?.data?.error || 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <MessageSquare className="h-4 w-4" />
              </motion.div>
              Nous Contacter
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
            Parlons-en !
          </motion.h1>

          <motion.p
            className="text-amber-900/70 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-light"
            variants={itemVariants}
          >
            Une question ? Une demande spéciale ? N'hésitez pas à nous contacter. 
            Notre équipe vous répondra dans les plus brefs délais.
          </motion.p>

          {/* Ligne décorative */}
          <motion.div 
            className="mt-12 flex items-center justify-center gap-4"
            variants={itemVariants}
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <Send className="h-6 w-6 text-amber-600" />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* MAIN CONTENT - Fond blanc luxueux */}
      <section 
        className="py-16 sm:py-20 lg:py-28"
        style={{
          background: 'linear-gradient(180deg, #FFFBF0 0%, #FFFFFF 50%, #FFF8E7 100%)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          >
            {/* CONTACT INFO CARDS */}
            <motion.div className="space-y-6" variants={containerVariants}>
              {/* Address */}
              <motion.div variants={cardVariants} whileHover="hover">
                <div className="bg-white border-2 border-amber-200/50 rounded-2xl p-6 h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400 group">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="p-4 rounded-xl flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      }}
                      whileHover={{ 
                        rotate: -360,
                        scale: 1.1
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <MapPin className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-serif font-bold text-amber-900 mb-2 text-lg group-hover:text-amber-700 transition-colors">
                        Adresse
                      </h3>
                      <p className="text-amber-800/70 text-sm leading-relaxed">
                        25 Avenue des Champs-Élysées<br />
                        75008 Cotonou, Bénin
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div variants={cardVariants} whileHover="hover">
                <div className="bg-white border-2 border-amber-200/50 rounded-2xl p-6 h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400 group">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="p-4 rounded-xl flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      }}
                      whileHover={{ 
                        scale: 1.15
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Phone className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-serif font-bold text-amber-900 mb-2 text-lg group-hover:text-amber-700 transition-colors">
                        Téléphone
                      </h3>
                      <motion.a
                        href="tel:+33142659800"
                        className="text-amber-700 hover:text-amber-900 transition-colors text-sm font-semibold inline-flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <span>+229 1 42 65 98 00</span>
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={cardVariants} whileHover="hover">
                <div className="bg-white border-2 border-amber-200/50 rounded-2xl p-6 h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400 group">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="p-4 rounded-xl flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      }}
                      whileHover={{ 
                        y: -8
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Mail className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-serif font-bold text-amber-900 mb-2 text-lg group-hover:text-amber-700 transition-colors">
                        Email
                      </h3>
                      <motion.a
                        href="mailto:abelbeingar@gmail.com"
                        className="text-amber-700 hover:text-amber-900 transition-colors text-sm font-semibold break-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        abelbeingar@gmail.com
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Hours */}
              <motion.div variants={cardVariants} whileHover="hover">
                <div className="bg-white border-2 border-amber-200/50 rounded-2xl p-6 h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400 group">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="p-4 rounded-xl flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      }}
                      animate={{ 
                        rotate: [0, 5, -5, 0] 
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Clock className="h-6 w-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-serif font-bold text-amber-900 mb-4 text-lg group-hover:text-amber-700 transition-colors">
                        Horaires
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                          <span className="text-amber-800 font-medium">Lun - Ven</span>
                          <span className="text-amber-700 font-bold text-xs">
                            12h - 14h30 | 19h - 22h30
                          </span>
                        </div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                        <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                          <span className="text-amber-800 font-medium">Sam - Dim</span>
                          <span className="text-amber-700 font-bold text-xs">
                            12h - 15h | 19h - 23h
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* CONTACT FORM */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <motion.div
                className="bg-white border-2 border-amber-200/60 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-amber-200/30 relative overflow-hidden"
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

                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <motion.div
                    className="p-4 rounded-2xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    }}
                    whileHover={{ 
                      rotate: [0, -5, 5, -5, 0],
                      scale: 1.05
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <Send className="h-7 w-7 text-white relative z-10" />
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-900">
                      Envoyez-nous un message
                    </h2>
                    <p className="text-amber-700/60 text-sm mt-1">On vous répondra au plus vite</p>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7 relative z-10">
                    {/* Name & Email */}
                    <motion.div
                      className="grid sm:grid-cols-2 gap-5"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-900 font-semibold text-sm">Votre nom</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Jean Dupont"
                                  {...field}
                                  className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 text-amber-900 placeholder:text-amber-400/60 rounded-xl h-12 transition-all duration-300"
                                />
                              </FormControl>
                              <FormMessage className="text-red-600" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-900 font-semibold text-sm">Votre email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="vous@email.com"
                                  {...field}
                                  className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 text-amber-900 placeholder:text-amber-400/60 rounded-xl h-12 transition-all duration-300"
                                />
                              </FormControl>
                              <FormMessage className="text-red-600" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </motion.div>

                    {/* Subject */}
                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-900 font-semibold text-sm">Sujet</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Objet de votre message"
                                {...field}
                                className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 text-amber-900 placeholder:text-amber-400/60 rounded-xl h-12 transition-all duration-300"
                              />
                            </FormControl>
                            <FormMessage className="text-red-600" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Message */}
                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-amber-900 font-semibold text-sm">Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Votre message..."
                                className="resize-none bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 text-amber-900 placeholder:text-amber-400/60 min-h-36 rounded-xl transition-all duration-300"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-600" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-14 text-lg font-bold rounded-xl relative overflow-hidden group"
                          style={{
                            background: 'linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #DAA520 100%)',
                            backgroundSize: '200% 200%',
                            color: '#fff',
                            border: 'none',
                          }}
                          disabled={isSubmitting}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <>
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="inline-block"
                                >
                                  ⏳
                                </motion.span>
                                Envoi en cours...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-5 w-5" />
                                Envoyer le message
                              </>
                            )}
                          </span>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </Form>
              </motion.div>

              {/* Informations additionnelles */}
              <motion.div
                className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500 rounded-r-xl"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" />
                  <p className="text-amber-900/80 text-sm leading-relaxed">
                    <span className="font-bold">Réponse rapide garantie :</span> Nous nous engageons à répondre à tous les messages dans un délai de 24h ouvrées.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}