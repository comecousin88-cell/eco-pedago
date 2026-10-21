import Link from "next/link";
import { BadgeVerdict } from "@/components/pedago/Encadres";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { SoonBadge } from "@/components/ui/SoonBadge";
import { rubriqueColors } from "@/content/modules";
import { propositionHref, propositionsLiees } from "@/content/propositions";

/**
 * Encadré « Une proposition liée », en fin de section de module : renvoie vers
 * les fiches qui s'appuient sur le mécanisme expliqué dans la page. Il prend la
 * couleur de la rubrique « propositions » pour signaler qu'on en change.
 */
export function PropositionsLiees({ module, section }: { module: string; section?: string }) {
  const liees = propositionsLiees(module, section);
  if (liees.length === 0) return null;
  return (
    <ModuleTheme color={rubriqueColors.propositions}>
      <aside
        aria-labelledby="proposition-liee"
        className="mt-10 rounded-2xl border border-l-4 border-line border-l-accent bg-surface p-5"
      >
        <p id="proposition-liee" className="text-sm font-semibold tracking-wide text-muted uppercase">
          {liees.length > 1 ? "Des propositions liées" : "Une proposition liée"}
        </p>
        <ul className="mt-3 space-y-3">
          {liees.map((p) => (
            <li key={p.slug} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              {p.contenu ? (
                <Link
                  href={propositionHref(p.slug)}
                  className="font-serif text-lg font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {p.titre} <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="font-serif text-lg font-semibold text-muted">{p.titre}</span>
              )}
              {p.contenu && p.verdict ? <BadgeVerdict niveau={p.verdict} /> : <SoonBadge />}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Ce que vaut cette idée qu&apos;on entend dans le débat, à la lumière de ce que vous venez de lire.{" "}
          <Link href="/propositions/" className="underline underline-offset-4 hover:text-ink">
            Toutes les propositions au crible
          </Link>
        </p>
      </aside>
    </ModuleTheme>
  );
}
