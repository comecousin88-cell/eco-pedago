import { readFileSync } from "node:fs";
import { join } from "node:path";
import { analyserMdx, type ContenuApprofondi } from "@/lib/approfondi";
import { getModule, moduleHref } from "./modules";

/**
 * Contenu propre au mode « Approfondi », section par section, lu dans les
 * fichiers MDX à la construction du site (page d'introduction de chaque module).
 */
export function approfondiDuModule(slug: string): { href: string; titre: string; contenu: ContenuApprofondi }[] {
  const m = getModule(slug);
  return m.sections.map((s) => ({
    href: moduleHref(slug, s.slug),
    titre: s.title,
    contenu: analyserMdx(readFileSync(join(process.cwd(), "src", "content", "modules", slug, `${s.slug}.mdx`), "utf8")),
  }));
}
