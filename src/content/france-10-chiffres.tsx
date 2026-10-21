import type { ReactNode } from "react";
import { Chiffre } from "@/components/pedago/Chiffre";
import { DateDonnee } from "@/components/pedago/DateDonnee";

/**
 * La France en 10 chiffres : la situation des finances publiques en un coup
 * d'œil. Chaque chiffre vient de data/*.json et renvoie vers sa page.
 */
export interface ChiffreCle {
  id: string;
  /** Identifiant de la donnée principale (pour la source et la date). */
  donnee: string;
  titre: string;
  valeur: ReactNode;
  phrase: ReactNode;
  lien: { href: string; libelle: string };
}

export const chiffresCles: ChiffreCle[] = [
  {
    id: "dette",
    donnee: "dette.stock",
    titre: "La dette publique",
    valeur: <Chiffre id="dette.stock" />,
    phrase: (
      <>
        Soit <Chiffre id="dette.ratio-pib" /> au <DateDonnee id="dette.stock" format="jour" />. Elle a plus que quintuplé en
        proportion de la richesse produite depuis 1978.
      </>
    ),
    lien: { href: "/modules/deficit-et-dette/", libelle: "Déficit et dette" },
  },
  {
    id: "deficit",
    donnee: "deficit.montant",
    titre: "Le déficit public",
    valeur: <Chiffre id="deficit.montant" />,
    phrase: (
      <>
        Soit <Chiffre id="deficit.ratio-pib" /> en <DateDonnee id="deficit.montant" />, au-dessus du repère européen de 3 %. Le
        dernier excédent remonte à <Chiffre id="deficit.dernier-excedent" />.
      </>
    ),
    lien: { href: "/modules/deficit-et-dette/soldes/", libelle: "Solde public, primaire, structurel" },
  },
  {
    id: "depenses",
    donnee: "fp.depenses",
    titre: "Les dépenses publiques",
    valeur: <Chiffre id="fp.depenses-pib" />,
    phrase: (
      <>
        <Chiffre id="fp.depenses" /> en <DateDonnee id="fp.depenses" />, le niveau le plus élevé des grandes économies, porté
        surtout par la protection sociale.
      </>
    ),
    lien: { href: "/modules/comparaisons/depenses-et-impots/", libelle: "Dépenses et impôts" },
  },
  {
    id: "prelevements",
    donnee: "fp.prelevements-obligatoires-pib",
    titre: "Les prélèvements obligatoires",
    valeur: <Chiffre id="fp.prelevements-obligatoires-pib" />,
    phrase: (
      <>
        Impôts et cotisations sociales représentaient <Chiffre id="fp.prelevements-obligatoires" /> en{" "}
        <DateDonnee id="fp.prelevements-obligatoires" />.
      </>
    ),
    lien: { href: "/modules/fiscalite/qui-paie/", libelle: "Qui paie quoi ?" },
  },
  {
    id: "interets",
    donnee: "fp.interets",
    titre: "Les intérêts de la dette",
    valeur: <Chiffre id="fp.interets" />,
    phrase: (
      <>
        Versés par l&apos;ensemble des administrations publiques en <DateDonnee id="fp.interets" />. Pour l&apos;État seul, la
        charge de la dette approche le budget de la défense.
      </>
    ),
    lien: { href: "/modules/dette-en-perspective/face-aux-budgets/", libelle: "Face aux budgets de l'État" },
  },
  {
    id: "retraites",
    donnee: "retraites.depenses-montant",
    titre: "Les retraites",
    valeur: <Chiffre id="retraites.depenses-montant" />,
    phrase: (
      <>
        Soit <Chiffre id="retraites.depenses-pib" /> en <DateDonnee id="retraites.depenses-montant" />, le premier poste de la
        dépense publique. On compte <Chiffre id="retraites.cotisants-par-retraite" x="2025" decimales={1} /> pour un retraité.
      </>
    ),
    lien: { href: "/modules/retraites/", libelle: "Les retraites" },
  },
  {
    id: "taux",
    donnee: "marches.taux10-france-dernier",
    titre: "Le taux d'emprunt à 10 ans",
    valeur: <Chiffre id="marches.taux10-france-dernier" />,
    phrase: (
      <>
        En moyenne en <DateDonnee id="marches.taux10-france-dernier" />, soit <Chiffre id="marches.spread-dernier" /> de plus que
        l&apos;Allemagne.
      </>
    ),
    lien: { href: "/modules/emprunt-etat/spread-notation/", libelle: "Spread, notation, courbe des taux" },
  },
  {
    id: "non-residents",
    donnee: "prop.dette-non-residents",
    titre: "La dette détenue à l'étranger",
    valeur: <Chiffre id="prop.dette-non-residents" x="2025" />,
    phrase: <>des titres de long terme des administrations publiques étaient détenus par des non-résidents fin 2025.</>,
    lien: { href: "/modules/emprunt-etat/detenteurs/", libelle: "Qui détient la dette ?" },
  },
  {
    id: "inflation",
    donnee: "ind.inflation-fr",
    titre: "L'inflation",
    valeur: <Chiffre id="ind.inflation-fr" x="2026-09" />,
    phrase: (
      <>
        Sur un an en septembre 2026 (indice harmonisé), contre <Chiffre id="ind.inflation-za" x="2026-09" /> dans la zone euro.
      </>
    ),
    lien: { href: "/tableau-de-bord/", libelle: "Le tableau de bord" },
  },
  {
    id: "chomage",
    donnee: "ind.chomage",
    titre: "Le chômage",
    valeur: <Chiffre id="ind.chomage" x="2026-T2" />,
    phrase: <>de la population active au 2e trimestre 2026, au sens du Bureau international du travail.</>,
    lien: { href: "/modules/comparaisons/emploi-croissance/", libelle: "Croissance et chômage" },
  },
];
