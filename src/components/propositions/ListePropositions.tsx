"use client";

import { useEtatConserve } from "@/lib/etat-conserve";
import type { NiveauVerdict } from "@/components/pedago/Encadres";
import { CarteProposition, type CarteFiche } from "./CarteProposition";

const VERDICTS: { v: NiveauVerdict | "tous"; l: string }[] = [
  { v: "tous", l: "Tous les verdicts" },
  { v: "solide", l: "Mécanisme solide" },
  { v: "debattu", l: "Débattu" },
  { v: "ne-tient-pas", l: "Ne tient pas en l'état" },
];

function Filtre<T extends string>({
  libelle,
  options,
  valeur,
  onChange,
}: {
  libelle: string;
  options: { v: T; l: string }[];
  valeur: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={libelle} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-ink">{libelle}</span>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={valeur === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
            valeur === o.v ? "border-ink bg-ink text-page" : "border-line text-muted hover:text-ink"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

/**
 * Toutes les fiches en cartes, filtrables par thème et par verdict. Les fiches
 * pas encore rédigées sont listées comme « bientôt » (sans verdict, elles
 * disparaissent dès qu'on filtre par verdict).
 */
export function ListePropositions({ propositions, themes }: { propositions: CarteFiche[]; themes: readonly string[] }) {
  // Filtres gardés pour la visite : en revenant sur la liste, on les retrouve.
  const [theme, setTheme] = useEtatConserve("propositions:theme", "tous");
  const [verdict, setVerdict] = useEtatConserve<NiveauVerdict | "tous">("propositions:verdict", "tous");
  const visibles = propositions.filter(
    (p) => (theme === "tous" || p.themes.includes(theme)) && (verdict === "tous" || (p.redigee && p.verdict === verdict)),
  );

  return (
    <div className="mt-8">
      <div className="space-y-3">
        <Filtre
          libelle="Thème"
          options={[{ v: "tous", l: "Tous les thèmes" }, ...themes.map((t) => ({ v: t, l: t }))]}
          valeur={theme}
          onChange={setTheme}
        />
        <Filtre libelle="Verdict" options={VERDICTS} valeur={verdict} onChange={setVerdict} />
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {visibles.length} fiche{visibles.length > 1 ? "s" : ""}
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((p) => (
          <li key={p.slug}>
            <CarteProposition fiche={p} titreNiveau="h2" />
          </li>
        ))}
      </ul>
      {visibles.length === 0 && <p className="mt-6 text-muted">Aucune fiche rédigée ne correspond à ces filtres pour l&apos;instant.</p>}
    </div>
  );
}
