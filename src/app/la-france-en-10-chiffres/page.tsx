import type { Metadata } from "next";
import Link from "next/link";
import { FilAriane } from "@/components/modules/FilAriane";
import { MarquerLue } from "@/components/modules/MarquerLue";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { chiffresCles } from "@/content/france-10-chiffres";
import { rubriqueColors } from "@/content/modules";
import { getDonnee } from "@/lib/data";
import { formatSource } from "@/lib/format";

export const metadata: Metadata = {
  title: "La France en 10 chiffres",
  description: "Dette, déficit, dépenses, impôts, intérêts, retraites, taux, inflation, chômage : la situation des finances publiques en dix chiffres sourcés.",
};

export default function PageFranceEn10Chiffres() {
  return (
    <ModuleTheme color={rubriqueColors.indicateurs}>
      <MarquerLue href="/la-france-en-10-chiffres/" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "La France en 10 chiffres" }]} />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">La France en 10 chiffres</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          La situation des finances publiques en un coup d&apos;œil. Chaque chiffre est daté et sourcé (survolez-le pour voir la
          source), et renvoie vers la page qui l&apos;explique.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {chiffresCles.map((c, i) => {
            const d = getDonnee(c.donnee);
            return (
              <li key={c.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
                <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                  {i + 1}. {c.titre}
                </p>
                <p className="mt-2 font-serif text-3xl font-semibold text-ink [&_span]:font-semibold">{c.valeur}</p>
                <p className="mt-2 text-sm leading-relaxed text-body">{c.phrase}</p>
                <p className="mt-3 text-sm">
                  <Link href={c.lien.href} className="font-medium text-accent underline underline-offset-4">
                    {c.lien.libelle}
                  </Link>
                </p>
                <p className="mt-auto pt-3 text-xs text-muted">{formatSource(d)}</p>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 text-sm text-muted">
          Ces chiffres sont mis à jour à la main, à partir des publications de l&apos;Insee, de la BCE, d&apos;Eurostat, de la
          Banque de France et du Conseil d&apos;orientation des retraites. Voir{" "}
          <Link href="/sources/" className="underline underline-offset-4">
            Sources et méthode
          </Link>{" "}
          et le{" "}
          <Link href="/tableau-de-bord/" className="underline underline-offset-4">
            tableau de bord
          </Link>
          .
        </p>
      </div>
    </ModuleTheme>
  );
}
