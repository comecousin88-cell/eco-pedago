import { getDonnee } from "@/lib/data";

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/**
 * La date d'une donnée, écrite dans le texte : quand la donnée est mise à
 * jour, la phrase suit. « En <DateDonnee id="deficit.montant" />, le déficit… »
 *
 * format « annee » (défaut) : 2025 ; « jour » : 30 juin 2026.
 */
export function DateDonnee({ id, format = "annee" }: { id: string; format?: "annee" | "jour" }) {
  const { date } = getDonnee(id);
  const [a, m, j] = date.split("-");
  if (format === "jour" && j) return <>{`${Number(j) === 1 ? "1er" : Number(j)} ${MOIS[Number(m) - 1]} ${a}`}</>;
  if (format === "jour" && m) return <>{`${MOIS[Number(m) - 1]} ${a}`}</>;
  return <>{a}</>;
}
