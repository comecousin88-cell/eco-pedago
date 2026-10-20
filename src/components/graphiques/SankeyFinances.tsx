"use client";

import { sankey, sankeyJustify, sankeyLinkHorizontal, type SankeyLink, type SankeyNode } from "d3-sankey";
import { useMemo, useState } from "react";
import { getSerie, getValeur } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { useLargeur, VueTableau } from "./commun";

/**
 * D'où vient l'argent public et où il va : recettes (et emprunt) à gauche,
 * dépenses par fonction à droite, pour une même année. Cliquer (ou toucher)
 * un bloc met ses flux en évidence et affiche le détail.
 */

type Groupe = "recette" | "emprunt" | "centre" | "depense";

interface Noeud {
  id: string;
  nom: string;
  groupe: Groupe;
}

type N = SankeyNode<Noeud, object>;
type L = SankeyLink<Noeud, object>;

const COULEUR: Record<Groupe, string> = {
  recette: "var(--series-1)",
  emprunt: "var(--series-2)",
  centre: "var(--ink)",
  depense: "var(--series-3)",
};

/** Nom court pour les étiquettes : on retire la précision entre parenthèses (le nom complet est dans le détail et le tableau). */
function court(nom: string) {
  return nom.replace(/\s*\(.*\)\s*$/, "");
}

export function SankeyFinances() {
  const recettes = getSerie("fp.recettes-2024-par-type");
  const depenses = getSerie("fp.depenses-2024-par-fonction");
  const totalRecettes = getValeur("fp.recettes-2024");
  const totalDepenses = getValeur("fp.depenses-2024");
  const annee = recettes.date;
  const emprunt = totalDepenses.valeur - totalRecettes.valeur;

  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const [choisi, setChoisi] = useState<string | null>(null);
  const etroit = largeur > 0 && largeur < 600;
  const hauteur = etroit ? 620 : 560;
  const margeTexte = etroit ? 0 : 160;

  const graphe = useMemo(() => {
    if (!largeur) return null;
    const noeuds: Noeud[] = [
      ...recettes.serie.map((p) => ({ id: `r:${p.x}`, nom: p.x, groupe: "recette" as const })),
      { id: "emprunt", nom: "Emprunt (déficit)", groupe: "emprunt" },
      { id: "centre", nom: `Dépenses publiques ${annee}`, groupe: "centre" },
      ...depenses.serie.map((p) => ({ id: `d:${p.x}`, nom: p.x, groupe: "depense" as const })),
    ];
    const liens = [
      ...recettes.serie.map((p) => ({ source: `r:${p.x}`, target: "centre", value: p.y })),
      { source: "emprunt", target: "centre", value: emprunt },
      ...depenses.serie.map((p) => ({ source: "centre", target: `d:${p.x}`, value: p.y })),
    ];
    const generateur = sankey<Noeud, object>()
      .nodeId((n) => n.id)
      .nodeAlign(sankeyJustify)
      .nodeWidth(etroit ? 8 : 12)
      .nodePadding(etroit ? 7 : 9)
      .nodeSort(null)
      .extent([
        [margeTexte, 6],
        [largeur - margeTexte, hauteur - 6],
      ]);
    return generateur({ nodes: noeuds.map((n) => ({ ...n })), links: liens.map((l) => ({ ...l })) });
  }, [largeur, etroit, hauteur, margeTexte, recettes, depenses, emprunt, annee]);

  const totalGauche = totalDepenses.valeur;
  const selection = graphe?.nodes.find((n) => n.id === choisi);

  function lienActif(l: L) {
    if (!choisi) return true;
    const s = (l.source as N).id;
    const t = (l.target as N).id;
    return s === choisi || t === choisi;
  }

  function texte(n: N) {
    const x0 = n.x0 ?? 0;
    const x1 = n.x1 ?? 0;
    const y = ((n.y0 ?? 0) + (n.y1 ?? 0)) / 2;
    const aGauche = n.groupe === "recette" || n.groupe === "emprunt";
    const valeur = n.value ?? 0;
    if (n.groupe === "centre") return null;
    // Sur petit écran, les étiquettes passent au-dessus des flux ; on masque les plus petites.
    if (etroit && valeur < 40) return null;
    return (
      <text
        x={aGauche ? (etroit ? x1 + 4 : x0 - 6) : etroit ? x0 - 4 : x1 + 6}
        y={y}
        dy="0.35em"
        textAnchor={aGauche ? (etroit ? "start" : "end") : etroit ? "end" : "start"}
        fontSize={etroit ? 10.5 : 12}
        fill="var(--ink)"
        stroke={etroit ? "var(--surface)" : "none"}
        strokeWidth={etroit ? 3 : 0}
        paintOrder="stroke"
        pointerEvents="none"
      >
        {court(n.nom)}{" "}
        <tspan fill="var(--muted)" stroke="none">
          {formatNombre(valeur)}
        </tspan>
      </text>
    );
  }

  return (
    <div>
      <div ref={ref} className="w-full">
        {graphe && (
          <svg
            width={largeur}
            height={hauteur}
            role="img"
            aria-label={`Diagramme des flux de ${annee} : ${formatNombre(totalRecettes.valeur)} milliards d'euros de recettes et ${formatNombre(emprunt)} milliards d'emprunt financent ${formatNombre(totalDepenses.valeur)} milliards de dépenses. Le détail est dans le tableau.`}
          >
            <g fill="none">
              {graphe.links.map((l, i) => {
                const source = l.source as N;
                const couleur = source.groupe === "centre" ? COULEUR.depense : COULEUR[source.groupe];
                return (
                  <path
                    key={i}
                    d={sankeyLinkHorizontal()(l) ?? undefined}
                    stroke={couleur}
                    strokeWidth={Math.max(1, l.width ?? 1)}
                    strokeOpacity={lienActif(l) ? (choisi ? 0.6 : 0.3) : 0.07}
                    className="transition-[stroke-opacity] duration-200"
                  />
                );
              })}
            </g>
            {graphe.nodes.map((n) => (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-pressed={choisi === n.id}
                aria-label={`${n.nom} : ${formatNombre(n.value ?? 0, 1)} milliards d'euros`}
                onClick={() => setChoisi((c) => (c === n.id ? null : n.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setChoisi((c) => (c === n.id ? null : n.id));
                  }
                }}
                className="cursor-pointer focus:outline-none [&:focus-visible>rect]:stroke-[var(--accent)] [&:focus-visible>rect]:stroke-2"
              >
                <rect
                  x={n.x0}
                  y={n.y0}
                  width={(n.x1 ?? 0) - (n.x0 ?? 0)}
                  height={Math.max(1, (n.y1 ?? 0) - (n.y0 ?? 0))}
                  rx={2}
                  fill={COULEUR[n.groupe]}
                />
                {/* Zone de clic plus large que le bloc */}
                <rect
                  x={(n.x0 ?? 0) - 6}
                  y={(n.y0 ?? 0) - 2}
                  width={(n.x1 ?? 0) - (n.x0 ?? 0) + 12}
                  height={(n.y1 ?? 0) - (n.y0 ?? 0) + 4}
                  fill="transparent"
                />
                {texte(n)}
              </g>
            ))}
          </svg>
        )}
      </div>

      <div className="mt-3 min-h-16 rounded-xl bg-subtle p-3 text-sm" aria-live="polite">
        {selection ? (
          <p>
            <strong className="text-ink">{selection.nom}</strong> : {formatNombre(selection.value ?? 0, 1)} Md€, soit{" "}
            <strong className="text-ink">{formatNombre(((selection.value ?? 0) / totalGauche) * 100, 1)} %</strong> des
            dépenses publiques de {annee}.{" "}
            <button type="button" onClick={() => setChoisi(null)} className="text-muted underline underline-offset-4">
              Tout afficher
            </button>
          </p>
        ) : (
          <p className="text-muted">
            Touchez ou cliquez un bloc pour suivre ses flux. À gauche, l&apos;argent qui entre (en bleu) et
            l&apos;emprunt (en orange) ; à droite, ce qu&apos;il finance (en vert).
            {etroit && " Les plus petits postes n'ont pas d'étiquette : voir le tableau."}
          </p>
        )}
      </div>

      <VueTableau
        legende={`Recettes et dépenses publiques en ${annee}`}
        colonnes={["Poste", "Md€", "Part (%)"]}
        lignes={[
          ["— Ce qui entre —", "", ""],
          ...recettes.serie.map((p) => [p.x, p.y, Math.round((p.y / totalGauche) * 1000) / 10]),
          ["Emprunt (déficit)", Math.round(emprunt * 10) / 10, Math.round((emprunt / totalGauche) * 1000) / 10],
          ["— Ce qui sort —", "", ""],
          ...depenses.serie.map((p) => [p.x, p.y, Math.round((p.y / totalGauche) * 1000) / 10]),
        ]}
      />
    </div>
  );
}
