import Link from "next/link";
import { moduleHref, modules, neighbours } from "@/content/modules";
import { themeDuModule } from "@/content/rubriques";
import { CarteSuivant } from "./CarteSuivant";

/** Liens « précédent / suivant » en bas de chaque page de module ; « Suivant » suit le verrouillage des sections. */
export function NavModule({ module, section }: { module: string; section?: string }) {
  const { previous, next } = neighbours(module, section);
  const sections = (modules.find((m) => m.slug === module)?.sections ?? []).map((s) => moduleHref(module, s.slug));
  return (
    <nav aria-label="Pages voisines" className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
      {previous ? (
        <Link href={previous.href} className="rounded-2xl border border-line bg-surface p-4 hover:border-line-strong">
          <span className="text-sm text-muted">← Précédent</span>
          <span className="mt-1 block font-semibold text-ink">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <CarteSuivant
          href={next.href}
          titre={next.title}
          sousTitre={next.module.slug !== module ? themeDuModule(next.module.slug).titre : undefined}
          sections={sections}
        />
      )}
    </nav>
  );
}
