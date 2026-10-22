import Link from "next/link";
import { neighbours } from "@/content/modules";
import { themeDuModule } from "@/content/rubriques";

/** Liens « précédent / suivant » en bas de chaque page de module. */
export function NavModule({ module, section }: { module: string; section?: string }) {
  const { previous, next } = neighbours(module, section);
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
        <Link href={next.href} className="rounded-2xl border border-line bg-surface p-4 text-right hover:border-line-strong">
          <span className="text-sm text-muted">Suivant →</span>
          <span className="mt-1 block font-semibold text-ink">{next.title}</span>
          {next.module.slug !== module && (
            <span className="mt-0.5 block text-sm text-muted">{themeDuModule(next.module.slug).titre}</span>
          )}
        </Link>
      )}
    </nav>
  );
}
