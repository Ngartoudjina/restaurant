import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const success = await login(data.email, data.password);
    if (success) {
      toast({ title: 'Connexion réussie', description: 'Bienvenue !' });
      navigate(from, { replace: true });
    } else {
      toast({
        title: 'Erreur de connexion',
        description: 'Email ou mot de passe incorrect.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="auth">
      {/* Panneau nuit */}
      <aside className="auth__aside">
        <Link to="/" className="auth__brand">
          Le <em>Gourmet</em>
        </Link>
        <div className="auth__pitch">
          <h2>
            Le goût de <em>chez vous</em>, à portée de clic.
          </h2>
          <p>
            Retrouvez vos commandes, vos réservations et vos plats favoris. La table vous attend.
          </p>
        </div>
        <span className="auth__note">Gastronomie béninoise · Cotonou</span>
      </aside>

      {/* Formulaire papier */}
      <main className="auth__panel">
        <div className="auth__card">
          <div className="auth__mobrand">
            <Link to="/" className="brand">
              Le <em>Gourmet</em>
            </Link>
            <Link to="/" className="home">
              ← Accueil
            </Link>
          </div>
          <div className="auth__head">
            <p className="auth__eyebrow">Content de vous revoir</p>
            <h1 className="auth__title">
              Se <em>connecter</em>
            </h1>
            <p className="auth__sub">Accédez à votre compte Le Gourmet.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1.5rem' }}>
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <span className="rlabel">Mot de passe</span>
                    <FormControl>
                      <div className="auth__pass">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="rinput"
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          className="auth__eye"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="rerror" />
                  </FormItem>
                )}
              />

              <button type="submit" className="bb-btn news__btn" style={{ width: '100%' }} disabled={isLoading}>
                {isLoading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          </Form>

          <p className="auth__foot">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
