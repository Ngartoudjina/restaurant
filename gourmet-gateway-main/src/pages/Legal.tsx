import { Layout } from '@/components/layout/Layout';
import { siteConfig } from '@/config/site';

export default function Legal() {
  return (
    <Layout>
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Mentions légales</h1>
          <p className="text-white/60">Dernière mise à jour : {new Date().getFullYear()}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral dark:prose-invert">
          <h2>Éditeur du site</h2>
          <p>
            Le présent site est édité par <strong>{siteConfig.legalName}</strong>, restaurant situé
            à {siteConfig.contact.addressFull}.
          </p>
          <ul>
            <li>Téléphone : {siteConfig.contact.phoneDisplay}</li>
            <li>
              Email :{' '}
              <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
            </li>
          </ul>

          <h2>Hébergement</h2>
          <p>
            Le site et son API sont hébergés sur des infrastructures cloud (Render, Firebase de
            Google, Cloudinary). Les coordonnées complètes des hébergeurs sont disponibles sur
            demande à l'adresse {siteConfig.contact.email}.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus présents sur ce site (textes, photographies, logos, éléments
            graphiques) est la propriété de {siteConfig.legalName}, sauf mention contraire. Toute
            reproduction ou utilisation sans autorisation préalable est interdite.
          </p>

          <h2>Responsabilité</h2>
          <p>
            {siteConfig.legalName} s'efforce d'assurer l'exactitude des informations diffusées
            (menu, prix, disponibilités) mais ne saurait être tenu responsable d'éventuelles erreurs
            ou indisponibilités. Les prix sont indiqués en francs CFA (FCFA), toutes taxes
            comprises.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question relative aux présentes mentions légales, vous pouvez nous écrire à{' '}
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.
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
