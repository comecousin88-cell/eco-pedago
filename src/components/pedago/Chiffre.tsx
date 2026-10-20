import { getDonnee } from "@/lib/data";
import { formatAvecUnite, formatSource } from "@/lib/format";

/**
 * Un chiffre tiré de data/*.json, mis en forme à la française. La source et
 * la date apparaissent au survol, et un chiffre non vérifié est signalé.
 *
 * <Chiffre id="dette.stock" />                       une valeur
 * <Chiffre id="macro.inflation" x="2025" />          un point d'une série
 * <Chiffre id="dette.stock" unite={false} />         sans l'unité
 */
export function Chiffre({
  id,
  x,
  decimales,
  unite = true,
}: {
  id: string;
  x?: string;
  decimales?: number;
  unite?: boolean;
}) {
  const d = getDonnee(id);
  let valeur: number;
  if ("valeur" in d) {
    valeur = d.valeur;
  } else {
    const point = d.serie.find((p) => p.x === x);
    if (!point) throw new Error(`${id} : point « ${x} » absent de la série`);
    valeur = point.y;
  }
  const aVerifier = d.statut === "a_verifier";
  const hypothese = d.statut === "hypothese";
  // Une année s'écrit sans séparateur de milliers.
  const texte =
    d.unite === "année"
      ? String(valeur)
      : unite
        ? formatAvecUnite(valeur, d.unite, decimales)
        : formatAvecUnite(valeur, "", decimales).trimEnd();

  return (
    <span
      title={`${d.label}${x ? ` (${x})` : ""} — ${formatSource(d)}${aVerifier ? " (chiffre à vérifier)" : ""}${hypothese ? " (hypothèse, pas une donnée observée)" : ""}`}
      className={`font-semibold whitespace-nowrap text-ink ${
        aVerifier ? "decoration-warn underline decoration-wavy decoration-1 underline-offset-4" : ""
      }`}
    >
      {texte}
    </span>
  );
}
