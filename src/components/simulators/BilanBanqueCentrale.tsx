"use client";

import { annulerTitres, resultatBanqueCentrale } from "@/lib/economics";
import { formatEuros, formatNombre } from "@/lib/format";
import { BoutonSimu, Curseur } from "./Curseur";
import { BarreScenario, MarqueModifie, useScenario } from "./Scenario";

/**
 * Le bilan simplifié d'une banque centrale, avec 100 € fictifs : elle a acheté
 * 100 € d'OAT (actif, coupon fixe) en créant 100 € de réserves pour les
 * banques (passif, rémunérées au taux de dépôt, variable).
 */
type Scenario = "normal" | "hausse" | "annulation";

const SCENARIOS: Record<Scenario, { titre: string; texte: string }> = {
  normal: {
    titre: "1. Situation normale",
    texte:
      "Les titres rapportent leur coupon, les réserves ne coûtent presque rien. La banque centrale fait un bénéfice, qu'elle reverse en grande partie à l'État : l'opération est presque neutre pour les finances publiques.",
  },
  hausse: {
    titre: "2. Hausse des taux",
    texte:
      "Pour freiner l'inflation, la banque centrale relève le taux qu'elle verse sur les réserves. Ses titres, achetés quand les taux étaient bas, rapportent toujours le même coupon : elle paie plus qu'elle ne reçoit et perd de l'argent. Plus de bénéfice à reverser à l'État.",
  },
  annulation: {
    titre: "3. Annulation des titres",
    texte:
      "On efface les 100 € d'OAT : l'État ne les doit plus. Mais les 100 € de réserves restent dus aux banques, qui peuvent les utiliser à tout moment. L'actif disparaît, le passif reste : les fonds propres deviennent très négatifs.",
  },
};

const BASE = { titres: 100, coupon: 0.01, reserves: 95, fondsPropres: 5 };

export function BilanBanqueCentrale() {
  const s = useScenario({ scenario: "normal" as Scenario, tauxDepot: 3 });
  const scenario = s.valeurs.scenario;
  const tauxDepot = s.valeurs.tauxDepot;

  const bilan = { ...BASE, tauxDepot: scenario === "normal" ? 0 : tauxDepot / 100 };
  const res = scenario === "annulation" ? annulerTitres({ ...bilan, tauxDepot: 0 }) : resultatBanqueCentrale(bilan);
  const actif = scenario === "annulation" ? 0 : BASE.titres;
  const fp = scenario === "annulation" ? res.fondsPropresApres : BASE.fondsPropres + res.resultat;
  // Hauteur du dessin : la plus grande des deux colonnes, pour que tout tienne.
  const echelle = Math.max(actif, BASE.reserves + Math.abs(fp)) * 1.05;

  return (
    <div className="space-y-5">
      <BarreScenario scenario={s} libelleReference="valeurs de départ" />
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(SCENARIOS) as Scenario[]).map((sc) => (
          <BoutonSimu key={sc} onClick={() => s.regler("scenario")(sc)} actif={scenario === sc}>
            {SCENARIOS[sc].titre}
          </BoutonSimu>
        ))}
        <MarqueModifie actif={s.estModifiee("scenario")} />
      </div>

      {scenario === "hausse" && (
        <Curseur
          libelle="Taux versé sur les réserves (taux de dépôt)"
          valeur={tauxDepot}
          reference={s.reference.tauxDepot}
          affichageReference={`${formatNombre(s.reference.tauxDepot, 2)} %`}
          min={0}
          max={5}
          pas={0.25}
          onChange={s.regler("tauxDepot")}
          affichage={`${formatNombre(tauxDepot, 2)} %`}
          aide="Les titres rapportent toujours 1 % (coupon fixé à l'achat)."
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Colonne echelle={echelle} titre="Actif (ce qu'elle possède)" blocs={[{ libelle: "OAT", valeur: actif, couleur: "var(--series-1)" }]} />
        <Colonne
          echelle={echelle}
          titre="Passif (ce qu'elle doit, et ses fonds propres)"
          blocs={[
            { libelle: "Réserves des banques", valeur: BASE.reserves, couleur: "var(--series-2)" },
            { libelle: "Fonds propres", valeur: fp, couleur: fp < 0 ? "var(--bad)" : "var(--series-3)", negatif: fp < 0 },
          ]}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl bg-subtle p-3 text-sm">
          <p className="text-muted">Intérêts reçus sur les OAT</p>
          <p className="font-serif text-2xl font-semibold text-ink">{formatEuros(res.revenus)}</p>
        </div>
        <div className="rounded-xl bg-subtle p-3 text-sm">
          <p className="text-muted">Intérêts versés aux banques</p>
          <p className="font-serif text-2xl font-semibold text-ink">{formatEuros(res.charges)}</p>
        </div>
        <div className={`rounded-xl p-3 text-sm ${res.resultat < 0 ? "bg-bad-soft" : "bg-ok-soft"}`}>
          <p className="text-muted">{scenario === "annulation" ? "Perte due à l'annulation" : "Résultat de l'année"}</p>
          <p className={`font-serif text-2xl font-semibold ${res.resultat < 0 ? "text-bad" : "text-ok"}`}>
            {res.resultat >= 0 ? "+" : "−"}
            {formatEuros(Math.abs(res.resultat))}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-body">{SCENARIOS[scenario].texte}</p>
      <p className="text-xs text-muted">
        Bilan fictif et très simplifié : 100 € d&apos;OAT à 1 %, financés par 95 € de réserves et 5 € de fonds propres. Dans
        la réalité, les achats de titres d&apos;État sont décidés par l&apos;Eurosystème et réalisés par chaque banque centrale
        nationale.
      </p>
    </div>
  );
}

function Colonne({
  titre,
  blocs,
  echelle,
}: {
  titre: string;
  blocs: { libelle: string; valeur: number; couleur: string; negatif?: boolean }[];
  echelle: number;
}) {
  const visibles = blocs.filter((b) => Math.abs(b.valeur) > 0.01);
  return (
    <div className="flex flex-col">
      <p className="text-center text-sm font-semibold text-ink">{titre}</p>
      <div className="mt-2 flex h-56 flex-col-reverse gap-0.5 rounded-lg border border-line bg-subtle p-1">
        {visibles.map((b) => (
          <div
            key={b.libelle}
            className="flex items-center justify-center rounded px-1 text-center text-xs font-semibold transition-all duration-500"
            style={{
              height: `${(Math.abs(b.valeur) / echelle) * 100}%`,
              minHeight: "1.5rem",
              background: b.couleur,
              color: "var(--surface)",
              // Hachures : une valeur négative (un « trou »), lisible sans la couleur.
              backgroundImage: b.negatif
                ? "repeating-linear-gradient(45deg, transparent 0 6px, color-mix(in oklab, var(--surface) 35%, transparent) 6px 8px)"
                : undefined,
            }}
          >
            {b.libelle} : {b.valeur < 0 ? "−" : ""}
            {formatEuros(Math.abs(b.valeur), 0)}
          </div>
        ))}
        {visibles.length === 0 && <p className="m-auto text-sm text-muted">vide (titres annulés)</p>}
      </div>
    </div>
  );
}
