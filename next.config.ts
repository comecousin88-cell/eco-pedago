import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100 % statique : `next build` produit le dossier `out/`,
  // déployable tel quel sur Vercel, Netlify ou n'importe quel hébergeur.
  output: "export",
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  // `cacheComponents` et `partialPrefetching` ne marchent qu'avec un serveur
  // Node : incompatibles avec l'export statique (« PPR cannot be enabled in
  // export mode »).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({
  options: {
    // Noms en chaînes de caractères : obligatoire avec Turbopack.
    remarkPlugins: ["remark-gfm", "remark-math"],
    rehypePlugins: ["rehype-katex"],
  },
});

export default withMDX(nextConfig);
