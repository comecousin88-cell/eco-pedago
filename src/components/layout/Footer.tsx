import Link from "next/link";
import { rubriques } from "@/content/rubriques";
import { site } from "@/content/site";

/** Les cinq rubriques, puis les pages de référence rangées dans le pied de page. */
const LIENS = [
  ...rubriques.map((r) => ({ href: r.href, libelle: r.label })),
  { href: "/la-france-en-10-chiffres/", libelle: "La France en 10 chiffres" },
  { href: "/tableau-de-bord/", libelle: "Tableau de bord" },
  { href: "/glossaire/", libelle: "Glossaire" },
  { href: "/sources/", libelle: "Sources et méthode" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl space-y-2 px-4 py-8 text-sm text-muted sm:px-6">
        <nav aria-label="Pied de page" className="mb-4">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {LIENS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-body underline-offset-4 hover:text-ink hover:underline">
                  {l.libelle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>
          <span className="font-serif font-semibold text-body">{site.name}</span>
          {" "}: un site pédagogique pour comprendre les finances publiques françaises.
          Il explique des mécanismes et ne soutient aucun parti : quand un sujet fait
          débat, les arguments des deux côtés sont présentés.
        </p>
        <p>
          Chaque chiffre a une source et une date. Ceux qui n&apos;ont pas encore été
          vérifiés sont signalés.
        </p>
        <p>
          Les simulateurs reposent sur des modèles volontairement simplifiés. Ils
          servent à comprendre des mécanismes, pas à faire des prévisions ni à
          remplacer un conseil financier.
        </p>
        <p className="pt-2">Créé par Côme Cousin</p>
      </div>
    </footer>
  );
}
