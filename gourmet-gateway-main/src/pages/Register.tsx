import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(10, 'Numéro de téléphone invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    const success = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    if (success) {
      toast({ title: 'Compte créé !', description: 'Bienvenue chez Le Gourmet !' });
      navigate('/');
    } else {
      toast({
        title: 'Erreur',
        description: 'Un compte avec cet email existe déjà.',
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
            Rejoignez <em>la maison.</em>
          </h2>
          <p>
            Créez votre compte pour commander plus vite, suivre vos livraisons et profiter de nos
            offres fidélité.
          </p>
        </div>
        <span className="auth__note">Gastronomie béninoise · Cotonou</span>
      </aside>

      {/* Formulaire papier */}
      <main className="auth__panel">
        <div className="auth__card">
          <div className="auth__head">
            <p className="auth__eyebrow">Bienvenue</p>
            <h1 className="auth__title">
              Créer un <em>compte</em>
            </h1>
            <p className="auth__sub">Quelques informations et c'est parti.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1.4rem' }}>
              <div className="grid2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <span className="rlabel">Prénom</span>
                      <FormControl>
                        <input className="rinput" placeholder="Aïcha" {...field} />
                      </FormControl>
                      <FormMessage className="rerror" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <span className="rlabel">Nom</span>
                      <FormControl>
                        <input className="rinput" placeholder="Tossou" {...field} />
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

              <div className="grid2">
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
                            aria-label={showPassword ? 'Masquer' : 'Afficher'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="rerror" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <span className="rlabel">Confirmer</span>
                      <FormControl>
                        <input type="password" className="rinput" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage className="rerror" />
                    </FormItem>
                  )}
                />
              </div>

              <button type="submit" className="bb-btn news__btn" style={{ width: '100%' }} disabled={isLoading}>
                {isLoading ? 'Création…' : 'Créer mon compte'}
              </button>
            </form>
          </Form>

          <p className="auth__foot">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
