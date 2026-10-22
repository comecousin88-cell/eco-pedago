import { calculs, texteCalcul, valeurCalcul, type OptionsCalcul } from "@/content/calculs";
import { getDonnee } from "@/lib/data";
import { arrondiLecture, formatAvecUnite, formatSource, sourceCourte } from "@/lib/format";

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
  const texte = texteCalcul(id, options);
  // Mode Simple : arrondi ; mode Approfondi : précis, avec les sources du calcul.
  const a = arrondiLecture(valeurCalcul(id, options));
  const arrondi = options.unite === false ? formatAvecUnite(a.valeur, "", a.decimales).trimEnd() : formatAvecUnite(a.valeur, c.unite, a.decimales);
  const noms = [...new Set(c.donnees.map((d) => sourceCourte(getDonnee(d).source.nom)))].join(", ");
  return (
    <span
      title={`${c.label} : ${c.explication}. ${[...new Set(sources)].join(" ; ")}${aVerifier ? " (chiffre à vérifier)" : ""}`}
      className={`font-semibold whitespace-nowrap text-ink ${
        aVerifier ? "decoration-warn underline decoration-wavy decoration-1 underline-offset-4" : ""
      }`}
    >
      {arrondi === texte ? (
        texte
      ) : (
        <>
          <span data-selon-mode="simple">{arrondi}</span>
          <span data-selon-mode="approfondi">{texte}</span>
        </>
      )}
      {options.unite !== false && (
        <span data-selon-mode="approfondi" className="chiffre-source">
          {" "}
          (calcul : {noms})
        </span>
      )}
    </span>
  );
}
