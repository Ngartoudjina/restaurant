import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { siteConfig } from '@/config/site';

/**
 * Capture d'email contre le code de bienvenue.
 * Permet de constituer une base pour le remarketing.
 *
 * TODO: brancher `persistLead` sur un vrai endpoint (Firebase / backend)
 * pour stocker l'email et déclencher l'envoi du code par email.
 */
function persistLead(email: string) {
  try {
    const raw = window.localStorage.getItem('newsletter-leads');
    const leads: string[] = raw ? JSON.parse(raw) : [];
    if (!leads.includes(email)) leads.push(email);
    window.localStorage.setItem('newsletter-leads', JSON.stringify(leads));
  } catch {
    /* localStorage indisponible — on ignore */
  }
}

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({
        title: 'Email invalide',
        description: 'Merci de saisir une adresse email valide.',
        variant: 'destructive',
      });
      return;
    }

    persistLead(value);
    setSubmitted(true);
    toast({
      title: '🎉 Votre code est prêt !',
      description: `Utilisez ${siteConfig.promo.code} pour ${siteConfig.promo.percent}% sur votre première commande.`,
      duration: 6000,
    });
  };

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/20 mb-6">
            <Mail className="h-7 w-7 text-gold" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
            {siteConfig.promo.percent}% sur votre <span className="text-gold">première commande</span>
          </h2>
          <p className="text-white/70 mb-8">
            Inscrivez-vous pour recevoir votre code de bienvenue et nos offres exclusives.
          </p>

          {submitted ? (
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-black font-bold text-lg tracking-wider">
                <Check className="h-5 w-5" />
                {siteConfig.promo.code}
              </div>
              <p className="text-white/60 text-sm">
                Merci ! Appliquez ce code au moment du paiement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="votre@email.com"
                aria-label="Adresse email"
                className="flex-1 h-12 bg-white/5 border-gold/30 text-white placeholder:text-white/40 focus-visible:ring-gold/40"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 bg-gradient-to-r from-gold to-yellow-300 text-black font-bold hover:from-yellow-300 hover:to-gold"
              >
                Recevoir mon code
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
