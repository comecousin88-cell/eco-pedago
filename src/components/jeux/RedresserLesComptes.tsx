"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, GRILLE, Infobulle, Legende, nombreAxe, VueTableau } from "@/components/graphiques/commun";
import { Figure } from "@/components/pedago/Figure";
import { InfobulleSource } from "@/components/pedago/InfobulleSource";
import { Curseur } from "@/components/simulators/Curseur";
import { BarreScenario, useScenario } from "@/components/simulators/Scenario";
import { CATEGORIES_JEU, IMPREVUS, PARTS_TOUCHEES, POPULARITE, SEUIL_GREVE, SONDAGES, type ChoixReaction, type Imprevu } from "@/content/jeu-redresser";
import { getSerie, getValeur, toutesLesDonnees } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { basculerMesure, bilanMesures, DELAIS, mesures, PAYEURS, type Mesure, type Scenario } from "@/lib/game/mesures";
import {
  ANNEES_JEU,
  bilanAnnee,
  coutPopularite,
  effortRequis,
  gouvernementTombe,
  imprevuDeLAnnee,
  jouerAnnee,
  noteFinale,
  objectifAtteint,
  partTouchee,
  phraseRealite,
  rendementPlein,
  simulerEffortUniforme,
  tirerImprevus,
  type Actives,
  type EtatJeu,
  type HypothesesJeu,
  type Niveau,
  type ResultatTour,
} from "@/lib/game/redresser";

const NIVEAUX: { id: Niveau; titre: string; texte: string }[] = [
  {
    id: "budget",
    titre: "Respecter les règles européennes",
    texte: "Faire chaque année l'effort minimal demandé à un pays en déficit excessif. La dette monte encore, mais moins vite.",
  },
  {
    id: "stabiliser",
    titre: "Stabiliser la dette",
    texte: "Ramener le déficit au niveau où la dette cesse de grossir par rapport au PIB. On reste en déficit, mais la dette ne pèse plus de plus en plus lourd.",
  },
  {
    id: "zero",
    titre: "Zéro déficit",
    texte: "Supprimer tout le déficit, ce qui n'est plus arrivé depuis 1974. La dette baisse alors par rapport au PIB. Très difficile.",
  },
];

const RENDEMENTS: { id: Scenario; libelle: string }[] = [
  { id: "bas", libelle: "Moins que prévu" },
  { id: "central", libelle: "Comme prévu" },
  { id: "haut", libelle: "Plus que prévu" },
];

const LIBELLE_PAYEUR = Object.fromEntries(PAYEURS.map((p) => [p.id, p.libelle]));
const LIBELLE_DELAI = Object.fromEntries(DELAIS.map((d) => [d.id, d.libelle]));
/** Nombre de mesures affichées par catégorie avant « Voir les autres ». */
const MAX_MESURES = 6;
const CALME = IMPREVUS.find((x) => x.id === "annee-calme")!;

const md = (v: number, dec = 1) => `${formatNombre(v, dec)} Md€`;
const pct = (v: number, dec = 1) => `${formatNombre(v, dec)} %`;
const BOUTON = "rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-page hover:opacity-85";
const BOUTON_2 = "rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-subtle";

/** État de départ : les dernières données publiées. */
function depart(croissanceTendance: number): { e: EtatJeu; h: HypothesesJeu; annee0: number } {
  const v = (id: string) => getValeur(id).valeur;
  const dette = getValeur("dette.fin-annee-pib");
  const solde = v("deficit.ratio-pib");
  const pib = v("macro.pib");
  const interetsPib = (v("fp.interets") / pib) * 100;
  const precedente = getSerie("dette.historique-md").serie.find((p) => p.x === String(Number(dette.date) - 1))!.y;
  const spread = v("marches.spread-dernier");
  return {
    annee0: Number(dette.date),
    e: {
      annee: 0,
      dette: dette.valeur,
      soldePublic: -solde,
      soldePrimaire: -solde + interetsPib,
      soldeStructurel: -solde + interetsPib,
      soldeHorsChocs: -solde,
      spreadHorsChocs: spread,
      croissanceHorsChocs: v("macro.croissance-valeur"),
      tauxApparent: (v("fp.interets") / precedente) * 100,
      spread,
      croissance: v("macro.croissance-valeur"),
      pib,
      chomage: getSerie("ind.chomage").serie.at(-1)!.y,
      popularite: POPULARITE.depart,
    },
    h: {
      croissanceTendance,
      multDepenses: v("ministre.multiplicateur-depenses"),
      multImpots: v("ministre.multiplicateur-impots"),
      multInvestissement: v("ministre.multiplicateur-investissement"),
      stabilisateurs: v("ministre.stabilisateurs"),
      reactionSpread: v("ministre.reaction-spread"),
      tauxAllemand: v("marches.taux10-allemagne-dernier"),
      maturite: v("aft.maturite-moyenne"),
      decoteMaturites: v("ministre.decote-maturites"),
      okun: v("ministre.okun"),
    },
  };
}

/** Les indicateurs, en mots simples, chacun avec son infobulle. */
const INDICATEURS: { id: string; libelle: string; aide: string; valeur: (e: EtatJeu, h: HypothesesJeu) => string; nombre: (e: EtatJeu, h: HypothesesJeu) => number; bon: "bas" | "haut" }[] = [
  {
    id: "deficit",
    libelle: "Déficit",
    aide: "Ce qui manque chaque année pour payer toutes les dépenses publiques, en part de la richesse produite. Il s'ajoute à la dette.",
    valeur: (e) => `${pct(-e.soldePublic)} du PIB`,
    nombre: (e) => -e.soldePublic,
    bon: "bas",
  },
  {
    id: "dette",
    libelle: "Dette",
    aide: "Tout ce que doivent l'État, la Sécurité sociale et les collectivités, en part de la richesse produite en un an.",
    valeur: (e) => `${pct(e.dette, 1)} du PIB`,
    nombre: (e) => e.dette,
    bon: "bas",
  },
  {
    id: "chomage",
    libelle: "Chômage",
    aide: "Part des actifs sans emploi. Les économies et les hausses d'impôts freinent un peu l'activité : le chômage peut monter.",
    valeur: (e) => pct(e.chomage),
    nombre: (e) => e.chomage,
    bon: "bas",
  },
  {
    id: "taux",
    libelle: "Taux à 10 ans",
    aide: "Le taux auquel l'État emprunte pour dix ans. Il s'applique peu à peu à toute la dette, à mesure qu'elle est renouvelée.",
    valeur: (e, h) => pct(h.tauxAllemand + e.spread / 100, 2),
    nombre: (e, h) => h.tauxAllemand + e.spread / 100,
    bon: "bas",
  },
  {
    id: "ecart",
    libelle: "Écart avec l'Allemagne",
    aide: "Ce que la France paie en plus de l'Allemagne pour emprunter à dix ans. Il monte quand les investisseurs doutent des comptes.",
    valeur: (e) => `${formatNombre(e.spread / 100, 2)} point`,
    nombre: (e) => e.spread / 100,
    bon: "bas",
  },
  {
    id: "popularite",
    libelle: "Popularité",
    aide: `La confiance des Français dans ton gouvernement. Chaque mesure en coûte, selon ce qu'elle rapporte et le nombre de personnes qui la paient. Sous ${POPULARITE.seuil}, le gouvernement tombe.`,
    valeur: (e) => `${formatNombre(e.popularite, 0)} / 100`,
    nombre: (e) => e.popularite,
    bon: "haut",
  },
];

function Indicateurs({ e, h, apres, titre }: { e: EtatJeu; h: HypothesesJeu; apres?: EtatJeu; titre?: string }) {
  return (
    <section aria-label={titre ?? "Indicateurs"} data-guide="indicateurs">
      {titre && <p className="mb-2 text-sm font-semibold text-ink">{titre}</p>}
      <dl className="grid grid-cols-2 gap-2">
        {INDICATEURS.map((i) => {
          const avant = i.nombre(e, h);
          const ensuite = apres ? i.nombre(apres, h) : avant;
          // Pas de flèche quand la valeur affichée ne change pas.
          const change = apres !== undefined && i.valeur(apres, h) !== i.valeur(e, h);
          const mieux = change && (i.bon === "bas" ? ensuite < avant : ensuite > avant);
          const pire = change && !mieux;
          const alerte = i.id === "popularite" && (apres ?? e).popularite < POPULARITE.seuil + 8;
          return (
            <div key={i.id} className={`rounded-xl p-2.5 ${alerte ? "bg-bad-soft" : "bg-subtle"}`}>
              <dt className="text-xs text-muted">
                <InfobulleSource source={i.aide}>{i.libelle}</InfobulleSource>
              </dt>
              <dd className="font-semibold text-ink tabular-nums">{i.valeur(apres ?? e, h)}</dd>
              {apres && (mieux || pire) && (
                <dd className={`text-xs ${mieux ? "text-ok" : "text-bad"}`}>
                  {ensuite < avant ? "↘" : "↗"} avant : {i.valeur(e, h)}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </section>
  );
}

/** Petite courbe en SVG, avec la première et la dernière valeur écrites ; `reference`, en tirets, sert de comparaison. */
function MiniCourbe({ points, libelles, format, couleur, reference }: { points: number[]; libelles: [string, string]; format: (v: number) => string; couleur: string; reference?: number[] }) {
  const L = 240;
  const H = 70;
  const tous = [...points, ...(reference ?? [])];
  const min = Math.min(...tous);
  const max = Math.max(...tous);
  const y = (v: number) => 8 + (H - 16) * (1 - (v - min) / (max - min || 1));
  const chemin = (s: number[]) => s.map((v, i) => `${i === 0 ? "M" : "L"}${((i / (s.length - 1)) * L).toFixed(1)},${y(v).toFixed(1)}`).join("");
  return (
    <div>
      <svg viewBox={`0 0 ${L} ${H}`} className="h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
        {reference && <path d={chemin(reference)} fill="none" stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />}
        <path d={chemin(points)} fill="none" stroke={couleur} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-xs text-muted tabular-nums">
        <span>
          {libelles[0]} : {format(points[0])}
        </span>
        <span>
          {libelles[1]} : {format(points[points.length - 1])}
        </span>
      </div>
    </div>
  );
}

/** Bulle du guide de la première année. */
const GUIDE: { cible: string; texte: string }[] = [
  { cible: "categories", texte: "Les mesures sont rangées par catégorie : économies sur les dépenses, ou recettes nouvelles. Choisis une catégorie." },
  { cible: "mesures", texte: "Coche les mesures que tu veux voter. Chacune dit ce qu'elle rapporte, quand, qui la paie, et sa source. Une mesure votée reste active les années suivantes." },
  { cible: "indicateurs", texte: "Les indicateurs montrent en direct l'effet de ton budget sur l'année : déficit, dette, chômage, taux, popularité. Touche un nom pour son explication." },
  { cible: "payeurs", texte: "« Qui paie » se remplit à chaque mesure : aucune n'est indolore." },
  { cible: "voter", texte: "Quand ton budget te convient, vote-le. Un imprévu tombera ensuite." },
];

function Bulle({ etape, onSuivant, onPasser }: { etape: number; onSuivant: () => void; onPasser: () => void }) {
  return (
    <div role="note" className="rounded-xl border border-accent bg-accent-soft p-3 text-sm text-ink">
      <p>
        <span className="mr-1.5 font-semibold text-accent">
          Guide {etape + 1}/{GUIDE.length}
        </span>
        {GUIDE[etape].texte}
      </p>
      <div className="mt-2 flex gap-3">
        <button type="button" onClick={onSuivant} className="font-medium text-accent underline underline-offset-4">
          {etape + 1 < GUIDE.length ? "Suivant" : "Compris"}
        </button>
        <button type="button" onClick={onPasser} className="text-muted underline underline-offset-4 hover:text-ink">
          Passer le guide
        </button>
      </div>
    </div>
  );
}

function CarteMesure({ m, scenario, choisie, active, depuis, rivale, onBasculer }: { m: Mesure; scenario: Scenario; choisie: boolean; active: boolean; depuis?: number; rivale?: string; onBasculer: () => void }) {
  const sondage = SONDAGES[m.id];
  return (
    <li className={`rounded-xl border p-3 ${active ? "border-line bg-subtle" : choisie ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
      <label className={`flex items-start gap-3 ${active ? "" : "cursor-pointer"}`}>
        <input type="checkbox" checked={active || choisie} disabled={active} onChange={onBasculer} className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-medium text-ink">{m.intitule}</span>
            <span className="font-semibold whitespace-nowrap text-ink tabular-nums">{md(m.rendement[scenario])}</span>
          </span>
          {active ? (
            <span className="mt-1 block text-sm text-muted">Votée en {depuis} : elle reste active.</span>
          ) : (
            <>
              <span className="mt-1 block text-sm text-body">{m.explication}</span>
              <span className="mt-2 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-subtle px-2 py-0.5 text-muted">{m.nature === "depense" ? "Économie" : "Recette"}</span>
                <span className="rounded-full bg-subtle px-2 py-0.5 text-muted">{LIBELLE_DELAI[m.delai]}</span>
                <span className="rounded-full bg-subtle px-2 py-0.5 text-muted">Popularité − {formatNombre(coutPopularite(m), 1)}</span>
                {m.statut === "a_verifier" && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-warn">Chiffre à vérifier</span>}
              </span>
              <span className="mt-1.5 block text-xs text-muted">
                Qui paie : {m.payeurs.map((p) => LIBELLE_PAYEUR[p]).join(", ")}. Fourchette : {formatNombre(m.rendement.bas, 1)} à {formatNombre(m.rendement.haut, 1)} Md€. Source :{" "}
                <a href={m.source.url} target="_blank" rel="noopener" className="underline underline-offset-2">
                  {m.source.nom}
                </a>
              </span>
              {sondage && (
                <span className="mt-1 block text-xs text-muted">
                  Sondage : {sondage.texte} ({" "}
                  <a href={sondage.source.url} target="_blank" rel="noopener" className="underline underline-offset-2">
                    {sondage.source.nom}
                  </a>{" "}
                  ). Pour information : il ne change pas la jauge.
                </span>
              )}
              {rivale && !choisie && <span className="mt-1 block text-xs text-muted">La choisir remplace « {rivale} ».</span>}
            </>
          )}
        </span>
      </label>
    </li>
  );
}

function QuiPaie({ ids, scenario }: { ids: string[]; scenario: Scenario }) {
  const bilan = bilanMesures(ids, scenario);
  const max = Math.max(1, ...Object.values(bilan.parPayeur));
  return (
    <section data-guide="payeurs" aria-label="Qui paie">
      <p className="text-sm font-semibold text-ink">Qui paie</p>
      <ul className="mt-2 space-y-1.5">
        {PAYEURS.map((p) => (
          <li key={p.id} className="text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-body">{p.libelle}</span>
              <span className="text-ink tabular-nums">{md(bilan.parPayeur[p.id])}</span>
            </div>
            <div className="mt-0.5 h-1.5 rounded-full bg-subtle" aria-hidden="true">
              <div className="h-full rounded-full bg-warn" style={{ width: `${(bilan.parPayeur[p.id] / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-muted">
        Économies : {md(bilan.depenses, 0)} · recettes : {md(bilan.recettes, 0)}. Chaque mesure est partagée à parts égales entre ceux qui la paient.
      </p>
    </section>
  );
}

type Ecran = "intro" | "objectif" | "annee" | "imprevu" | "bilan" | "fin";

interface Journal {
  annee: number;
  nouvelles: string[];
  imprevu: Imprevu;
  choix?: ChoixReaction;
  bilan: string;
  retiree?: string;
}

/**
 * « Redresser les comptes » : tu es ministre des Finances pour cinq ans. Un
 * objectif, cinq budgets, un imprévu par an, puis un bilan. Le jeu montre ce
 * que rapporte chaque mesure, quand, et qui la paie ; il ne dit pas lesquelles
 * sont bonnes. Toutes ses hypothèses sont affichées sous le jeu.
 */
export function RedresserLesComptes() {
  const croissanceData = getValeur("ministre.croissance-tendancielle");
  const effortMinimal = getValeur("ue.effort-structurel-minimal").valeur;
  const sc = useScenario({ croissance: croissanceData.valeur });
  const { e: e0, h, annee0 } = useMemo(() => depart(sc.valeurs.croissance), [sc.valeurs.croissance]);

  const [ecran, setEcran] = useState<Ecran>("intro");
  const [niveau, setNiveau] = useState<Niveau>("stabiliser");
  const [scenario, setScenario] = useState<Scenario>("central");
  const [graine, setGraine] = useState(1);
  const [etat, setEtat] = useState<EtatJeu>(e0);
  const [actives, setActives] = useState<Actives>({});
  const [historique, setHistorique] = useState<EtatJeu[]>([]);
  const [annee, setAnnee] = useState(0);
  const [selection, setSelection] = useState<string[]>([]);
  const [categorie, setCategorie] = useState(CATEGORIES_JEU[0].id);
  const [imprevu, setImprevu] = useState<Imprevu>(CALME);
  const [resultat, setResultat] = useState<ResultatTour | null>(null);
  const [journal, setJournal] = useState<Journal[]>([]);
  const [guide, setGuide] = useState<number | null>(0);
  const [toutVoir, setToutVoir] = useState(false);
  const haut = useRef<HTMLDivElement>(null);

  // À chaque nouvel écran, on remonte en haut du jeu.
  useEffect(() => {
    if (ecran !== "intro") haut.current?.scrollIntoView({ block: "start" });
  }, [ecran]);

  const montants = useMemo(
    () => Object.fromEntries(NIVEAUX.map((n) => [n.id, effortRequis(n.id, e0, h, effortMinimal)])) as Record<Niveau, number>,
    [e0, h, effortMinimal],
  );
  const sansMesure = useMemo(() => simulerEffortUniforme(e0, h, 0), [e0, h]);
  const tirage = useMemo(() => tirerImprevus(graine), [graine]);

  const commencer = () => {
    setEtat(e0);
    setActives({});
    setHistorique([]);
    setAnnee(0);
    setSelection([]);
    setJournal([]);
    setResultat(null);
    setGuide(0);
    setGraine(Math.floor(Math.random() * 1e9));
    setEcran("annee");
  };

  const toutes = [...Object.keys(actives), ...selection];
  const apercu = jouerAnnee(etat, actives, { annee, nouvelles: selection, imprevu: CALME }, h, scenario).etat;
  const objectif = montants[niveau];
  const progression = Math.min(1, rendementPlein({ ...actives, ...Object.fromEntries(selection.map((id) => [id, annee])) }, scenario) / objectif);

  const voter = () => {
    const imp = imprevuDeLAnnee(tirage, annee, selection, graine);
    setImprevu(imp);
    setGuide(null);
    if (imp.choix) setEcran("imprevu");
    else appliquer(imp, undefined);
  };

  const appliquer = (imp: Imprevu, choix: ChoixReaction | undefined) => {
    const r = jouerAnnee(etat, actives, { annee, nouvelles: selection, imprevu: imp, choix }, h, scenario);
    setResultat(r);
    setJournal((j) => [...j, { annee, nouvelles: selection, imprevu: imp, choix, retiree: r.retiree, bilan: bilanAnnee(etat, r.etat, r, imp, annee0 + annee + 1) }]);
    setHistorique((hs) => [...hs, r.etat]);
    setActives(r.actives);
    setEtat(r.etat);
    setEcran(imp.choix && !choix ? "imprevu" : "bilan");
  };

  const suite = () => {
    setSelection([]);
    if (gouvernementTombe(etat) || annee + 1 >= ANNEES_JEU) setEcran("fin");
    else {
      setAnnee(annee + 1);
      setEcran("annee");
    }
  };

  let contenu: ReactNode;

  if (ecran === "intro") {
    contenu = (
      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="font-serif text-xl leading-snug font-semibold text-ink sm:text-2xl">
          Tu es ministre des Finances pour 5 ans. Ta mission : redresser les comptes sans perdre la confiance des Français.
        </p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Choisis un objectif", "Stabiliser la dette, ou aller jusqu'à supprimer le déficit."],
            [`Vote ${ANNEES_JEU} budgets`, `De ${annee0 + 1} à ${annee0 + ANNEES_JEU}, avec des mesures réelles, chiffrées et sourcées. Un imprévu tombe chaque année.`],
            ["Garde la confiance", `Chaque mesure coûte en popularité. Sous ${POPULARITE.seuil} sur 100, le gouvernement tombe.`],
          ].map(([t, x], i) => (
            <li key={t} className="rounded-xl bg-subtle p-3">
              <p className="font-semibold text-ink">
                {i + 1}. {t}
              </p>
              <p className="mt-1 text-sm text-body">{x}</p>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setEcran("objectif")} className={BOUTON}>
            Commencer
          </button>
          <a href="#comment-fonctionne-le-jeu" className={BOUTON_2}>
            Comment fonctionne le jeu ?
          </a>
        </div>
        <p className="mt-3 text-sm text-muted">Une partie dure une dizaine de minutes.</p>
      </section>
    );
  } else if (ecran === "objectif") {
    const deficitsSans = [e0, ...sansMesure].map((x) => -x.soldePublic);
    contenu = (
      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-serif text-xl font-semibold text-ink">Stabiliser la dette ou supprimer le déficit ?</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center">
            <p className="text-body">
              <strong>Sans aucune mesure, le déficit ne reste pas stable : il passe de {pct(deficitsSans[0])} à {pct(deficitsSans[ANNEES_JEU])} du PIB d&apos;ici {annee0 + ANNEES_JEU}.</strong>{" "}
              La raison : les intérêts de la dette montent, à mesure que les emprunts anciens, contractés à bas taux, sont remplacés par des emprunts plus chers. Ne rien faire, c&apos;est déjà creuser le déficit.
            </p>
            <figure className="rounded-xl bg-subtle p-3">
              <figcaption className="text-xs font-semibold text-ink">Le déficit sans aucune mesure (% du PIB)</figcaption>
              <MiniCourbe points={deficitsSans} couleur="var(--bad)" libelles={[String(annee0), String(annee0 + ANNEES_JEU)]} format={(v) => pct(v)} />
            </figure>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <BarreScenario scenario={sc} />
              <Curseur
                libelle="Croissance de l'économie, en valeur"
                valeur={sc.valeurs.croissance}
                min={1}
                max={4.5}
                pas={0.1}
                onChange={sc.regler("croissance")}
                reference={sc.reference.croissance}
                affichageReference={pct(sc.reference.croissance)}
                affichage={pct(sc.valeurs.croissance)}
                aide="Volume et prix, hors effet de tes mesures et des imprévus. Plus elle est forte, plus l'objectif est facile."
              />
            </div>
            <div role="group" aria-label="Ce que rapportent les mesures" className="text-sm">
              <p className="font-semibold text-ink">Si les mesures rapportent…</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {RENDEMENTS.map((r) => (
                  <button key={r.id} type="button" aria-pressed={scenario === r.id} onClick={() => setScenario(r.id)} className={`rounded-full border px-3 py-1 ${scenario === r.id ? "border-ink bg-ink text-page" : "border-line text-muted hover:text-ink"}`}>
                    {r.libelle}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-muted">Chaque mesure a une fourchette sourcée. « Plus que prévu » prend le haut de la fourchette : c&apos;est le seul cas où le zéro déficit est atteignable.</p>
            </div>
          </div>
        </section>
        <ul className="grid gap-4 md:grid-cols-3">
          {NIVEAUX.map((n, i) => {
            const montant = montants[n.id];
            const avec = [e0, ...simulerEffortUniforme(e0, h, montant)].map((x) => x.dette);
            return (
              <li key={n.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
                <p className="text-xs font-semibold tracking-wide text-accent uppercase">Niveau {i + 1}</p>
                <h3 className="mt-1 font-serif text-lg font-semibold text-ink">{n.titre}</h3>
                <p className="mt-2 font-serif text-3xl font-semibold text-ink tabular-nums">≈ {md(montant, 0)}</p>
                <p className="text-sm text-muted">d&apos;effort par an en {annee0 + ANNEES_JEU}</p>
                <p className="mt-3 flex-1 text-sm text-body">{n.texte}</p>
                <div className="mt-3">
                  <MiniCourbe points={avec} reference={[e0, ...sansMesure].map((x) => x.dette)} couleur="var(--accent)" libelles={[String(annee0), String(annee0 + ANNEES_JEU)]} format={(v) => `${formatNombre(v, 0)} %`} />
                  <p className="text-xs text-muted">Dette en % du PIB avec l&apos;objectif atteint ; en tirets, sans mesure ({formatNombre(sansMesure[ANNEES_JEU - 1].dette, 0)} % en {annee0 + ANNEES_JEU}).</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNiveau(n.id);
                    commencer();
                  }}
                  className={`mt-4 ${BOUTON}`}
                >
                  Choisir cet objectif
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  } else if (ecran === "annee") {
    const cat = CATEGORIES_JEU.find((c) => c.id === categorie)!;
    // Les mesures déjà votées, puis les autres ; six au plus avant « Voir les autres ».
    const visibles = mesures
      .filter((m) => cat.categories.includes(m.categorie))
      .filter((m) => {
        const rivale = m.groupe ? mesures.find((x) => x.groupe === m.groupe && x.id !== m.id && actives[x.id] !== undefined) : undefined;
        return actives[m.id] !== undefined || !rivale;
      })
      .sort((a, b) => Number(actives[b.id] !== undefined) - Number(actives[a.id] !== undefined));
    const liste = toutVoir ? visibles : visibles.slice(0, MAX_MESURES);
    const n = NIVEAUX.find((x) => x.id === niveau)!;
    const etapeGuide = annee === 0 ? guide : null;
    const bulle = (cible: string) =>
      etapeGuide !== null && GUIDE[etapeGuide].cible === cible ? <Bulle etape={etapeGuide} onSuivant={() => setGuide(etapeGuide + 1 < GUIDE.length ? etapeGuide + 1 : null)} onPasser={() => setGuide(null)} /> : null;
    const panneau = (
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-4">
        <div>
          <p className="text-sm text-muted">Objectif : {n.titre}</p>
          <p className="font-serif text-xl font-semibold text-ink tabular-nums">
            {md(objectif * progression, 0)} <span className="text-base font-normal text-muted">sur ≈ {md(objectif, 0)}</span>
          </p>
          <div role="progressbar" aria-label="Progression vers l'objectif" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progression * 100)} className="mt-1 h-2.5 overflow-hidden rounded-full bg-subtle">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progression * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">Ce que rapporteront tes mesures une fois en place, face à l&apos;effort nécessaire.</p>
        </div>
        {bulle("indicateurs")}
        <Indicateurs e={etat} h={h} apres={apercu} titre={`Fin ${annee0 + annee + 1}, si l'année est calme`} />
        {bulle("payeurs")}
        <QuiPaie ids={toutes} scenario={scenario} />
        {bulle("voter")}
        <button type="button" onClick={voter} data-guide="voter" className={`w-full ${BOUTON}`}>
          Voter le budget {annee0 + annee + 1}
        </button>
      </div>
    );
    contenu = (
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Budget {annee0 + annee + 1} <span className="text-base font-normal text-muted">· année {annee + 1} sur {ANNEES_JEU}</span>
          </h2>
          <p className="text-sm text-muted">{selection.length ? `${selection.length} mesure(s) nouvelle(s)` : "Aucune mesure nouvelle pour l'instant"}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-3">
            {bulle("categories")}
            <div role="tablist" aria-label="Catégories de mesures" data-guide="categories" className="flex flex-wrap gap-1.5">
              {CATEGORIES_JEU.map((c) => {
                const nb = mesures.filter((m) => c.categories.includes(m.categorie) && toutes.includes(m.id)).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={c.id === categorie}
                    onClick={() => {
                      setCategorie(c.id);
                      setToutVoir(false);
                      if (etapeGuide === 0) setGuide(1);
                    }}
                    className={`rounded-full border px-3 py-1 text-sm ${c.id === categorie ? "border-ink bg-ink text-page" : "border-line text-body hover:bg-subtle"}`}
                  >
                    {c.titre}
                    {nb > 0 && <span className="ml-1 tabular-nums opacity-80">· {nb}</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted">
              {cat.sens === "economies" ? "Surtout des économies sur les dépenses" : "Surtout des recettes nouvelles"} · montants annuels, une fois la mesure en place.
            </p>
            {bulle("mesures")}
            <ul className="space-y-2" data-guide="mesures">
              {liste.map((m) => {
                const rivale = m.groupe ? mesures.find((x) => x.groupe === m.groupe && x.id !== m.id && toutes.includes(x.id)) : undefined;
                const active = actives[m.id] !== undefined;
                return (
                  <CarteMesure
                    key={m.id}
                    m={m}
                    scenario={scenario}
                    choisie={selection.includes(m.id)}
                    active={active}
                    depuis={active ? annee0 + actives[m.id] + 1 : undefined}
                    rivale={rivale?.intitule}
                    onBasculer={() => setSelection((s) => basculerMesure(s, m.id))}
                  />
                );
              })}
            </ul>
            {visibles.length > liste.length && (
              <button type="button" onClick={() => setToutVoir(true)} className="text-sm font-medium text-accent underline underline-offset-4">
                Voir les {visibles.length - liste.length} autres mesures de cette catégorie
              </button>
            )}
          </div>
          <aside className="lg:sticky lg:top-32 lg:self-start">{panneau}</aside>
        </div>
        {/* Sur mobile, l'essentiel reste visible en bas de l'écran. */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-surface/95 px-4 py-2 text-sm backdrop-blur lg:hidden">
          <span className="tabular-nums">
            Déficit {pct(-apercu.soldePublic)} · Popularité {formatNombre(apercu.popularite, 0)}
          </span>
          <button type="button" onClick={voter} className="rounded-full bg-ink px-4 py-1.5 font-medium text-page">
            Voter
          </button>
        </div>
      </div>
    );
  } else if (ecran === "imprevu") {
    contenu = (
      <section className="rounded-2xl border border-line border-t-4 border-t-warn bg-surface p-5">
        <p className="text-xs font-semibold tracking-wide text-warn uppercase">Imprévu {annee0 + annee + 1}</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">{imprevu.titre}</h2>
        <p className="mt-2 text-body">{imprevu.texte}</p>
        <p className="mt-3 font-semibold text-ink">Comment réagis-tu ?</p>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {imprevu.choix!.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => appliquer(imprevu, c)} className="h-full w-full rounded-xl border border-line bg-page p-4 text-left hover:border-ink">
                <span className="block font-semibold text-ink">{c.libelle}</span>
                <span className="mt-1 block text-sm text-body">{c.explication}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  } else if (ecran === "bilan" && resultat) {
    const j = journal[journal.length - 1];
    const avant = historique.length >= 2 ? historique[historique.length - 2] : e0;
    const tombe = gouvernementTombe(etat);
    contenu = (
      <section className="space-y-4 rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">Bilan {annee0 + annee + 1}</p>
        <div className="rounded-xl bg-subtle p-4">
          <p className="text-sm font-semibold text-ink">L&apos;imprévu : {j.imprevu.titre}</p>
          <p className="mt-1 text-sm text-body">{j.imprevu.texte}</p>
          {j.choix && <p className="mt-1 text-sm text-muted">Ta réaction : {j.choix.libelle.toLowerCase()}.</p>}
          {j.retiree && <p className="mt-1 text-sm text-muted">Mesure retirée : « {mesures.find((m) => m.id === j.retiree)?.intitule} ».</p>}
        </div>
        <p className="text-lg text-ink">{j.bilan}</p>
        <p className="text-sm">
          Pour comprendre :{" "}
          <Link href={j.imprevu.lien.href} className="font-medium text-accent underline underline-offset-4">
            {j.imprevu.lien.titre}
          </Link>
        </p>
        <Indicateurs e={avant} h={h} apres={etat} titre={`Fin ${annee0 + annee + 1}`} />
        {tombe && (
          <p role="alert" className="rounded-xl bg-bad-soft p-3 font-semibold text-bad">
            La popularité est passée sous {POPULARITE.seuil} : le gouvernement tombe.
          </p>
        )}
        <button type="button" onClick={suite} className={BOUTON}>
          {tombe ? "Voir ce qui s'est passé" : annee + 1 >= ANNEES_JEU ? "Voir le bilan final" : `Passer au budget ${annee0 + annee + 2}`}
        </button>
      </section>
    );
  } else {
    contenu = <Fin />;
  }

  function Fin() {
    const fin = historique[historique.length - 1] ?? e0;
    const chute = gouvernementTombe(fin);
    const atteint = !chute && historique.length === ANNEES_JEU && objectifAtteint(niveau, e0, historique, effortMinimal);
    const ids = Object.keys(actives);
    const bilan = bilanMesures(ids, scenario);
    const note = noteFinale({ atteint, progression: Math.min(1, rendementPlein(actives, scenario) / objectif), depart: e0, fin, chute });
    // Le même mandat sans aucune mesure, avec les mêmes imprévus (sans la grève, que seules des mesures provoquent).
    let s = e0;
    const sans: EtatJeu[] = [];
    for (let a = 0; a < historique.length; a++) {
      const imp = journal[a]?.imprevu.id === "greve" ? tirage[a] : (journal[a]?.imprevu ?? CALME);
      s = jouerAnnee(s, {}, { annee: a, nouvelles: [], imprevu: imp }, h, scenario).etat;
      sans.push(s);
    }
    const donnees = [e0, ...historique].map((x, i) => ({ annee: String(annee0 + i), avec: x.dette, sans: [e0, ...sans][i]?.dette }));
    const n = NIVEAUX.find((x) => x.id === niveau)!;
    const plusCheres = ids
      .map((id) => mesures.find((m) => m.id === id)!)
      .sort((a, b) => coutPopularite(b) - coutPopularite(a))
      .slice(0, 3);
    return (
      <div className="space-y-5">
        <Figure
          titre={chute ? "Le gouvernement est tombé" : `Mon plan : ${note.verdict.toLowerCase()}, ${note.note}/20`}
          resume={`Partie de « Redresser les comptes » : objectif « ${n.titre} », ${atteint ? "atteint" : "non atteint"}. Note ${note.note} sur 20. Dette en ${annee0 + historique.length} : ${formatNombre(fin.dette, 1)} % du PIB, contre ${formatNombre(sans.at(-1)?.dette ?? e0.dette, 1)} % sans mesure. ${ids.length} mesures, dont ${md(bilan.depenses, 0)} d'économies et ${md(bilan.recettes, 0)} de recettes.`}
          donnees={["deficit.ratio-pib", "dette.fin-annee-pib", "macro.pib", "fp.interets", "marches.spread-dernier", "ind.chomage"]}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-subtle p-3">
              <p className="text-sm text-muted">Note</p>
              <p className="font-serif text-3xl font-semibold text-ink tabular-nums">{note.note} / 20</p>
              <p className="text-sm text-body">{note.verdict}</p>
            </div>
            <div className="rounded-xl bg-subtle p-3">
              <p className="text-sm text-muted">Objectif : {n.titre.toLowerCase()}</p>
              <p className={`font-serif text-2xl font-semibold ${atteint ? "text-ok" : "text-bad"}`}>{atteint ? "Atteint" : "Non atteint"}</p>
              <p className="text-sm text-body">
                Déficit {annee0 + historique.length} : {pct(-fin.soldePublic)} du PIB
              </p>
            </div>
            <div className="rounded-xl bg-subtle p-3">
              <p className="text-sm text-muted">Économies / recettes</p>
              <p className="font-serif text-2xl font-semibold text-ink tabular-nums">
                {bilan.total > 0 ? formatNombre((bilan.depenses / bilan.total) * 100, 0) : 0} % / {bilan.total > 0 ? formatNombre((bilan.recettes / bilan.total) * 100, 0) : 0} %
              </p>
              <p className="text-sm text-body">{md(bilan.total, 0)} par an une fois en place</p>
            </div>
          </div>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donnees} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid {...GRILLE} />
                <XAxis dataKey="annee" {...AXE} />
                <YAxis {...AXE} width={44} tickFormatter={nombreAxe} domain={["auto", "auto"]} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <Infobulle
                        titre={`Fin ${label}`}
                        lignes={[
                          { libelle: "Avec ton plan", couleur: "var(--accent)", valeur: `${formatNombre(Number(payload[0].payload.avec), 1)} % du PIB` },
                          { libelle: "Sans mesure", couleur: "var(--line-strong)", valeur: `${formatNombre(Number(payload[0].payload.sans), 1)} % du PIB` },
                        ]}
                      />
                    ) : null
                  }
                />
                <Line dataKey="sans" stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                <Line dataKey="avec" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Legende
            elements={[
              { libelle: "Dette avec ton plan (% du PIB)", couleur: "var(--accent)" },
              { libelle: "Dette sans mesure, mêmes imprévus", couleur: "var(--line-strong)" },
            ]}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-ink">Tes mesures</p>
              <ul className="mt-1 space-y-0.5 text-sm text-body">
                {journal.map((j) =>
                  j.nouvelles
                    .filter((id) => id !== j.retiree)
                    .map((id) => (
                      <li key={id}>
                        {annee0 + j.annee + 1} · {mesures.find((m) => m.id === id)?.intitule}
                      </li>
                    )),
                )}
                {ids.length === 0 && <li className="text-muted">Aucune mesure votée.</li>}
              </ul>
            </div>
            <QuiPaie ids={ids} scenario={scenario} />
          </div>
        </Figure>

        {chute ? (
          <section className="rounded-2xl border border-line bg-surface p-5 text-body">
            <h2 className="font-semibold text-ink">Pourquoi le gouvernement est tombé</h2>
            <p className="mt-2">
              La popularité est passée sous {POPULARITE.seuil} sur 100. Les mesures qui ont coûté le plus :{" "}
              {plusCheres.map((m) => `« ${m.intitule} » (− ${formatNombre(coutPopularite(m), 1)})`).join(", ")}.
            </p>
            <p className="mt-2">
              Ce qui aurait pu l&apos;éviter : étaler les mesures sur plusieurs années, car l&apos;opinion s&apos;habitue un peu chaque année, et mêler des mesures qui touchent peu de monde à celles qui touchent tout le monde. Mais les mesures qui rapportent le plus sont souvent celles qui touchent le plus de monde.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-line bg-surface p-5 text-body">
            <h2 className="font-semibold text-ink">Et dans la réalité ?</h2>
            <p className="mt-2">{phraseRealite(bilan.depenses, bilan.recettes, niveau, atteint)}</p>
            <p className="mt-2 text-sm">
              Pour aller plus loin :{" "}
              <Link href="/propositions/" className="font-medium text-accent underline underline-offset-4">
                les propositions au crible
              </Link>{" "}
              et le module{" "}
              <Link href="/modules/histoire-des-dettes/" className="font-medium text-accent underline underline-offset-4">
                L&apos;histoire des dettes
              </Link>
              .
            </p>
          </section>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setEcran("objectif")} className={BOUTON}>
            Rejouer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={ecran === "annee" ? "pb-16 lg:pb-0" : undefined}>
      <div ref={haut} aria-live="polite" className="scroll-mt-36">
        {contenu}
      </div>
      <CommentFonctionne h={h} montants={montants} />
    </div>
  );
}

/** « Comment fonctionne le jeu ? » : toutes les hypothèses, affichées. */
function CommentFonctionne({ h, montants }: { h: HypothesesJeu; montants: Record<Niveau, number> }) {
  const ids = [
    "ministre.croissance-tendancielle",
    "ministre.multiplicateur-depenses",
    "ministre.multiplicateur-impots",
    "ministre.stabilisateurs",
    "ministre.reaction-spread",
    "ministre.decote-maturites",
    "ministre.okun",
  ];
  const donnees = toutesLesDonnees();
  return (
    <section id="comment-fonctionne-le-jeu" className="mt-12 scroll-mt-28 rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-body">
      <h2 className="font-serif text-xl font-semibold text-ink">Comment fonctionne le jeu ?</h2>
      <p className="mt-2">
        Un modèle volontairement simple, dont toutes les hypothèses sont ici. Ce ne sont pas des prévisions : les économistes ne s&apos;accordent pas sur plusieurs de ces valeurs.
      </p>

      <h3 className="mt-4 font-semibold text-ink">Les objectifs</h3>
      <p className="mt-1">
        L&apos;effort de chaque niveau est calculé avec le modèle du jeu, sans imprévu : environ {md(montants.budget, 0)} pour le niveau 1 (le rythme minimal demandé par les règles européennes pendant cinq ans), {md(montants.stabiliser, 0)} pour stabiliser la dette, {md(montants.zero, 0)} pour supprimer le déficit. Ces montants sont plus élevés qu&apos;un calcul « à la date d&apos;aujourd&apos;hui », car sans mesure le déficit se creuse : les intérêts de la dette montent. En fin de partie, l&apos;objectif est jugé sur le résultat, imprévus compris.
      </p>

      <h3 className="mt-4 font-semibold text-ink">Les mesures</h3>
      <p className="mt-1">
        Elles viennent de data/mesures-budget.json : chacune est chiffrée, avec une fourchette et sa source. Une mesure votée reste active les années suivantes. Son rendement monte selon son délai : tout de suite, en trois ans, ou en cinq ans. Les économies freinent un peu plus l&apos;activité que les hausses d&apos;impôts du même montant (multiplicateurs ci-dessous).
      </p>

      <h3 className="mt-4 font-semibold text-ink">La popularité</h3>
      <p className="mt-1">
        Une seule règle, pour toutes les mesures, quelle que soit leur couleur politique : points perdus = {formatNombre(POPULARITE.coefficient, 2)} × montant central en Md€ × ({formatNombre(POPULARITE.plancher, 1)} + part de la population qui paie). On part de {POPULARITE.depart} sur 100 ; on regagne {POPULARITE.recuperation} points chaque année, car l&apos;opinion s&apos;habitue, sans dépasser ce niveau de départ ; sous {POPULARITE.seuil}, le gouvernement tombe. Une mesure qui touche plus de {formatNombre(SEUIL_GREVE * 100, 0)} % de la population peut provoquer une grève. C&apos;est une hypothèse simplifiée, pas une mesure de l&apos;opinion.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="text-left text-muted">Part de la population qui paie, par groupe (les groupes s&apos;additionnent, dans la limite de 100 %)</caption>
          <tbody>
            {PAYEURS.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <th scope="row" className="py-1 pr-3 text-left font-normal">
                  {p.libelle}
                </th>
                <td className="py-1 pr-3 text-right tabular-nums">{formatNombre(PARTS_TOUCHEES[p.id].part * 100, 0)} %</td>
                <td className="py-1 text-muted">{PARTS_TOUCHEES[p.id].pourquoi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-muted">
        Sondages : quand un sondage public existe sur une mesure, il est affiché avec son commanditaire. Il ne modifie pas la jauge : il n&apos;en existe que pour quelques mesures, et les appliquer avantagerait celles qui ont été sondées. Exemple de calcul : la mesure « {mesures.find((m) => m.id === "csg-1pt")?.intitule} » touche {formatNombre(partTouchee(mesures.find((m) => m.id === "csg-1pt")!) * 100, 0)} % de la population et coûte {formatNombre(coutPopularite(mesures.find((m) => m.id === "csg-1pt")!), 1)} points.
      </p>

      <h3 className="mt-4 font-semibold text-ink">L&apos;économie</h3>
      <ul className="mt-1 space-y-1.5">
        {ids.map((id) => {
          const d = donnees.find((x) => x.id === id)!;
          return (
            <li key={id}>
              <strong className="text-ink">
                {d.label} : {"valeur" in d ? formatNombre(d.valeur, 1) : ""} {d.unite}.
              </strong>{" "}
              <span className="text-muted">{d.note}</span>
            </li>
          );
        })}
        <li>
          <strong className="text-ink">Renouvellement de la dette : {formatNombre(h.maturite, 1)} ans en moyenne.</strong>{" "}
          <span className="text-muted">Chaque année, le taux moyen de la dette se rapproche du taux des nouveaux emprunts d&apos;environ 1/{formatNombre(h.maturite, 1)} de l&apos;écart : c&apos;est pourquoi les intérêts montent même sans rien décider.</span>
        </li>
        <li>
          <strong className="text-ink">Taux allemand à 10 ans : {pct(h.tauxAllemand, 2)}, supposé constant.</strong>{" "}
          <span className="text-muted">Le taux français est égal au taux allemand plus l&apos;écart entre les deux, plus les chocs de taux. L&apos;écart monte quand le déficit dépasse 4 % sans s&apos;améliorer, et baisse quand il passe sous 3 % ou recule nettement.</span>
        </li>
        <li>
          <strong className="text-ink">Point de départ : les dernières données publiées.</strong>{" "}
          <span className="text-muted">Dette, déficit, intérêts et PIB de l&apos;Insee, chômage de l&apos;Insee, écart de taux de la BCE.</span>
        </li>
      </ul>

      <h3 className="mt-4 font-semibold text-ink">Les imprévus</h3>
      <p className="mt-1">Une carte par an, tirée au sort : des chocs imaginaires, d&apos;une ampleur inspirée de crises réelles.</p>
      <VueTableau
        legende="Les cartes d'imprévus"
        colonnes={["Imprévu", "Croissance (point)", "Taux (point)", "Écart avec l'Allemagne (point)", "Dépense (Md€)", "Popularité"]}
        lignes={IMPREVUS.map((i) => [i.titre, i.croissance, i.taux, i.spread / 100, i.cout, i.popularite])}
      />
      <p className="mt-2 text-muted">
        La grève suit une mesure qui touche plus d&apos;un quart de la population, une fois sur deux. L&apos;agence de notation maintient la note si le déficit est sous 3 % ou si le budget de l&apos;année le réduit d&apos;au moins 0,3 point ; sinon, l&apos;écart avec l&apos;Allemagne monte de 0,3 point.
      </p>
    </section>
  );
}
