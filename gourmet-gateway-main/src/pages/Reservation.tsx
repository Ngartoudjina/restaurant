import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, ChefHat, MapPin, Phone, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { timeSlots } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const reservationSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  date: z.string().min(1, 'Veuillez sélectionner une date'),
  time: z.string().min(1, 'Veuillez sélectionner une heure'),
  guests: z.string().min(1, 'Veuillez indiquer le nombre de personnes'),
  specialRequests: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

// Animation variants avec effets plus doux et luxueux
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] // Cubic bezier pour un mouvement plus fluide
    },
  },
};

const infoCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 100, 
      damping: 20,
      mass: 1
    },
  },
  hover: { 
    y: -12, 
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
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

export default function ReservationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: user?.phone || '',
      date: '',
      time: '',
      guests: '2',
      specialRequests: '',
    },
  });

  const onSubmit = async (data: ReservationFormData) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/api/reservations`, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        date: data.date,
        time: data.time,
        guests: parseInt(data.guests),
        specialRequests: data.specialRequests || '',
        userId: user?.id || null,
      });

      toast({
        title: 'Réservation confirmée !',
        description: `Votre table pour ${data.guests} personnes est réservée le ${formatDate(data.date)} à ${data.time}.`,
      });

      setIsSubmitting(false);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Une erreur est survenue lors de la réservation'
        : 'Une erreur est survenue lors de la réservation';
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <Layout>
      {/* HERO HEADER - Thème doré luxueux */}
      <motion.section
        className="relative py-12 sm:py-20 lg:py-40 overflow-hidden gradient-cream"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        {/* Éléments décoratifs dorés flottants */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20 gradient-gold-glow"
          animate={floatingAnimation}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-20 gradient-gold-glow-lg"
          animate={{
            y: [0, 20, 0],
            transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Motif géométrique subtil en arrière-plan */}
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
                <Sparkles className="h-4 w-4" />
              </motion.div>
              Réservation en ligne
            </span>
          </motion.div>

          <motion.h1
            className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-8 leading-tight"
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
            Réservez Votre Table
          </motion.h1>

          <motion.p
            className="text-amber-900/70 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed font-light px-2"
            variants={itemVariants}
          >
            Vivez une expérience gastronomique inoubliable dans une ambiance raffinée. 
            Réservez dès maintenant votre place à notre table d'excellence.
          </motion.p>

          {/* Ligne décorative */}
          <motion.div 
            className="mt-12 flex items-center justify-center gap-4"
            variants={itemVariants}
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <ChefHat className="h-6 w-6 text-amber-600" />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* MAIN CONTENT - Fond blanc cassé luxueux */}
      <section 
        className="py-16 sm:py-20 lg:py-28"
        style={{
          background: 'linear-gradient(180deg, #FFFBF0 0%, #FFFFFF 50%, #FFF8E7 100%)',
        }}
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '0px 0px -150px 0px' }}
            >
              {/* Form Section */}
              <motion.div className="lg:col-span-2" variants={itemVariants}>
                <motion.div
                  className="bg-white border-2 border-amber-200/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl shadow-amber-200/30 relative overflow-hidden"
                  whileHover={{ 
                    borderColor: 'rgba(218, 165, 32, 0.8)',
                    boxShadow: '0 30px 60px rgba(218, 165, 32, 0.2)'
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Effet de brillance au survol */}
                  <motion.div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
                    }}
                  />

                  <div className="flex items-center gap-3 sm:gap-4 mb-7 sm:mb-10 relative z-10">
                    <motion.div
                      className="p-3 sm:p-4 rounded-xl sm:rounded-2xl relative overflow-hidden flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      }}
                      whileHover={{ 
                        rotate: [0, -5, 5, -5, 0],
                        scale: 1.05
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <ChefHat className="h-5 sm:h-7 w-5 sm:w-7 text-white relative z-10" />
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
                    <div className="min-w-0">
                      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-900 leading-tight">
                        Réserver une table
                      </h2>
                      <p className="text-amber-700/60 text-xs sm:text-sm mt-1">Complétez le formulaire ci-dessous</p>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-7 relative z-10">
                      {/* Personal Info */}
                      <motion.div
                        className="grid sm:grid-cols-2 gap-3 sm:gap-5"
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
                                <FormLabel className="text-amber-900 font-semibold text-xs sm:text-sm">Nom complet</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Jean Dupont"
                                    {...field}
                                    className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 text-amber-900 placeholder:text-amber-400/60 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm transition-all duration-300"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-600 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-amber-900 font-semibold text-xs sm:text-sm">Téléphone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="06 12 34 56 78"
                                    {...field}
                                    className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 text-amber-900 placeholder:text-amber-400/60 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm transition-all duration-300"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-600 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-900 font-semibold text-xs sm:text-sm">Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="jean@email.com"
                                  {...field}
                                  className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 text-amber-900 placeholder:text-amber-400/60 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm transition-all duration-300"
                                />
                              </FormControl>
                              <FormMessage className="text-red-600 text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Date, Time, Guests */}
                      <motion.div
                        className="grid sm:grid-cols-3 gap-3 sm:gap-5"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-amber-900 font-semibold text-xs sm:text-sm flex items-center gap-2">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                  <span className="hidden sm:inline">Date</span>
                                  <span className="sm:hidden">D.</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 rounded-lg sm:rounded-xl h-10 sm:h-12 text-amber-900 text-sm">
                                      <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white border-2 border-amber-200 rounded-xl shadow-xl">
                                    {availableDates.map(date => (
                                      <SelectItem 
                                        key={date} 
                                        value={date}
                                        className="hover:bg-amber-50 focus:bg-amber-100 text-amber-900"
                                      >
                                        {formatDate(date)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-600 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-amber-900 font-semibold text-xs sm:text-sm flex items-center gap-2">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                  <span className="hidden sm:inline">Heure</span>
                                  <span className="sm:hidden">H.</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 rounded-lg sm:rounded-xl h-10 sm:h-12 text-amber-900 text-sm">
                                      <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white border-2 border-amber-200 rounded-xl shadow-xl">
                                    {timeSlots.map(time => (
                                      <SelectItem 
                                        key={time} 
                                        value={time}
                                        className="hover:bg-amber-50 focus:bg-amber-100 text-amber-900"
                                      >
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-600 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="guests"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-amber-900 font-semibold text-xs sm:text-sm flex items-center gap-2">
                                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                  <span className="hidden sm:inline">Personnes</span>
                                  <span className="sm:hidden">Pers.</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 rounded-lg sm:rounded-xl h-10 sm:h-12 text-amber-900 text-sm">
                                      <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white border-2 border-amber-200 rounded-xl shadow-xl">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                      <SelectItem 
                                        key={num} 
                                        value={num.toString()}
                                        className="hover:bg-amber-50 focus:bg-amber-100 text-amber-900"
                                      >
                                        {num} personne{num > 1 ? 's' : ''}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-600 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Special Requests */}
                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="specialRequests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-900 font-semibold text-xs sm:text-sm">Demandes spéciales (optionnel)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Allergies, anniversaire, préférences de placement..."
                                  className="resize-none bg-amber-50/50 border-2 border-amber-200/50 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 text-amber-900 placeholder:text-amber-400/60 min-h-24 sm:min-h-28 rounded-lg sm:rounded-xl transition-all duration-300 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-600 text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            className="w-full h-12 sm:h-14 text-sm sm:text-lg font-bold rounded-lg sm:rounded-xl relative overflow-hidden group"
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
                                  <span className="hidden sm:inline">Réservation en cours...</span>
                                  <span className="sm:hidden">En cours...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                                  <span className="hidden sm:inline">Confirmer la réservation</span>
                                  <span className="sm:hidden">Réserver</span>
                                </>
                              )}
                            </span>
                          </Button>
                        </motion.div>
                      </motion.div>
                    </form>
                  </Form>
                </motion.div>
              </motion.div>

              {/* Sidebar Info Cards */}
              <motion.div className="space-y-4 sm:space-y-6 lg:space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                {/* Hours Card */}
                <motion.div
                  variants={infoCardVariants}
                  whileHover="hover"
                  className="group"
                >
                  <div className="bg-white border-2 border-amber-200/50 rounded-xl sm:rounded-2xl p-5 sm:p-7 h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <motion.div
                        className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        }}
                        whileHover={{ 
                          rotate: -10,
                          scale: 1.1
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="font-serif text-lg sm:text-xl font-bold text-amber-900">Horaires d'ouverture</p>
                        <p className="text-amber-700/60 text-xs sm:text-sm mt-1">Nous vous attendons</p>
                      </div>
                    </div>
                    <motion.div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-amber-800">
                      <div className="flex justify-between items-center p-2.5 sm:p-3 bg-amber-50/50 rounded-lg text-xs sm:text-sm">
                        <span className="font-medium">Déjeuner</span>
                        <span className="font-bold text-amber-600">12h - 14h30</span>
                      </div>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                      <div className="flex justify-between items-center p-2.5 sm:p-3 bg-amber-50/50 rounded-lg text-xs sm:text-sm">
                        <span className="font-medium">Dîner</span>
                        <span className="font-bold text-amber-600">19h - 22h30</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Group Reservation Card */}
                <motion.div
                  variants={infoCardVariants}
                  whileHover="hover"
                  className="group"
                >
                  <div className="bg-white border-2 border-amber-200/50 rounded-xl sm:rounded-2xl p-5 sm:p-7 h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <motion.div
                        className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        }}
                        whileHover={{ 
                          scale: 1.15
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="font-serif text-lg sm:text-xl font-bold text-amber-900">Groupes & Événements</p>
                        <p className="text-amber-700/60 text-xs sm:text-sm mt-1">Pour 8 personnes et plus</p>
                      </div>
                    </div>
                    <p className="text-amber-800/80 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">
                      Contactez-nous directement pour organiser votre événement privé dans une ambiance raffinée.
                    </p>
                    <div className="flex flex-col gap-2 sm:gap-3 pt-4 sm:pt-5 border-t-2 border-amber-100">
                      <motion.a 
                        href="tel:+33142659800" 
                        className="flex items-center gap-2 sm:gap-3 text-amber-700 hover:text-amber-900 transition-colors font-semibold text-xs sm:text-sm p-2.5 sm:p-3 bg-amber-50/50 rounded-lg"
                        whileHover={{ x: 5 }}
                      >
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">+229 1 42 65 98 00</span>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>

                {/* Location Card */}
                <motion.div
                  variants={infoCardVariants}
                  whileHover="hover"
                  className="group"
                >
                  <div className="bg-white border-2 border-amber-200/50 rounded-xl sm:rounded-2xl p-5 sm:p-7 h-full hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-400">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <motion.div
                        className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        }}
                        whileHover={{ 
                          y: -8
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </motion.div>
                      <div className="min-w-0">
                        <p className="font-serif text-lg sm:text-xl font-bold text-amber-900">Localisation</p>
                        <p className="text-amber-700/60 text-xs sm:text-sm mt-1">Où nous trouver</p>
                      </div>
                    </div>
                    <p className="text-amber-800/80 text-xs sm:text-sm leading-relaxed bg-amber-50/50 p-3 sm:p-4 rounded-lg">
                      25 Avenue des Champs-Élysées
                      <br />
                      75008 Cotonou, Bénin
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}