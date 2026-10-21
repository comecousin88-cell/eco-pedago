import type { Metadata } from "next";
import Link from "next/link";
import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { SoonBadge } from "@/components/ui/SoonBadge";
import { rubriqueColors } from "@/content/modules";

export const metadata: Metadata = {
  title: "Jeux",
  description: "Redresser les comptes de l'État, puis tenir le budget pendant un mandat : deux jeux pour se mettre à la place des décideurs.",
};

const JEUX = [
  {
    href: "/jeux/redresser-les-comptes/",
    titre: "Redresser les comptes",
    texte:
      "Trois objectifs, de l'effort minimal européen à la suppression du déficit, et plus de quarante mesures chiffrées. Vous voyez ce que rapporte chacune, quand, et qui paie.",
    disponible: true,
  },
  {
    href: "/jeux/ministre-des-finances/",
    titre: "Ministre des Finances",
    texte:
      "Cinq ans de mandat, un budget par an, des imprévus : croissance, taux, crises. Vos choix et leurs effets sur la dette, avec toutes les hypothèses affichées.",
    disponible: false,
  },
];

export default function PageJeux() {
  return (
    <ModuleTheme color={rubriqueColors.jeux}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "Jeux" }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Jeux</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Se mettre à la place de ceux qui décident : choisir, chiffrer, et voir les conséquences. Les jeux s&apos;appuient
          sur les mêmes chiffres sourcés que le reste du site.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {JEUX.map((j) => {
            const contenu = (
              <>
                <h2 className="font-serif text-xl font-semibold text-ink">{j.titre}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{j.texte}</p>
                <div className="mt-auto pt-4">{j.disponible ? <span className="text-sm font-medium text-accent">Jouer →</span> : <SoonBadge />}</div>
              </>
            );
            const classes = "flex h-full flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5";
            return (
              <li key={j.href}>
                {j.disponible ? (
                  <Link href={j.href} className={`${classes} transition hover:-translate-y-0.5 hover:shadow-md`}>
                    {contenu}
                  </Link>
                ) : (
                  <div className={`${classes} opacity-80`}>{contenu}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </ModuleTheme>
  );
}
