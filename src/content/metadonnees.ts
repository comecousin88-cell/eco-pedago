import type { Metadata } from "next";
import { site } from "./site";

/**
 * Métadonnées communes à toutes les pages : titre, description, Open Graph,
 * Twitter. L'image d'aperçu est produite par src/app/opengraph-image.tsx.
 */
export const titreAccueil = `${site.name} : l'économie expliquée simplement`;

export const metadataSite: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: {
    default: titreAccueil,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: titreAccueil,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: titreAccueil,
    description: site.description,
  },
};

/** Données structurées (schema.org) : le site et l'organisation qui le publie. */
export const jsonLdSite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#site`,
      name: site.name,
      url: `${site.url}/`,
      description: site.description,
      inLanguage: "fr-FR",
      publisher: { "@id": `${site.url}/#organisation` },
    },
    {
      "@type": "Organization",
      "@id": `${site.url}/#organisation`,
      name: site.name,
      url: `${site.url}/`,
      logo: `${site.url}/apple-icon.png`,
    },
  ],
};
