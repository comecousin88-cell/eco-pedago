import Link from "next/link";
import { approfondiDuModule } from "@/content/approfondi";
import { estVide } from "@/lib/approfondi";

/**
 * Page d'introduction d'un module, mode Approfondi : ce que le module ajoute
 * à ce niveau, section par section (débats, formules, « Pour aller plus loin »).
 */
export function ApprofondiModule({ module }: { module: string }) {
  const sections = approfondiDuModule(module).filter((s) => !estVide(s.contenu));
  if (sections.length === 0) return null;
  return (
    <section data-selon-mode="approfondi" data-bloc="Pour aller plus loin dans ce module" aria-labelledby="approfondi-module" className="mt-10 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 id="approfondi-module" className="font-serif text-xl font-semibold text-ink">
        Pour aller plus loin dans ce module
      </h2>
      <p className="mt-1 text-sm text-muted">Les débats, formules et approfondissements de chaque section.</p>
      <ul className="mt-4 space-y-3 text-sm">
        {sections.map((s) => {
          const { plusLoin, debats, formules } = s.contenu;
          const elements = [
            plusLoin ? "« Pour aller plus loin »" : "",
            formules ? `${formules} formule${formules > 1 ? "s" : ""}` : "",
            debats.length ? `${debats.length} débat${debats.length > 1 ? "s" : ""}` : "",
          ].filter(Boolean);
          return (
            <li key={s.href}>
              <Link href={s.href} className="font-medium text-accent underline underline-offset-4">
                {s.titre}
              </Link>
              <span className="text-muted"> : {elements.join(", ")}</span>
              {debats.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-body">
                  {debats.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
