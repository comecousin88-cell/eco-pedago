import { getValeur } from "@/lib/data";
import { formatNombre } from "@/lib/format";

/**
 * La dette remise à l'échelle : par habitant, en années de recettes, en mois
 * de production, et les intérêts par habitant. Tout est calculé à partir de
 * data/*.json ; chaque tuile indique son calcul.
 */
export function DetteAEchelle() {
  const dette = getValeur("dette.stock");
  const pop = getValeur("pop.france");
  const recettes = getValeur("fp.recettes");
  const pib = getValeur("macro.pib");
  const interets = getValeur("fp.interets");

  const habitants = pop.valeur * 1e6;
  const tuiles = [
    {
      titre: "Dette par habitant",
      valeur: `${formatNombre(Math.round((dette.valeur * 1e9) / habitants / 100) * 100, 0)} €`,
      calcul: `${formatNombre(dette.valeur, 1)} Md€ ÷ ${formatNombre(pop.valeur, 1)} millions d'habitants`,
    },
    {
      titre: "Intérêts par habitant et par an",
      valeur: `${formatNombre(Math.round((interets.valeur * 1e9) / habitants / 10) * 10, 0)} €`,
      calcul: `${formatNombre(interets.valeur, 1)} Md€ d'intérêts en ${interets.date} ÷ ${formatNombre(pop.valeur, 1)} millions d'habitants`,
    },
    {
      titre: "En années de recettes publiques",
      valeur: `${formatNombre(dette.valeur / recettes.valeur, 1)} ans`,
      calcul: `${formatNombre(dette.valeur, 1)} Md€ ÷ ${formatNombre(recettes.valeur, 1)} Md€ de recettes en ${recettes.date}`,
    },
    {
      titre: "En mois de production du pays",
      valeur: `${formatNombre((dette.valeur / pib.valeur) * 12, 1)} mois`,
      calcul: `${formatNombre(dette.valeur, 1)} Md€ ÷ ${formatNombre(pib.valeur, 1)} Md€ de PIB en ${pib.date}, × 12`,
    },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {tuiles.map((t) => (
        <li key={t.titre} className="rounded-xl border border-line bg-page p-4">
          <p className="text-sm text-muted">{t.titre}</p>
          <p className="mt-1 font-serif text-2xl font-semibold text-ink tabular-nums">{t.valeur}</p>
          <p className="mt-1 text-xs text-muted">{t.calcul}</p>
        </li>
      ))}
    </ul>
  );
}
