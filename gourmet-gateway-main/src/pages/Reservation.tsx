import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, MapPin, Phone, MessageCircle, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { timeSlots } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { siteConfig, whatsappUrl } from '@/config/site';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

export default function ReservationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const root = useRef<HTMLDivElement>(null);

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
      await axios.post(`${API_URL}/api/reservations`, {
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

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('.js-r-line > span', { yPercent: 110, duration: 1, stagger: 0.1 })
          .from(
            '.js-r-fade',
            { y: 16, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 },
            '-=0.6'
          );

        gsap.from('.js-r-panel', {
          y: 28,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.js-r-grid', start: 'top 80%', once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <Layout>
      <div ref={root}>
        {/* En-tête — la nuit */}
        <section className="mhero" aria-labelledby="resv-title">
          <div className="mhero__inner">
            <p className="js-r-fade philo__eyebrow" style={{ color: 'var(--bb-bronze)' }}>
              Réservation
            </p>
            <h1 id="resv-title" className="mhero__title">
              <span className="js-r-line hero-line">
                <span>Votre table</span>
              </span>
              <span className="js-r-line hero-line">
                <span>
                  <em>vous attend.</em>
                </span>
              </span>
            </h1>
            <p className="js-r-fade mhero__sub">
              Deux minutes suffisent. Choisissez votre créneau, nous nous occupons du reste —
              jusqu'à la dernière bougie.
            </p>
          </div>
        </section>

        {/* Le bulletin — le papier */}
        <section className="resv-body">
          <div className="js-r-grid resv-grid">
            {/* Formulaire */}
            <div className="js-r-panel rform">
              <div className="rform__head">
                <h2 className="rform__title">Le bulletin de réservation</h2>
                <span className="rform__note">Confirmation immédiate</span>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="grid2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <span className="rlabel">Nom complet</span>
                          <FormControl>
                            <input className="rinput" placeholder="Aïcha Tossou" {...field} />
                          </FormControl>
                          <FormMessage className="rerror" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <span className="rlabel">Téléphone</span>
                          <FormControl>
                            <input className="rinput" placeholder="+229 97 00 00 00" {...field} />
                          </FormControl>
                          <FormMessage className="rerror" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <span className="rlabel">Email</span>
                        <FormControl>
                          <input type="email" className="rinput" placeholder="vous@email.com" {...field} />
                        </FormControl>
                        <FormMessage className="rerror" />
                      </FormItem>
                    )}
                  />

                  <div className="grid3">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <span className="rlabel">
                            <Calendar className="h-3.5 w-3.5" /> Date
                          </span>
                          <FormControl>
                            <select className="rinput" {...field}>
                              <option value="" disabled>
                                Choisir…
                              </option>
                              {availableDates.map((date) => (
                                <option key={date} value={date}>
                                  {formatDate(date)}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage className="rerror" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <span className="rlabel">
                            <Clock className="h-3.5 w-3.5" /> Heure
                          </span>
                          <FormControl>
                            <select className="rinput" {...field}>
                              <option value="" disabled>
                                Choisir…
                              </option>
                              {timeSlots.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage className="rerror" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guests"
                      render={({ field }) => (
                        <FormItem>
                          <span className="rlabel">
                            <Users className="h-3.5 w-3.5" /> Couverts
                          </span>
                          <FormControl>
                            <select className="rinput" {...field}>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                <option key={num} value={num.toString()}>
                                  {num} personne{num > 1 ? 's' : ''}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage className="rerror" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <span className="rlabel">Demandes spéciales (optionnel)</span>
                        <FormControl>
                          <textarea
                            className="rinput"
                            placeholder="Allergies, anniversaire, préférences de placement…"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="rerror" />
                      </FormItem>
                    )}
                  />

                  <button
                    type="submit"
                    className="bb-btn news__btn"
                    style={{ width: '100%' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Réservation en cours…
                      </>
                    ) : (
                      'Confirmer la réservation'
                    )}
                  </button>
                </form>
              </Form>
            </div>

            {/* Colonne informations */}
            <aside>
              <div className="js-r-panel rcard">
                <div className="rcard__head">
                  <span className="rcard__ico">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <h3>Horaires</h3>
                    <p>Nous vous attendons</p>
                  </div>
                </div>
                <div className="rcard__rows">
                  {siteConfig.hours.map((h) => (
                    <div key={h.day} className="rcard__row">
                      <span>{h.day}</span>
                      <b>{h.time}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="js-r-panel rcard">
                <div className="rcard__head">
                  <span className="rcard__ico">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <h3>Groupes &amp; événements</h3>
                    <p>Pour 8 personnes et plus</p>
                  </div>
                </div>
                <p className="txt">
                  Contactez-nous directement pour organiser votre événement privé dans une ambiance
                  raffinée.
                </p>
                <a className="lnk" href={siteConfig.contact.phoneLink}>
                  <Phone className="h-4 w-4" />
                  {siteConfig.contact.phoneDisplay}
                </a>
                <br />
                <a className="lnk" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Écrire sur WhatsApp
                </a>
              </div>

              <div className="js-r-panel rcard">
                <div className="rcard__head">
                  <span className="rcard__ico">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h3>Localisation</h3>
                    <p>Où nous trouver</p>
                  </div>
                </div>
                <p className="txt">
                  {siteConfig.contact.addressStreet}
                  <br />
                  {siteConfig.contact.addressCity}, {siteConfig.contact.addressCountry}
                </p>
                <a
                  className="lnk"
                  href={siteConfig.contact.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-4 w-4" />
                  Voir sur la carte
                </a>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </Layout>
  );
}
