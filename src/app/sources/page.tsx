import type { Metadata } from "next";
import Link from "next/link";
import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { rubriqueColors } from "@/content/modules";
import { fichiers, toutesLesDonnees } from "@/lib/data";
import { formatDateDonnee } from "@/lib/format";
import { mesures } from "@/lib/game/mesures";

export const metadata: Metadata = {
  title: "Sources et méthode",
  description:
    "D'où viennent les chiffres du site, comment ils sont vérifiés et datés, les hypothèses des simulateurs et des jeux, et les limites de l'exercice.",
};

const THEMES: Record<string, string> = {
  aft: "Emprunt de l'État",
  "banque-centrale": "Banque centrale",
  budgets: "Budget de l'État",
  "cadre-europeen": "Cadre européen",
  cotisations: "Salaires, cotisations et impôts",
  dette: "Dette et déficit",
  europe: "Europe",
  "finances-publiques": "Recettes et dépenses publiques",
  fiscalite: "Fiscalité",
  grece: "La crise grecque",
  indicateurs: "Tableau de bord",
  international: "Comparaisons internationales et histoire",
  "jeu-ministre": "Jeu « Ministre des Finances » (hypothèses)",
  macro: "Économie",
  marches: "Marchés et taux d'intérêt",
  perspective: "Dette en perspective",
  propositions: "Propositions passées au crible",
  retraites: "Retraites",
};

const SIMULATEURS: { nom: string; hypotheses: string }[] = [
  {
    nom: "Effet boule de neige",
    hypotheses:
      "Relation exacte d(t+1) = d(t) × (1 + r) / (1 + g) − solde primaire ; taux et croissance constants, ou réglés année par année ; pas d'effet en retour de la dette sur les taux.",
  },
  {
    nom: "Les trois leviers des retraites",
    hypotheses:
      "Relation d'équilibre de la répartition (taux de prélèvement × cotisants = pension relative × retraités), calée sur les projections du COR ; l'effet d'un recul de l'âge est approché par une règle simple calibrée sur les équivalences publiées par le COR pour 2070.",
  },
  {
    nom: "Fiche de paie",
    hypotheses:
      "Salarié non cadre du secteur privé, à temps plein, taux de cotisations et réduction générale dégressive de l'année en cours ; impôt sur le revenu d'une personne seule sans autre revenu ; mutuelle et prévoyance non comptées.",
  },
  {
    nom: "Annulation de la dette détenue par la banque centrale",
    hypotheses:
      "Les bénéfices de la Banque de France reviennent à l'État ; les réserves restent rémunérées au taux de dépôt ; la prime de risque éventuelle s'applique aux emprunts nouveaux, cumulés au fil du refinancement.",
  },
  {
    nom: "Impôt sur les très grandes fortunes",
    hypotheses:
      "Assiette égale au patrimoine des 500 plus grandes fortunes ; impôts déjà payés déduits ; baisse de l'assiette proportionnelle au taux selon l'élasticité retenue par ses promoteurs.",
  },
  {
    nom: "Double charge de la capitalisation",
    hypotheses: "Modèle illustratif, chiffres d'exemple : les pensions promises s'éteignent linéairement, l'épargne nouvelle monte en régime.",
  },
  {
    nom: "Jeu « Redresser les comptes »",
    hypotheses:
      "Rendements annuels à effet plein, toutes choses égales par ailleurs, sans effet des mesures sur la croissance ; trajectoire de dette à déficit constant en points de PIB ; chaque mesure est répartie à parts égales entre ceux qui la paient.",
  },
  {
    nom: "Jeu « Ministre des Finances »",
    hypotheses:
      "Multiplicateurs, stabilisateurs automatiques, réaction de l'écart de taux et croissance de référence affichés dans le jeu ; taux allemand constant ; budgets votés reconduits d'une année sur l'autre, chocs ponctuels.",
  },
];

export default function PageSources() {
  const toutes = toutesLesDonnees();
  const aVerifier = toutes.filter((d) => d.statut === "a_verifier");
  const hypotheses = toutes.filter((d) => d.statut === "hypothese");
  const mesuresAVerifier = mesures.filter((m) => m.statut === "a_verifier");
  const derniereConsultation = toutes
    .map((d) => d.consulte_le)
    .filter((x): x is string => !!x)
    .sort()
    .at(-1);

  return (
    <ModuleTheme color={rubriqueColors.transverse}>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "Sources et méthode" }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Sources et méthode</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {toutes.length} données chiffrées alimentent le site. Chacune a une valeur, une unité, une date, une source et un
          statut. Dernière consultation des sources :{" "}
          {derniereConsultation ? formatDateDonnee(derniereConsultation).replace(/^au /, "le ") : "non renseignée"}.
        </p>

        <section aria-labelledby="methode" className="mt-10 space-y-3 leading-relaxed text-body">
          <h2 id="methode" className="font-serif text-2xl font-semibold text-ink">
            La méthode
          </h2>
          <p>
            <strong className="text-ink">Aucun chiffre écrit à la main.</strong> Les textes, graphiques et simulateurs lisent tous
            leurs chiffres dans des fichiers de données. Un test automatique bloque la publication si un chiffre n&apos;a pas de
            source, de date ou d&apos;unité. Survolez un chiffre souligné pour voir sa source.
          </p>
          <p>
            <strong className="text-ink">Trois statuts.</strong> « Vérifié » : relevé dans la source citée, à la date de
            consultation indiquée. « À vérifier » : ordre de grandeur en cours de documentation, signalé par un soulignement
            ondulé. « Hypothèse » : valeur choisie pour un calcul ou un jeu, présentée comme telle.
          </p>
          <p>
            <strong className="text-ink">Neutralité.</strong> Le site explique des mécanismes et ne soutient aucun parti : aucun
            parti ni responsable politique n&apos;est nommé dans les analyses. Quand un sujet fait débat, les meilleurs
            arguments des deux côtés sont présentés. Les verdicts des propositions portent sur le mécanisme et ses chiffres :
            « mécanisme solide », « débattu », « ne tient pas en l&apos;état ».
          </p>
          <p>
            <strong className="text-ink">Mise à jour.</strong> Les données sont mises à jour à la main, à partir des
            publications officielles. Une mise à jour automatique des indicateurs est prévue une fois le site en ligne.
          </p>
        </section>

        <section aria-labelledby="a-verifier" className="mt-10 rounded-2xl border border-line bg-surface p-5 text-body">
          <h2 id="a-verifier" className="font-semibold text-ink">
            Les chiffres à vérifier
          </h2>
          <p className="mt-1 text-sm">
            {aVerifier.length} donnée{aVerifier.length > 1 ? "s" : ""} et {mesuresAVerifier.length} mesure
            {mesuresAVerifier.length > 1 ? "s" : ""} du jeu « Redresser les comptes » sont encore à vérifier :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {aVerifier.map((d) => (
              <li key={d.id}>
                {d.label} ({d.date}) :{" "}
                {d.source.url ? (
                  <a href={d.source.url} className="underline underline-offset-2" target="_blank" rel="noopener">
                    {d.source.nom}
                  </a>
                ) : (
                  d.source.nom
                )}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sources" className="mt-10">
          <h2 id="sources" className="font-serif text-2xl font-semibold text-ink">
            Les sources, par thème
          </h2>
          <div className="mt-4 space-y-6">
            {Object.entries(fichiers).map(([cle, f]) => {
              const parSource = new Map<string, { url?: string; n: number; date: string }>();
              for (const d of f.donnees) {
                if (d.statut === "hypothese") continue;
                const deja = parSource.get(d.source.nom);
                parSource.set(d.source.nom, {
                  url: d.source.url,
                  n: (deja?.n ?? 0) + 1,
                  date: !deja || d.date > deja.date ? d.date : deja.date,
                });
              }
              if (parSource.size === 0) return null;
              return (
                <div key={cle}>
                  <h3 className="font-semibold text-ink">{THEMES[cle] ?? cle}</h3>
                  <ul className="mt-2 space-y-1 text-sm text-body">
                    {[...parSource.entries()].map(([nom, s]) => (
                      <li key={nom}>
                        {s.url ? (
                          <a href={s.url} className="underline underline-offset-2" target="_blank" rel="noopener">
                            {nom}
                          </a>
                        ) : (
                          nom
                        )}{" "}
                        <span className="text-muted">
                          · {s.n} donnée{s.n > 1 ? "s" : ""}, la plus récente {formatDateDonnee(s.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="hypotheses" className="mt-10 space-y-4 text-body">
          <h2 id="hypotheses" className="font-serif text-2xl font-semibold text-ink">
            Les hypothèses des simulateurs et des jeux
          </h2>
          <ul className="space-y-3">
            {SIMULATEURS.map((s) => (
              <li key={s.nom}>
                <strong className="text-ink">{s.nom}.</strong> {s.hypotheses}
              </li>
            ))}
          </ul>
          <div>
            <h3 className="font-semibold text-ink">Valeurs retenues comme hypothèses</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {hypotheses.map((d) => (
                <li key={d.id}>
                  {d.label} : {"valeur" in d ? d.valeur.toLocaleString("fr-FR") : ""} {d.unite}. <span className="text-muted">{d.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm">
            Le jeu « Redresser les comptes » cite la source et le statut de chacune de ses {mesures.length} mesures, et indique
            pour les autres le calcul effectué à partir de données vérifiées.
          </p>
        </section>

        <section aria-labelledby="limites" className="mt-10 space-y-3 leading-relaxed text-body">
          <h2 id="limites" className="font-serif text-2xl font-semibold text-ink">
            Les limites
          </h2>
          <p>
            Les simulateurs et les jeux reposent sur des modèles volontairement simples. Ils servent à comprendre des mécanismes
            et des ordres de grandeur, pas à prévoir. Ils négligent en général les effets en retour : réactions des ménages et
            des entreprises, effets sur la croissance, réaction des taux d&apos;intérêt, sauf mention contraire.
          </p>
          <p>
            Les définitions varient d&apos;une source à l&apos;autre : la dette au sens de Maastricht (Insee, Eurostat) diffère
            légèrement de la dette brute du FMI ; l&apos;indice des prix harmonisé (Eurostat) de l&apos;indice des prix de
            l&apos;Insee. Chaque graphique indique la source utilisée.
          </p>
          <p>
            Une erreur, une source plus récente ? Les données sont rangées par thème et chaque chiffre renvoie à sa source : la
            correction se fait au même endroit pour tout le site. Voir aussi le{" "}
            <Link href="/glossaire/" className="underline underline-offset-4">
              glossaire
            </Link>
            .
          </p>
        </section>
      </div>
    </ModuleTheme>
  );
}
