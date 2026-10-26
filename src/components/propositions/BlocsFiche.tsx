import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { BadgeVerdict, type NiveauVerdict } from "@/components/pedago/Encadres";
import { getModule, moduleHref } from "@/content/modules";

/**
 * Les blocs des fiches « Propositions au crible » refondues (voir
 * PARTIES_FICHE dans src/content/propositions.ts). Chaque bloc est utilisé
 * dans le MDX de la fiche, sous le titre de sa partie.
 */

/** « En 30 secondes » : la proposition en une phrase, ce qui tient, ce qui coince, ce qui reste débattu, et le verdict. */
export function En30Secondes({
  proposition,
  tient,
  coince,
  debattu,
  verdict,
}: {
  proposition: ReactNode;
  tient: ReactNode;
  coince: ReactNode;
  debattu: ReactNode;
  verdict: NiveauVerdict;
}) {
  const lignes = [
    { icone: "✓", titre: "Ce qui tient", texte: tient, couleur: "text-ok" },
    { icone: "✗", titre: "Ce qui coince", texte: coince, couleur: "text-bad" },
    { icone: "?", titre: "Ce qui reste débattu", texte: debattu, couleur: "text-warn" },
  ];
  return (
    <div data-bloc="En 30 secondes" className="my-4 rounded-2xl border-2 border-accent-line bg-surface p-5 sm:p-6">
      <p className="font-serif text-lg leading-snug font-semibold text-ink sm:text-xl">{proposition}</p>
      <ul className="mt-4 space-y-3">
        {lignes.map((l) => (
          <li key={l.titre} className="flex gap-3 leading-relaxed text-body">
            <span aria-hidden="true" className={`w-4 shrink-0 text-center font-bold ${l.couleur}`}>
              {l.icone}
            </span>
            <span>
              <strong className="text-ink">{l.titre} : </strong>
              {l.texte}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
        Verdict : <BadgeVerdict niveau={verdict} />
      </p>
    </div>
  );
}

/** « Pour bien suivre cette fiche » : le module à lire avant, pour qui découvre le sujet. */
export function PourBienSuivre({ module, section, children }: { module: string; section?: string; children?: ReactNode }) {
  const m = getModule(module);
  const s = section ? m.sections.find((x) => x.slug === section) : undefined;
  if (section && !s) throw new Error(`Section inconnue : ${module}/${section}`);
  return (
    <p className="my-4 rounded-2xl border border-line bg-surface p-4 leading-relaxed text-body">
      {children ?? "Vous découvrez le sujet ? Lisez d'abord"}{" "}
      <Link href={moduleHref(module, section)} className="font-medium text-accent underline underline-offset-4">
        le module {m.number}, « {m.title} »{s ? `, section « ${s.title} »` : ""}
      </Link>
      .
    </p>
  );
}

/** Ce qui n'apparaît qu'en mode Approfondi : le droit, les formules, les nuances, les tableaux de chiffres détaillés. */
export function EnApprofondi({ children }: { children: ReactNode }) {
  return (
    <div data-selon-mode="approfondi" data-bloc="Approfondi" className="prose-eco max-w-none">
      {children}
    </div>
  );
}

/** Le débat en dialogue : ce que dirait un partisan, ce que répondrait un sceptique. */
export function Dialogue({ partisan, sceptique }: { partisan: ReactNode; sceptique: ReactNode }) {
  const bulles = [
    { qui: "Ce que dirait un partisan", texte: partisan, cote: "sm:mr-12", pointe: "left-6" },
    { qui: "Ce que répondrait un sceptique", texte: sceptique, cote: "sm:ml-12", pointe: "right-6" },
  ];
  return (
    <div className="my-6 space-y-5">
      {bulles.map((b) => (
        <figure key={b.qui} className={b.cote}>
          <figcaption className="mb-2 text-sm font-semibold text-ink">{b.qui}</figcaption>
          <blockquote className="relative rounded-2xl border border-line bg-surface p-4 leading-relaxed text-body sm:p-5">
            <span aria-hidden="true" className={`absolute -top-1.5 ${b.pointe} h-3 w-3 rotate-45 border-t border-l border-line bg-surface`} />
            {b.texte}
          </blockquote>
        </figure>
      ))}
    </div>
  );
}

/** Ordres de grandeur parlants : chaque montant traduit en repères concrets. */
export function Reperes({ children }: { children: ReactNode }) {
  return <ul className="my-6 grid list-none gap-3 space-y-0 pl-0 sm:grid-cols-2">{children}</ul>;
}

export function Repere({ valeur, children }: { valeur: ReactNode; children: ReactNode }) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <p className="font-serif text-2xl font-semibold text-ink">{valeur}</p>
      <p className="mt-1 text-sm leading-relaxed text-body">{children}</p>
    </li>
  );
}

/** Une ligne d'un bilan simplifié : libellé et montant. */
export type LigneBilan = [ReactNode, ReactNode];

function Colonne({ titre, lignes }: { titre: string; lignes: LigneBilan[] }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{titre}</p>
      <ul className="mt-2 space-y-2">
        {lignes.map(([libelle, montant], i) => (
          <li key={i} className="rounded-lg bg-subtle px-3 py-2 text-sm">
            <span className="block text-body">{libelle}</span>
            <span className="block font-semibold text-ink">{montant}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Un bilan simplifié : ce que l'on possède (actif) et ce que l'on doit (passif). */
export function Bilan({ titre, actif, passif }: { titre: string; actif: LigneBilan[]; passif: LigneBilan[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="font-semibold text-ink">{titre}</p>
      <div className="mt-3 flex gap-3">
        <Colonne titre="Ce qu'elle possède" lignes={actif} />
        <Colonne titre="Ce qu'elle doit" lignes={passif} />
      </div>
    </div>
  );
}

/** Schéma avant / après : deux états côte à côte (l'un sous l'autre sur mobile), reliés par une flèche. */
export function SchemaAvantApres({ titre, avant, apres, legende }: { titre: string; avant: ReactNode; apres: ReactNode; legende?: ReactNode }) {
  return (
    <figure className="my-6 rounded-2xl border border-line bg-page p-4 sm:p-5">
      <figcaption className="font-semibold text-ink">{titre}</figcaption>
      <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        {avant}
        <span aria-hidden="true" className="text-center text-2xl text-accent md:rotate-0">
          <span className="md:hidden">↓</span>
          <span className="hidden md:inline">→</span>
        </span>
        {apres}
      </div>
      {legende && <p className="mt-4 text-sm leading-relaxed text-body">{legende}</p>}
    </figure>
  );
}

/** Schéma cause → effet : une chaîne d'étapes, en ligne sur grand écran, en colonne sur mobile. */
export function SchemaEtapes({ titre, etapes, legende }: { titre: string; etapes: ReactNode[]; legende?: ReactNode }) {
  return (
    <figure className="my-6 rounded-2xl border border-line bg-page p-4 sm:p-5">
      <figcaption className="font-semibold text-ink">{titre}</figcaption>
      <ol className="mt-4 flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {etapes.map((e, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <li aria-hidden="true" className="text-center text-xl text-accent">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </li>
            )}
            <li className="flex-1 rounded-xl bg-surface p-3 text-sm leading-relaxed text-body shadow-sm ring-1 ring-line">{e}</li>
          </Fragment>
        ))}
      </ol>
      {legende && <p className="mt-4 text-sm leading-relaxed text-body">{legende}</p>}
    </figure>
  );
}

/** « À quelles conditions ça pourrait marcher », sous le verdict. */
export function Conditions({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-2xl border-l-4 border-accent bg-accent-soft p-4 leading-relaxed text-body">
      <p className="font-semibold text-ink">À quelles conditions ça pourrait marcher</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
