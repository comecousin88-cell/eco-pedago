"use client";

import Link from "next/link";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSerie } from "@/lib/data";
import { formatNombre } from "@/lib/format";
import { AXE, GRILLE, Infobulle, Legende, nombreAxe, useLargeur, VueTableau } from "./commun";

/** Pays disponibles, dans l'ordre fixe des couleurs de la palette (jamais réattribuées). */
const PAYS = [
  { code: "fra", nom: "France", couleur: "var(--series-1)", complement: "histo.dette-fra-jst" },
  { code: "gbr", nom: "Royaume-Uni", couleur: "var(--series-2)" },
  { code: "usa", nom: "États-Unis", couleur: "var(--series-3)" },
  { code: "deu", nom: "Allemagne", couleur: "var(--series-4)", complement: "histo.dette-deu-jst" },
  { code: "jpn", nom: "Japon", couleur: "var(--series-5)" },
  { code: "ita", nom: "Italie", couleur: "var(--series-6)" },
  { code: "grc", nom: "Grèce", couleur: "var(--series-7)" },
  { code: "arg", nom: "Argentine", couleur: "var(--series-8)" },
] as const satisfies readonly { code: string; nom: string; couleur: string; complement?: string }[];

type Code = (typeof PAYS)[number]["code"];
type Point = { x: string; y: number };

const DEBUT = 1880;
const FIN = 2024;

/** Les deux guerres mondiales, en zones grisées : elles expliquent la plupart des trous. */
const GUERRES = [
  { debut: "1914", fin: "1918", libelle: "Première Guerre mondiale", court: "1914-18" },
  { debut: "1939", fin: "1945", libelle: "Seconde Guerre mondiale", court: "1939-45" },
];

/** Grandes baisses d'après-guerre, annotées quand le pays est affiché. */
const BAISSES: { pays: Code; de: string; a: string; titre: string }[] = [
  { pays: "fra", de: "1946", a: "1950", titre: "France, après 1945" },
  { pays: "jpn", de: "1944", a: "1950", titre: "Japon, 1944-1950" },
];

const COMPLEMENT = (c: Code) => `${c}_autre`;

/** Années sans donnée à l'intérieur d'une série, regroupées en périodes : [[1914, 1919], [1933, 1945]]. */
export function periodesManquantes(serie: Point[]): [number, number][] {
  const annees = serie.map((p) => Number(p.x)).sort((a, b) => a - b);
  const trous: [number, number][] = [];
  for (let i = 1; i < annees.length; i++) if (annees[i] - annees[i - 1] > 1) trous.push([annees[i - 1] + 1, annees[i] - 1]);
  return trous;
}

const periode = ([a, b]: [number, number]) => (a === b ? `${a}` : `${a} à ${b}`);

/**
 * Dette publique en % du PIB depuis 1880 pour quelques pays (FMI, séries
 * longues). Les guerres mondiales sont grisées ; les années sans donnée ne
 * sont jamais reliées. Quand une autre source fiable comble un trou, ses
 * points s'affichent en pointillés, sans être reliés à la série du FMI.
 */
export function DetteLongue({ initiaux = ["fra", "gbr", "usa"], lienHistoire = true }: { initiaux?: Code[]; lienHistoire?: boolean }) {
  const [choisis, setChoisis] = useState<Code[]>(initiaux);
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const etroit = largeur > 0 && largeur < 520;

  const series = Object.fromEntries(PAYS.map((p) => [p.code, getSerie(`histo.dette-${p.code}`).serie])) as Record<Code, Point[]>;
  const complements = Object.fromEntries(
    PAYS.flatMap((p) => ("complement" in p ? [[p.code, getSerie(p.complement)]] : [])),
  ) as Partial<Record<Code, ReturnType<typeof getSerie>>>;

  const annees: string[] = [];
  for (let a = DEBUT; a <= FIN; a++) annees.push(String(a));
  const donnees = annees.map((annee) => {
    // Valeur invisible : Recharts n'affiche l'infobulle que si l'année a au moins une valeur.
    const ligne: Record<string, string | number | null> = { annee, survol: 0 };
    for (const p of PAYS) {
      ligne[p.code] = series[p.code].find((x) => x.x === annee)?.y ?? null;
      ligne[COMPLEMENT(p.code)] = complements[p.code]?.serie.find((x) => x.x === annee)?.y ?? null;
    }
    return ligne;
  });
  const visibles = PAYS.filter((p) => choisis.includes(p.code));
  const debutSerie = (c: Code) => series[c][0].x;
  const baisses = BAISSES.filter((b) => choisis.includes(b.pays));
  const valeur = (c: Code, x: string) => series[c].find((p) => p.x === x)?.y;
  const complementsVisibles = visibles.filter((p) => complements[p.code]);

  const basculer = (c: Code) =>
    setChoisis((l) => (l.includes(c) ? (l.length > 1 ? l.filter((x) => x !== c) : l) : [...l, c]));

  return (
    <div>
      <div role="group" aria-label="Pays affichés" className="mb-3 flex flex-wrap gap-2">
        {PAYS.map((p) => {
          const actif = choisis.includes(p.code);
          return (
            <button
              key={p.code}
              type="button"
              aria-pressed={actif}
              onClick={() => basculer(p.code)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                actif ? "border-ink text-ink" : "border-line text-muted hover:text-ink"
              }`}
            >
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: actif ? p.couleur : "var(--line-strong)" }} />
              {p.nom}
            </button>
          );
        })}
      </div>

      <div ref={ref} className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={donnees} margin={{ top: 22, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRILLE} />
            {GUERRES.map((g) => (
              <ReferenceArea
                key={g.debut}
                x1={g.debut}
                x2={g.fin}
                fill="var(--line-strong)"
                fillOpacity={0.25}
                stroke="none"
                ifOverflow="visible"
                label={{ value: g.court, position: "top", fill: "var(--muted)", fontSize: 11 }}
              />
            ))}
            <XAxis dataKey="annee" {...AXE} interval={etroit ? 39 : 19} minTickGap={8} />
            <YAxis {...AXE} width={44} tickFormatter={nombreAxe} />
            <ReferenceLine
              y={100}
              stroke="var(--muted)"
              strokeDasharray="4 4"
              label={{ value: "100 % du PIB", position: "insideTopRight", fill: "var(--muted)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: "var(--line-strong)" }}
              content={({ active, label }) => {
                // On relit l'année dans les données : une année sans aucune valeur doit aussi afficher « données manquantes ».
                const ligne = donnees.find((d) => d.annee === String(label)) as Record<string, number | null> | undefined;
                if (!active || !ligne) return null;
                const guerre = GUERRES.find((g) => String(label) >= g.debut && String(label) <= g.fin);
                return (
                  <Infobulle
                    titre={`${label}${guerre ? ` · ${guerre.libelle}` : ""}`}
                    lignes={visibles
                      .filter((p) => String(label) >= debutSerie(p.code) || ligne[COMPLEMENT(p.code)] !== null)
                      .map((p) => ({
                        libelle: p.nom,
                        couleur: p.couleur,
                        valeur:
                          ligne[p.code] !== null
                            ? `${formatNombre(Number(ligne[p.code]), 0)} % du PIB`
                            : ligne[COMPLEMENT(p.code)] !== null
                              ? `${formatNombre(Number(ligne[COMPLEMENT(p.code)]), 0)} % du PIB (autre source)`
                              : "données manquantes",
                      }))}
                  />
                );
              }}
            />
            <Line dataKey="survol" stroke="none" dot={false} activeDot={false} legendType="none" isAnimationActive={false} />
            {visibles.map((p) => (
              <Line key={p.code} dataKey={p.code} stroke={p.couleur} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
            ))}
            {complementsVisibles.map((p) => (
              <Line
                key={`${p.code}-autre`}
                dataKey={COMPLEMENT(p.code)}
                stroke={p.couleur}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                legendType="none"
              />
            ))}
            {baisses.map((b, i) => (
              <ReferenceDot
                key={b.pays}
                x={b.de}
                y={valeur(b.pays, b.de)}
                r={9}
                fill="var(--surface)"
                stroke="var(--ink)"
                label={{ value: String(i + 1), fill: "var(--ink)", fontSize: 11, fontWeight: 600 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 space-y-1">
        <Legende elements={visibles.map((p) => ({ libelle: p.nom, couleur: p.couleur }))} />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-3 w-4 rounded-sm" style={{ background: "var(--line-strong)", opacity: 0.5 }} />
            Guerres mondiales (1914-1918, 1939-1945)
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="w-5 border-t-2 border-dashed" style={{ borderColor: "var(--muted)" }} />
            100 % du PIB
          </li>
          {complementsVisibles.length > 0 && (
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="w-5 border-t-2 border-dotted" style={{ borderColor: "var(--ink)" }} />
              Pointillés de couleur : autre source
            </li>
          )}
        </ul>
      </div>

      {baisses.length > 0 && (
        <ol className="mt-4 space-y-2 text-sm text-body">
          {baisses.map((b, i) => (
            <li key={b.pays} className="flex gap-2">
              <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink text-xs font-semibold text-ink">
                {i + 1}
              </span>
              <span>
                <strong className="text-ink">{b.titre}</strong> : la dette passe de {formatNombre(valeur(b.pays, b.de) ?? 0, 0)} % du
                PIB en {b.de} à {formatNombre(valeur(b.pays, b.a) ?? 0, 0)} % en {b.a}. L&apos;inflation d&apos;après-guerre a fait
                fondre la valeur réelle de la dette, au prix des épargnants.
              </span>
            </li>
          ))}
          {lienHistoire && (
            <li className="pl-7">
              <Link href="/modules/histoire-des-dettes/inflation/" className="font-medium underline underline-offset-4">
                L&apos;inflation, une façon de réduire la dette
              </Link>
            </li>
          )}
        </ol>
      )}

      <div className="mt-4 rounded-lg border border-line bg-subtle px-3 py-2 text-sm text-body">
        <p className="font-semibold text-ink">Données manquantes</p>
        <p className="mt-1">
          Les guerres ont interrompu les statistiques de plusieurs pays. Les courbes ne relient jamais deux années séparées
          par un trou.
        </p>
        <ul className="mt-1 list-disc pl-5">
          {visibles.map((p) => {
            const trous = periodesManquantes(series[p.code]);
            const c = complements[p.code];
            return (
              <li key={p.code}>
                {p.nom} : {trous.length ? `pas de donnée de ${trous.map(periode).join(", puis de ")}` : "série complète"}
                {Number(debutSerie(p.code)) > DEBUT ? ` (série disponible à partir de ${debutSerie(p.code)})` : ""}
                {c ? `. ${c.serie[0].x}-${c.serie[c.serie.length - 1].x} en pointillés : Macrohistory Database (Jordà, Schularick et Taylor), autre source, à comparer avec prudence` : ""}.
              </li>
            );
          })}
        </ul>
      </div>

      <VueTableau
        legende="Dette publique brute en % du PIB (FMI, séries longues ; autre source signalée)"
        colonnes={["Année", ...visibles.map((p) => p.nom)]}
        lignes={[...donnees]
          .reverse()
          .filter((d) => visibles.some((p) => d[p.code] !== null || d[COMPLEMENT(p.code)] !== null))
          .map((d) => [
            String(d.annee),
            ...visibles.map((p) =>
              d[p.code] !== null ? Number(d[p.code]) : d[COMPLEMENT(p.code)] !== null ? `${formatNombre(Number(d[COMPLEMENT(p.code)]), 0)} (autre source)` : "",
            ),
          ])}
      />
    </div>
  );
}
