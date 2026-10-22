import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vitest/config";

/**
 * Les tests peuvent importer les fichiers .mdx (rendu des pages de module dans
 * les deux modes de lecture) : compilés avec les mêmes extensions que le site
 * (next.config.ts) et les composants de src/mdx-components.tsx.
 */
function mdx(): Plugin {
  return {
    name: "mdx-pour-les-tests",
    enforce: "pre",
    async transform(code, id) {
      if (!id.endsWith(".mdx")) return null;
      const [{ compile }, remarkGfm, remarkMath, rehypeKatex] = await Promise.all([
        import("@mdx-js/mdx"),
        import("remark-gfm"),
        import("remark-math"),
        import("rehype-katex"),
      ]);
      const sortie = await compile(code, {
        remarkPlugins: [remarkGfm.default, remarkMath.default],
        rehypePlugins: [rehypeKatex.default],
        providerImportSource: "@/mdx-components",
      });
      return { code: String(sortie), map: null };
    },
  };
}

export default defineConfig({
  plugins: [mdx()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
