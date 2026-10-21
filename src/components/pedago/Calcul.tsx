import { calculs, texteCalcul, type OptionsCalcul } from "@/content/calculs";
import { getDonnee } from "@/lib/data";
import { formatSource } from "@/lib/format";

/**
 * Une valeur calculée à partir de data/*.json (src/content/calculs.ts),
 * mise en forme comme <Chiffre>. Le calcul et les sources apparaissent au survol.
 *
 * <Calcul id="calc.dette-par-habitant" arrondi={1000} />        environ 52 000 €
 * <Calcul id="calc.dette-par-habitant" arrondi={10000} sens="bas" />   plus de 50 000 €
 */
export function Calcul({ id, ...options }: { id: string } & OptionsCalcul) {
  const c = calculs[id];
  if (!c) throw new Error(`Calcul inconnu : ${id}`);
  const sources = c.donnees.map((d) => formatSource(getDonnee(d)));
  const aVerifier = c.donnees.some((d) => getDonnee(d).statut === "a_verifier");
  return (
    <span
      title={`${c.label} : ${c.explication}. ${[...new Set(sources)].join(" ; ")}${aVerifier ? " (chiffre à vérifier)" : ""}`}
      className={`font-semibold whitespace-nowrap text-ink ${
        aVerifier ? "decoration-warn underline decoration-wavy decoration-1 underline-offset-4" : ""
      }`}
    >
      {texteCalcul(id, options)}
    </span>
  );
}
