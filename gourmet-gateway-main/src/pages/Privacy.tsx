import { Layout } from '@/components/layout/Layout';
import { siteConfig } from '@/config/site';

export default function Privacy() {
  return (
    <Layout>
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-white/60">Dernière mise à jour : {new Date().getFullYear()}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral dark:prose-invert">
          <p>
            {siteConfig.legalName} accorde une grande importance à la protection de vos données
            personnelles. Cette politique décrit quelles données nous collectons et comment nous les
            utilisons.
          </p>

          <h2>Données que nous collectons</h2>
          <ul>
            <li>
              <strong>Compte client</strong> : nom, prénom, email, téléphone, adresse de livraison.
            </li>
            <li>
              <strong>Commandes et réservations</strong> : articles commandés, montants, créneaux,
              demandes spéciales.
            </li>
            <li>
              <strong>Messages</strong> : contenu envoyé via le formulaire de contact.
            </li>
            <li>
              <strong>Données techniques</strong> : adresse IP et navigateur, à des fins de
              sécurité et de prévention du spam.
            </li>
          </ul>

          <h2>Utilisation des données</h2>
          <p>Vos données servent uniquement à :</p>
          <ul>
            <li>traiter vos commandes et réservations ;</li>
            <li>vous contacter à propos de votre commande ;</li>
            <li>vous envoyer nos offres si vous y avez consenti (newsletter) ;</li>
            <li>améliorer la qualité de notre service.</li>
          </ul>
          <p>
            Nous ne vendons jamais vos données à des tiers. L'authentification est gérée via
            Firebase (Google) et les images sont hébergées sur Cloudinary.
          </p>

          <h2>Conservation</h2>
          <p>
            Vos données sont conservées le temps nécessaire à la gestion de la relation client, puis
            supprimées ou anonymisées.
          </p>

          <h2>Vos droits</h2>
          <p>
            Vous pouvez demander l'accès, la rectification ou la suppression de vos données, ainsi
            que vous désinscrire de la newsletter, en écrivant à{' '}
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.
          </p>

          <h2>Cookies & stockage local</h2>
          <p>
            Le site utilise le stockage local du navigateur (panier, préférences, session) pour son
            bon fonctionnement. Aucun cookie publicitaire tiers n'est déposé.
          </p>

          <p className="text-sm text-muted-foreground">
            Ce document est fourni à titre informatif et doit être validé par un conseil juridique
            avant exploitation commerciale.
          </p>
        </div>
      </section>
    </Layout>
  );
}
