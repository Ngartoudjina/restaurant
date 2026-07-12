import { useRef, useState } from 'react';
import { MapPin, Phone, MessageCircle, Clock, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { siteConfig, whatsappUrl } from '@/config/site';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import '@/styles/braise-bronze.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Envoi vers la route messages du backend
      // (le sujet est inclus dans le corps pour rester visible côté admin)
      await api.post('/messages', {
        name: data.name,
        email: data.email,
        message: `${data.subject}\n\n${data.message}`,
      });

      toast({
        title: 'Message envoyé !',
        description: 'Nous vous répondrons dans les plus brefs délais.',
      });

      form.reset();
    } catch (error: unknown) {
      console.error('Erreur envoi message:', error);
      const description =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Impossible d'envoyer le message";
      toast({ title: 'Erreur envoi', description, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('.js-c-line > span', { yPercent: 110, duration: 1, stagger: 0.1 })
          .from(
            '.js-c-fade',
            { y: 16, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 },
            '-=0.6'
          );

        gsap.from('.js-c-panel', {
          y: 28,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.js-c-grid', start: 'top 80%', once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <Layout>
      <div ref={root}>
        {/* En-tête — la nuit */}
        <section className="mhero" aria-labelledby="contact-title">
          <div className="mhero__inner">
            <p className="js-c-fade philo__eyebrow" style={{ color: 'var(--bb-bronze)' }}>
              Contact
            </p>
            <h1 id="contact-title" className="mhero__title">
              <span className="js-c-line hero-line">
                <span>Écrivez-nous,</span>
              </span>
              <span className="js-c-line hero-line">
                <span>
                  <em>on vous répond.</em>
                </span>
              </span>
            </h1>
            <p className="js-c-fade mhero__sub">
              Une question, un événement à organiser, une envie particulière ? Laissez-nous un mot —
              ou écrivez-nous directement sur WhatsApp.
            </p>
          </div>
        </section>

        {/* Le courrier — le papier */}
        <section className="resv-body">
          <div className="js-c-grid resv-grid">
            {/* Formulaire */}
            <div className="js-c-panel rform">
              <div className="rform__head">
                <h2 className="rform__title">Laissez-nous un mot</h2>
                <span className="rform__note">Réponse sous 24 h</span>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <span className="rlabel">Sujet</span>
                        <FormControl>
                          <input className="rinput" placeholder="Réservation de groupe, allergènes…" {...field} />
                        </FormControl>
                        <FormMessage className="rerror" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <span className="rlabel">Message</span>
                        <FormControl>
                          <textarea
                            className="rinput"
                            placeholder="Dites-nous tout…"
                            style={{ minHeight: 150 }}
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
                        Envoi en cours…
                      </>
                    ) : (
                      'Envoyer le message'
                    )}
                  </button>
                </form>
              </Form>
            </div>

            {/* Colonne informations */}
            <aside>
              <div className="js-c-panel rcard">
                <div className="rcard__head">
                  <span className="rcard__ico">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <h3>WhatsApp</h3>
                    <p>La réponse la plus rapide</p>
                  </div>
                </div>
                <p className="txt">
                  Pour une commande ou une question urgente, WhatsApp est notre canal le plus
                  réactif.
                </p>
                <a className="lnk" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Ouvrir la conversation
                </a>
              </div>

              <div className="js-c-panel rcard">
                <div className="rcard__head">
                  <span className="rcard__ico">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <h3>Téléphone</h3>
                    <p>Midi &amp; soir</p>
                  </div>
                </div>
                <a className="lnk" href={siteConfig.contact.phoneLink}>
                  <Phone className="h-4 w-4" />
                  {siteConfig.contact.phoneDisplay}
                </a>
              </div>

              <div className="js-c-panel rcard">
                <div className="rcard__head">
                  <span className="rcard__ico">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h3>Adresse</h3>
                    <p>{siteConfig.contact.addressCity}, {siteConfig.contact.addressCountry}</p>
                  </div>
                </div>
                <p className="txt">{siteConfig.contact.addressStreet}</p>
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

              <div className="js-c-panel rcard">
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
            </aside>
          </div>
        </section>
      </div>
    </Layout>
  );
}
