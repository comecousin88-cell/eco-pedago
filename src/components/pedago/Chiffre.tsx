import { getValeur } from "@/lib/data";
import { formatAvecUnite, formatSource } from "@/lib/format";

/**
 * Un chiffre tiré de data/*.json, mis en forme à la française. La source et
 * la date apparaissent au survol, et un chiffre non vérifié est signalé.
 * <Chiffre id="dette.stock" />
 */
export function Chiffre({ id, decimales }: { id: string; decimales?: number }) {
  const d = getValeur(id);
  const aVerifier = d.statut === "a_verifier";
  return (
    <span
      title={`${d.label} — ${formatSource(d)}${aVerifier ? " (chiffre à vérifier)" : ""}`}
      className={`font-semibold whitespace-nowrap text-ink ${
        aVerifier ? "decoration-warn underline decoration-wavy decoration-1 underline-offset-4" : ""
      }`}
    >
      {formatAvecUnite(d.valeur, d.unite, decimales)}
    </span>
  );
}
