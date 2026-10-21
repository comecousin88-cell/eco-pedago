"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, GRILLE, Infobulle, Legende, nombreAxe } from "@/components/graphiques/commun";
import { Figure } from "@/components/pedago/Figure";
import { Curseur } from "@/components/simulators/Curseur";
import { BarreScenario, useScenario } from "@/components/simulators/Scenario";
import { getValeur } from "@/lib/data";
import { objectifsJeu, trajectoireRatioDette } from "@/lib/economics";
import { formatNombre } from "@/lib/format";
import {
  basculerMesure,
  bilanMesures,
  categories,
  DELAIS,
  mesures,
  PAYEURS,
  type Mesure,
  type Scenario,
} from "@/lib/game/mesures";

type Niveau = "budget" | "stabiliser" | "zero";
const ANNEES = 10;

const NIVEAUX: { id: Niveau; titre: string; texte: string }[] = [
  {
    id: "budget",
    titre: "Le budget de l'année",
    texte: "L'effort annuel minimal demandé par les règles européennes à un pays en déficit excessif. La dette continue de monter, un peu moins vite.",
  },
  {
    id: "stabiliser",
    titre: "Stabiliser la dette",
    texte: "Ramener le déficit au niveau où la dette cesse de grossir par rapport au PIB. On reste en déficit, mais le ratio de dette se stabilise.",
  },
  {
    id: "zero",
    titre: "Zéro déficit",
    texte: "Supprimer tout le déficit, comme la France ne l'a plus fait depuis 1974. La dette baisse alors en proportion du PIB.",
  },
];

const SCENARIOS: { id: Scenario; libelle: string }[] = [
  { id: "bas", libelle: "Prudent" },
  { id: "central", libelle: "Central" },
  { id: "haut", libelle: "Optimiste" },
];

const LIBELLE_DELAI = Object.fromEntries(DELAIS.map((d) => [d.id, d.libelle]));
const LIBELLE_PAYEUR = Object.fromEntries(PAYEURS.map((p) => [p.id, p.libelle]));

function md(v: number, dec = 1) {
  return `${formatNombre(v, dec)} Md€`;
}

/** Petite trajectoire en SVG : dette sans mesure (trait gris) et avec l'objectif atteint (trait d'accent). */
function MiniTrajectoire({ sans, avec }: { sans: number[]; avec: number[] }) {
  const L = 200;
  const H = 60;
  const tous = [...sans, ...avec];
  const min = Math.min(...tous) - 2;
  const max = Math.max(...tous) + 2;
  const chemin = (s: number[]) =>
    s.map((v, i) => `${i === 0 ? "M" : "L"}${((i / (s.length - 1)) * L).toFixed(1)},${(H - ((v - min) / (max - min)) * H).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${L} ${H}`} className="h-14 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={chemin(sans)} fill="none" stroke="var(--line-strong)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeDasharray="4 3" />
      <path d={chemin(avec)} fill="none" stroke="var(--accent)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function CarteMesure({
  m,
  choisie,
  scenario,
  bloqueePar,
  onBasculer,
}: {
  m: Mesure;
  choisie: boolean;
  scenario: Scenario;
  bloqueePar?: string;
  onBasculer: () => void;
}) {
  return (
    <li className={`rounded-xl border p-3 ${choisie ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={choisie} onChange={onBasculer} className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-medium text-ink">{m.intitule}</span>
            <span className="font-semibold whitespace-nowrap text-ink tabular-nums">{md(m.rendement[scenario])}</span>
          </span>
          <span className="mt-1 block text-sm text-body">{m.explication}</span>
          <span className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full bg-subtle px-2 py-0.5 text-muted">{m.nature === "depense" ? "Économie" : "Recette"}</span>
            <span className="rounded-full bg-subtle px-2 py-0.5 text-muted">{LIBELLE_DELAI[m.delai]}</span>
            {m.incertain && <span className="rounded-full bg-warn-soft px-2 py-0.5 font-medium text-warn">Rendement incertain</span>}
            {m.statut === "a_verifier" && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-warn">Chiffre à vérifier</span>}
          </span>
          <span className="mt-1.5 block text-xs text-muted">
            Qui paie : {m.payeurs.map((p) => LIBELLE_PAYEUR[p]).join(", ")}. Fourchette : {formatNombre(m.rendement.bas, 1)} à{" "}
            {formatNombre(m.rendement.haut, 1)} Md€. {m.calcul ? `Calcul : ${m.calcul}. ` : ""}
            {m.note ? `${m.note} ` : ""}
            Source :{" "}
            <a href={m.source.url} target="_blank" rel="noopener" className="underline underline-offset-2">
              {m.source.nom}
            </a>
          </span>
          {bloqueePar && !choisie && (
            <span className="mt-1 block text-xs text-muted">La choisir remplace la variante déjà retenue : « {bloqueePar} ».</span>
          )}
        </span>
      </label>
    </li>
  );
}

/**
 * Jeu « Redresser les comptes » : choisir un objectif (calculé à partir des
 * données), puis des mesures chiffrées pour l'atteindre. Le jeu montre les
 * montants, les délais et qui paie ; il ne qualifie aucune mesure.
 */
export function RedresserLesComptes() {
  const deficit = getValeur("deficit.montant");
  const deficitPct = getValeur("deficit.ratio-pib");
  const dette = getValeur("dette.fin-annee-pib");
  const pib = getValeur("macro.pib");
  const croissanceObservee = getValeur("macro.croissance-valeur");
  const effortMinimal = getValeur("ue.effort-structurel-minimal");

  const sc = useScenario({ croissance: croissanceObservee.valeur });
  const croissance = sc.valeurs.croissance;
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [ecran, setEcran] = useState<"choix" | "jeu" | "fin">("choix");
  const [scenario, setScenario] = useState<Scenario>("central");
  const [choisies, setChoisies] = useState<string[]>([]);

  const g = croissance / 100;
  const objectifs = objectifsJeu({
    deficitMd: deficit.valeur,
    deficitPct: deficitPct.valeur,
    dettePct: dette.valeur,
    pib: pib.valeur,
    croissanceNominale: g,
    effortMinimalPct: effortMinimal.valeur,
  });
  const trajectoire = (effortMd: number) => trajectoireRatioDette(dette.valeur, deficitPct.valeur - (effortMd / pib.valeur) * 100, g, ANNEES);
  const sansMesure = trajectoire(0);

  const bilan = useMemo(() => bilanMesures(choisies, scenario), [choisies, scenario]);
  const objectif = niveau ? objectifs[niveau] : 0;
  const progression = objectif > 0 ? Math.min(1, bilan.total / objectif) : 0;
  const cats = categories();

  if (ecran === "choix" || !niveau) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-serif text-xl font-semibold text-ink">Stabiliser la dette ou supprimer le déficit ?</h2>
          <p className="mt-2 text-body">
            Avec un déficit de {md(deficit.valeur)} ({formatNombre(deficitPct.valeur, 1)} % du PIB) en {deficit.date}, la
            dette continue de grossir plus vite que la richesse produite. <strong>Stabiliser la dette</strong>, c&apos;est réduire
            le déficit jusqu&apos;au niveau où le ratio dette/PIB cesse de monter : on reste en déficit, mais la croissance du PIB
            compense. <strong>Supprimer le déficit</strong>, c&apos;est aller plus loin : la dette cesse d&apos;augmenter en euros et
            baisse en proportion du PIB.
          </p>
          <div className="mt-4 max-w-md space-y-3">
            <BarreScenario scenario={sc} />
            <Curseur
              libelle="Croissance nominale retenue"
              valeur={croissance}
              min={0}
              max={5}
              pas={0.1}
              onChange={sc.regler("croissance")}
              reference={sc.reference.croissance}
              affichageReference={`${formatNombre(sc.reference.croissance, 1)} %`}
              affichage={`${formatNombre(croissance, 1)} %`}
              aide={`Volume et prix : ${formatNombre(croissanceObservee.valeur, 1)} % en ${croissanceObservee.date} selon l'Insee. Elle détermine le déficit qui stabilise la dette : ${formatNombre((dette.valeur * g) / (1 + g), 1)} % du PIB.`}
            />
          </div>
        </section>

        <ul className="grid gap-4 md:grid-cols-3">
          {NIVEAUX.map((n, i) => {
            const montant = objectifs[n.id];
            const avec = trajectoire(montant);
            return (
              <li key={n.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
                <p className="text-xs font-semibold tracking-wide text-accent uppercase">Niveau {i + 1}</p>
                <h3 className="mt-1 font-serif text-lg font-semibold text-ink">{n.titre}</h3>
                <p className="mt-2 font-serif text-3xl font-semibold text-ink tabular-nums">{md(montant, 0)}</p>
                <p className="text-sm text-muted">par an, soit {formatNombre((montant / pib.valeur) * 100, 1)} point de PIB</p>
                <p className="mt-3 text-sm text-body">{n.texte}</p>
                <div className="mt-3">
                  <MiniTrajectoire sans={sansMesure} avec={avec} />
                  <p className="text-xs text-muted">
                    Dette dans {ANNEES} ans : {formatNombre(avec[ANNEES], 0)} % du PIB (contre {formatNombre(sansMesure[ANNEES], 0)} % sans
                    mesure, tirets).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNiveau(n.id);
                    setEcran("jeu");
                  }}
                  className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-medium text-page hover:opacity-85"
                >
                  Choisir cet objectif
                </button>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-muted">
          Comment les objectifs sont calculés : niveau 1, {formatNombre(effortMinimal.valeur, 1)} point de PIB ({effortMinimal.source.nom}) ;
          niveau 2, le déficit actuel moins le déficit qui stabilise la dette, avec la croissance choisie ; niveau 3, tout le
          déficit de {deficit.date}. Les trajectoires supposent un déficit constant en points de PIB, sans effet des mesures
          sur la croissance ni sur les taux.
        </p>
      </div>
    );
  }

  const n = NIVEAUX.find((x) => x.id === niveau)!;
  const avecMesures = trajectoire(bilan.total);
  const maxPayeur = Math.max(1, ...Object.values(bilan.parPayeur));

  const panneau = (
    <div className="space-y-5 rounded-2xl border border-line bg-surface p-4">
      <div>
        <p className="text-sm text-muted">Objectif : {n.titre}</p>
        <p className="mt-1 font-serif text-2xl font-semibold text-ink tabular-nums" aria-live="polite">
          {md(bilan.total)} <span className="text-base font-normal text-muted">sur {md(objectif, 0)}</span>
        </p>
        <div
          role="progressbar"
          aria-label="Progression vers l'objectif"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progression * 100)}
          className="mt-2 h-3 overflow-hidden rounded-full bg-subtle"
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${progression * 100}%` }} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {formatNombre((bilan.total / pib.valeur) * 100, 2)} point de PIB ·{" "}
          {bilan.total >= objectif ? "objectif atteint" : `il manque ${md(objectif - bilan.total)}`}
        </p>
      </div>

      <div role="group" aria-label="Hypothèse de rendement" className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Rendements :</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={scenario === s.id}
            onClick={() => setScenario(s.id)}
            className={`rounded-full border px-3 py-1 ${scenario === s.id ? "border-ink bg-ink text-page" : "border-line text-muted hover:text-ink"}`}
          >
            {s.libelle}
          </button>
        ))}
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">Qui paie</p>
        <ul className="mt-2 space-y-1.5">
          {PAYEURS.map((p) => (
            <li key={p.id} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-body">{p.libelle}</span>
                <span className="text-ink tabular-nums">{md(bilan.parPayeur[p.id])}</span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-subtle" aria-hidden="true">
                <div className="h-full rounded-full bg-line-strong" style={{ width: `${(bilan.parPayeur[p.id] / maxPayeur) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-muted">Approximation : chaque mesure est répartie à parts égales entre ceux qui la paient.</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">Réalisme</p>
        <ul className="mt-1 space-y-0.5 text-sm text-body">
          {DELAIS.map((d) => (
            <li key={d.id} className="flex justify-between gap-2">
              <span>{d.libelle}</span>
              <span className="tabular-nums">{bilan.total > 0 ? formatNombre((bilan.parDelai[d.id] / bilan.total) * 100, 0) : 0} %</span>
            </li>
          ))}
          <li className="flex justify-between gap-2">
            <span>Rendement incertain</span>
            <span className="tabular-nums">{formatNombre(bilan.partIncertaine * 100, 0)} %</span>
          </li>
          <li className="flex justify-between gap-2 border-t border-line pt-1">
            <span>Économies / recettes</span>
            <span className="tabular-nums">
              {md(bilan.depenses, 0)} / {md(bilan.recettes, 0)}
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setEcran("fin")} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-page hover:opacity-85">
          Voir le résultat
        </button>
        <button type="button" onClick={() => setEcran("choix")} className="rounded-full border border-line px-4 py-2 text-sm text-body hover:text-ink">
          Changer d&apos;objectif
        </button>
      </div>
    </div>
  );

  if (ecran === "fin") {
    const ecart = bilan.total - objectif;
    const donneesCourbe = sansMesure.map((v, i) => ({ annee: `+${i}`, sans: v, avec: avecMesures[i] }));
    const topCategories = Object.entries(bilan.parCategorie).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return (
      <div className="space-y-6">
        <Figure
          titre={`Votre budget : ${n.titre.toLowerCase()}`}
          resume={`Vous avez retenu ${choisies.length} mesures pour ${md(bilan.total)} par an (hypothèse ${{ bas: "prudente", central: "centrale", haut: "optimiste" }[scenario]}), face à un objectif de ${md(objectif, 0)}. La courbe compare la dette en % du PIB sur ${ANNEES} ans avec et sans ces mesures.`}
          donnees={["deficit.montant", "deficit.ratio-pib", "dette.fin-annee-pib", "macro.pib", "macro.croissance-valeur", "ue.effort-structurel-minimal"]}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-subtle p-3">
              <p className="text-sm text-muted">Effort trouvé</p>
              <p className="font-serif text-2xl font-semibold text-ink tabular-nums">{md(bilan.total)}</p>
              <p className="text-sm text-muted">{formatNombre((bilan.total / pib.valeur) * 100, 1)} point de PIB</p>
            </div>
            <div className="rounded-xl bg-subtle p-3">
              <p className="text-sm text-muted">Écart à l&apos;objectif</p>
              <p className="font-serif text-2xl font-semibold text-ink tabular-nums">
                {ecart >= 0 ? "+" : "−"}
                {md(Math.abs(ecart))}
              </p>
              <p className="text-sm text-muted">{ecart >= 0 ? "objectif atteint" : "objectif non atteint"}</p>
            </div>
            <div className="rounded-xl bg-subtle p-3">
              <p className="text-sm text-muted">Économies / recettes</p>
              <p className="font-serif text-2xl font-semibold text-ink tabular-nums">
                {bilan.total > 0 ? formatNombre((bilan.depenses / bilan.total) * 100, 0) : 0} % /{" "}
                {bilan.total > 0 ? formatNombre((bilan.recettes / bilan.total) * 100, 0) : 0} %
              </p>
              <p className="text-sm text-muted">de l&apos;effort</p>
            </div>
          </div>

          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donneesCourbe} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid {...GRILLE} />
                <XAxis dataKey="annee" {...AXE} />
                <YAxis {...AXE} width={44} tickFormatter={nombreAxe} domain={["auto", "auto"]} />
                <ReferenceLine y={dette.valeur} stroke="var(--muted)" strokeDasharray="2 4" />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <Infobulle
                        titre={`Année ${label}`}
                        lignes={[
                          { libelle: "Sans mesure", couleur: "var(--line-strong)", valeur: `${formatNombre(Number(payload[0].payload.sans), 1)} % du PIB` },
                          { libelle: "Avec vos mesures", couleur: "var(--accent)", valeur: `${formatNombre(Number(payload[0].payload.avec), 1)} % du PIB` },
                        ]}
                      />
                    ) : null
                  }
                />
                <Line dataKey="sans" stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                <Line dataKey="avec" stroke="var(--accent)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Legende
            elements={[
              { libelle: "Dette sans mesure (% du PIB)", couleur: "var(--line-strong)" },
              { libelle: "Dette avec vos mesures", couleur: "var(--accent)" },
            ]}
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-ink">Les catégories les plus sollicitées</p>
              <ol className="mt-1 list-decimal pl-5 text-sm text-body">
                {topCategories.map(([c, v]) => (
                  <li key={c}>
                    {c} : {md(v)}
                  </li>
                ))}
                {topCategories.length === 0 && <li className="list-none text-muted">Aucune mesure retenue.</li>}
              </ol>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Qui paie</p>
              <ul className="mt-1 text-sm text-body">
                {PAYEURS.filter((p) => bilan.parPayeur[p.id] > 0)
                  .sort((a, b) => bilan.parPayeur[b.id] - bilan.parPayeur[a.id])
                  .map((p) => (
                    <li key={p.id}>
                      {p.libelle} : {md(bilan.parPayeur[p.id])}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Figure>

        <section className="rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-body">
          <h2 className="font-semibold text-ink">Les limites de l&apos;exercice</h2>
          <p className="mt-2">
            Les rendements sont des estimations « toutes choses égales par ailleurs », à effet plein : ils ne tiennent compte
            ni de l&apos;effet des mesures sur la croissance, ni des réactions des ménages et des entreprises, sauf mention. Une
            baisse des dépenses ou une hausse des impôts freine un peu l&apos;activité, ce qui réduit leur effet sur le déficit à
            court terme. Les mesures à effet différé n&apos;agissent pas dès la première année, alors que la trajectoire les compte
            en entier. Les chiffres marqués « à vérifier » sont des ordres de grandeur en cours de documentation. Le détail des
            sources et des hypothèses figure sur la page{" "}
            <Link href="/sources/" className="underline underline-offset-4">
              Sources et méthode
            </Link>
            .
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEcran("jeu")} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-page hover:opacity-85">
            Modifier mes choix
          </button>
          <button
            type="button"
            onClick={() => {
              setChoisies([]);
              setEcran("choix");
            }}
            className="rounded-full border border-line px-4 py-2 text-sm text-body hover:text-ink"
          >
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-3">
        <p className="text-sm text-muted">
          Cochez des mesures pour atteindre l&apos;objectif. Les montants sont annuels, à effet plein. Certaines mesures sont des
          variantes d&apos;une même réforme : en choisir une remplace l&apos;autre.
        </p>
        {cats.map((c) => {
          const liste = mesures.filter((m) => m.categorie === c);
          const total = liste.filter((m) => choisies.includes(m.id)).reduce((s, m) => s + m.rendement[scenario], 0);
          return (
            <details key={c} className="rounded-2xl border border-line bg-page p-3" open={c === cats[0]}>
              <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-ink">
                <span>{c}</span>
                <span className="text-sm font-normal text-muted tabular-nums">{total > 0 ? md(total) : `${liste.length} mesures`}</span>
              </summary>
              <ul className="mt-3 space-y-2">
                {liste.map((m) => {
                  const rivale = m.groupe ? mesures.find((x) => x.groupe === m.groupe && x.id !== m.id && choisies.includes(x.id)) : undefined;
                  return (
                    <CarteMesure
                      key={m.id}
                      m={m}
                      choisie={choisies.includes(m.id)}
                      scenario={scenario}
                      bloqueePar={rivale?.intitule}
                      onBasculer={() => setChoisies((ch) => basculerMesure(ch, m.id))}
                    />
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
      <aside className="lg:sticky lg:top-20 lg:self-start">{panneau}</aside>
    </div>
  );
}
