import type { ReactNode } from "react";
import { Chiffre } from "@/components/pedago/Chiffre";
import { DateDonnee } from "@/components/pedago/DateDonnee";

/**
 * Idées reçues : des affirmations qu'on entend souvent, vérifiées une par une.
 * Le verdict porte sur l'affirmation telle qu'elle est formulée ; les chiffres
 * viennent de data/*.json. Aucun parti n'est nommé.
 */

export type VerdictIdee = "vrai" | "faux" | "nuance";

export interface IdeeRecue {
  id: string;
  affirmation: string;
  verdict: VerdictIdee;
  explication: ReactNode;
  lien: { href: string; libelle: string };
}

export const idees: IdeeRecue[] = [
  {
    id: "impots-moitie",
    affirmation: "La moitié des Français ne paient pas d'impôts.",
    verdict: "faux",
    explication: (
      <>
        Moins de la moitié des foyers paient l&apos;impôt sur le revenu (<Chiffre id="ir.foyers" x="foyers imposés" /> sur{" "}
        <Chiffre id="ir.foyers" x="foyers fiscaux" />), mais tout le monde paie la TVA en consommant, et presque tous les revenus
        supportent la CSG et des cotisations. L&apos;impôt sur le revenu ne pèse qu&apos;une petite part des recettes publiques.
      </>
    ),
    lien: { href: "/modules/fiscalite/qui-paie/", libelle: "Qui paie quoi ?" },
  },
  {
    id: "dette-menage",
    affirmation: "La dette de l'État, c'est comme celle d'un ménage.",
    verdict: "nuance",
    explication: (
      <>
        La comparaison aide, mais a ses limites. Un État ne rembourse presque jamais sa dette d&apos;un coup : il la refinance à
        l&apos;échéance. Il ne meurt pas, et il fixe une partie de ses recettes. Ce qui compte, c&apos;est la charge des intérêts
        et le poids de la dette par rapport aux revenus du pays : <Chiffre id="dette.ratio-pib" /> au{" "}
        <DateDonnee id="dette.ratio-pib" format="jour" />.
      </>
    ),
    lien: { href: "/modules/dette-en-perspective/par-habitant/", libelle: "Par habitant, en années de recettes" },
  },
  {
    id: "dernier-excedent",
    affirmation: "La France n'a plus eu de budget public en excédent depuis les années 1970.",
    verdict: "vrai",
    explication: (
      <>
        Le dernier excédent de l&apos;ensemble des administrations publiques remonte à <Chiffre id="deficit.dernier-excedent" />,
        selon l&apos;Insee. Depuis, chaque année se solde par un déficit, qui s&apos;ajoute à la dette.
      </>
    ),
    lien: { href: "/modules/deficit-et-dette/histoire/", libelle: "La dette depuis 1978" },
  },
  {
    id: "retraites-premier-poste",
    affirmation: "Les retraites sont le premier poste de la dépense publique.",
    verdict: "vrai",
    explication: (
      <>
        Avec <Chiffre id="retraites.depenses-montant" /> en <DateDonnee id="retraites.depenses-montant" />, soit{" "}
        <Chiffre id="retraites.depenses-pib" />, les retraites devancent nettement la santé. C&apos;est une dépense redistribuée
        aux ménages, pas consommée par l&apos;administration.
      </>
    ),
    lien: { href: "/modules/les-bases/recettes-depenses/", libelle: "Recettes et dépenses publiques" },
  },
  {
    id: "taxer-riches-suffit",
    affirmation: "Il suffirait de taxer les plus riches pour boucher le trou.",
    verdict: "faux",
    explication: (
      <>
        Un impôt de 2 % sur les patrimoines de plus de 100 millions d&apos;euros rapporterait, selon les estimations, de{" "}
        <Chiffre id="prop.impot-plancher-rendements" x="Estimation critique, impôt sur les sociétés déduit (bas)" decimales={0} unite={false} /> à{" "}
        <Chiffre id="prop.impot-plancher-rendements" x="Estimation de ses promoteurs (haut)" decimales={0} />. Le déficit était de{" "}
        <Chiffre id="deficit.montant" /> en <DateDonnee id="deficit.montant" />. Une contribution accrue peut faire partie d&apos;un
        effort, pas le résumer.
      </>
    ),
    lien: { href: "/propositions/financer-les-depenses-en-taxant-les-riches/", libelle: "La fiche proposition" },
  },
  {
    id: "bce-efface",
    affirmation: "La banque centrale pourrait effacer la dette de la France.",
    verdict: "faux",
    explication: (
      <>
        C&apos;est interdit par l&apos;article 123 du traité, et la France ne peut pas le décider seule. Surtout, le gain serait
        illusoire : la Banque de France continuerait de rémunérer les réserves créées pour acheter les titres, sans plus rien
        toucher en face. Ce que l&apos;État ne paierait plus, sa banque centrale le perdrait.
      </>
    ),
    lien: { href: "/propositions/annuler-dette-banque-centrale/", libelle: "La fiche proposition" },
  },
  {
    id: "faillite-100",
    affirmation: "Au-delà de 100 % du PIB, un pays fait forcément faillite.",
    verdict: "faux",
    explication: (
      <>
        Il n&apos;existe pas de seuil magique. Le Japon a une dette de <Chiffre id="intl.dette-pib-japon" /> sans crise de
        financement ; la Grèce a perdu l&apos;accès aux marchés avec une dette bien plus faible. Tout dépend de la monnaie dans
        laquelle on emprunte, de qui détient la dette, des taux et de la croissance.
      </>
    ),
    lien: { href: "/modules/comparaisons/japon-grece/", libelle: "Pourquoi le Japon n'est pas la Grèce" },
  },
  {
    id: "interets-defense",
    affirmation: "Les intérêts de la dette coûtent presque autant que la défense.",
    verdict: "vrai",
    explication: (
      <>
        Dans le budget de l&apos;État pour <DateDonnee id="budgets.missions" />, la charge de la dette atteint{" "}
        <Chiffre id="budgets.missions" x="Charge de la dette de l'État" />, contre <Chiffre id="budgets.missions" x="Défense" /> pour
        la défense, et elle augmente avec la remontée des taux.
      </>
    ),
    lien: { href: "/modules/dette-en-perspective/face-aux-budgets/", libelle: "Face aux budgets de l'État" },
  },
  {
    id: "depense-voisins",
    affirmation: "La France dépense plus que ses voisins.",
    verdict: "vrai",
    explication: (
      <>
        Ses dépenses publiques atteignent <Chiffre id="intl.depenses-pib-2025" x="France" />, contre{" "}
        <Chiffre id="intl.depenses-pib-2025" x="Zone euro" /> en moyenne dans la zone euro, selon le FMI. L&apos;écart tient surtout
        à la protection sociale, notamment aux retraites, majoritairement publiques en France.
      </>
    ),
    lien: { href: "/modules/comparaisons/depenses-et-impots/", libelle: "Dépenses et impôts" },
  },
  {
    id: "taux-immediat",
    affirmation: "Quand les taux montent, toute la dette coûte immédiatement plus cher.",
    verdict: "faux",
    explication: (
      <>
        Seule la dette nouvelle ou renouvelée paie le nouveau taux. Les titres déjà émis gardent leur taux jusqu&apos;à leur
        échéance, et la dette se renouvelle peu à peu (environ <Chiffre id="aft.maturite-moyenne" /> de durée de vie moyenne). La
        hausse se diffuse donc sur plusieurs années, mais elle finit par toucher toute la dette.
      </>
    ),
    lien: { href: "/modules/emprunt-etat/taux-apparent/", libelle: "Taux apparent et taux de marché" },
  },
  {
    id: "detenue-etranger",
    affirmation: "La dette française est surtout détenue par des étrangers.",
    verdict: "nuance",
    explication: (
      <>
        Un peu plus de la moitié des titres de long terme des administrations publiques étaient détenus par des non-résidents
        fin 2025 (<Chiffre id="prop.dette-non-residents" x="2025" />), selon la Banque de France. Le reste est détenu par des
        assureurs, des banques, la Banque de France et d&apos;autres investisseurs français.
      </>
    ),
    lien: { href: "/modules/emprunt-etat/detenteurs/", libelle: "Qui détient la dette ?" },
  },
  {
    id: "fraude-suffit",
    affirmation: "La lutte contre la fraude suffirait à combler le déficit.",
    verdict: "faux",
    explication: (
      <>
        Le contrôle fiscal a permis d&apos;encaisser <Chiffre id="prop.controle-fiscal" x="sommes encaissées" /> en 2025, déjà
        compris dans les recettes. La fraude sociale est estimée à <Chiffre id="prop.fraude-sociale" x="évaluation 2025" /> par
        an, mais seuls <Chiffre id="prop.fraude-sociale-detectee" x="recouvrée" /> ont été recouvrés en 2024. Renforcer la lutte
        rapporte quelques milliards de plus, progressivement.
      </>
    ),
    lien: { href: "/propositions/lutte-contre-la-fraude/", libelle: "La fiche proposition" },
  },
  {
    id: "smic-cotisations",
    affirmation: "Au niveau du Smic, un employeur ne paie presque pas de cotisations patronales.",
    verdict: "vrai",
    explication: (
      <>
        Les allègements généraux réduisent presque à zéro les cotisations patronales au Smic. Ils coûtent près de{" "}
        <Chiffre id="prop.smic-allegements-cout" /> par an aux finances publiques en <DateDonnee id="prop.smic-allegements-cout" />.
      </>
    ),
    lien: { href: "/modules/fiscalite/smic/", libelle: "Salaire minimum et coût du travail" },
  },
  {
    id: "inflation-dette",
    affirmation: "Un peu d'inflation, et la dette fond.",
    verdict: "nuance",
    explication: (
      <>
        Une poussée d&apos;inflation imprévue réduit le poids de la dette, car le PIB augmente en euros. Mais si elle dure, les
        taux d&apos;intérêt montent aussi, et la charge de la dette avec eux. Après 1945, l&apos;inflation a fait fondre les dettes
        parce que les taux étaient maintenus bas par des règles qui n&apos;existent plus.
      </>
    ),
    lien: { href: "/modules/histoire-des-dettes/inflation/", libelle: "L'inflation et la répression financière" },
  },
  {
    id: "agences-taux",
    affirmation: "Ce sont les agences de notation qui fixent les taux auxquels la France emprunte.",
    verdict: "faux",
    explication: (
      <>
        Les taux sont fixés chaque jour par les investisseurs, sur le marché et lors des adjudications. Les agences donnent un
        avis, que les marchés anticipent souvent. Leur influence passe surtout par certains investisseurs tenus de détenir des
        titres bien notés.
      </>
    ),
    lien: { href: "/modules/cadre-europeen/notation/", libelle: "Les agences de notation" },
  },
  {
    id: "retraites-faillite",
    affirmation: "Le système de retraite va faire faillite.",
    verdict: "faux",
    explication: (
      <>
        Un système par répartition ne fait pas faillite : il paie chaque année les pensions avec les cotisations de l&apos;année.
        Il peut être en déficit, et le sera de plus en plus selon les projections : solde de{" "}
        <Chiffre id="retraites.solde-projection" x="2025" /> en 2025, <Chiffre id="retraites.solde-projection" x="2070" /> en
        2070 selon le COR. Il faut alors ajuster l&apos;âge, les cotisations ou les pensions.
      </>
    ),
    lien: { href: "/modules/retraites/leviers/", libelle: "Les trois leviers" },
  },
  {
    id: "europe-interdit",
    affirmation: "L'Europe interdit à la France d'être en déficit.",
    verdict: "faux",
    explication: (
      <>
        Les règles européennes fixent un repère de déficit à <Chiffre id="ue.seuils" x="déficit" />, pas une interdiction.
        Au-delà, une procédure demande une trajectoire de correction : la France doit revenir sous 3 % d&apos;ici{" "}
        <Chiffre id="ue.pde-france-echeance" />. Les sanctions prévues n&apos;ont jamais été appliquées.
      </>
    ),
    lien: { href: "/modules/cadre-europeen/regles/", libelle: "Les règles budgétaires" },
  },
  {
    id: "blocage-gratuit",
    affirmation: "Bloquer les prix ne coûte rien à personne.",
    verdict: "faux",
    explication: (
      <>
        Quelqu&apos;un paie la différence. Les boucliers tarifaires sur l&apos;électricité et le gaz ont coûté{" "}
        <Chiffre id="prop.boucliers-cout" /> au budget de l&apos;État de 2022 à 2024. Sans compensation, ce sont les producteurs qui
        paient, au risque de pénuries.
      </>
    ),
    lien: { href: "/modules/fiscalite/blocage-prix/", libelle: "Le blocage des prix" },
  },
];
