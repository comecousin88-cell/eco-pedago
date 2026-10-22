import Link from "next/link";
import { BandeauAlertes } from "@/components/indicateurs/BandeauAlertes";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { CartesParcours } from "@/components/lecture/CartesParcours";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { CarteProposition, versCarte } from "@/components/propositions/CarteProposition";
import { modules, rubriqueColors } from "@/content/modules";
import { idees } from "@/content/idees-recues";
import { propositions, propositionsPhares } from "@/content/propositions";

const RACCOURCIS = [
  { href: "/la-france-en-10-chiffres/", titre: "La France en 10 chiffres", texte: "La situation des finances publiques en un coup d'œil, chiffres sourcés et datés." },
  { href: "/tableau-de-bord/", titre: "Tableau de bord", texte: "Taux, inflation, chômage, dette, déficit : les sept indicateurs à suivre." },
  { href: "/idees-recues/", titre: "Idées reçues", texte: `${idees.length} affirmations qu'on entend souvent, vérifiées chiffres à l'appui.` },
  { href: "/jouer/", titre: "Jouer", texte: "Redresser les comptes, tenir le budget pendant un mandat, et tous les simulateurs." },
];

/** Les trois portes d'entrée du site. */
const PORTES = [
  {
    href: "/comprendre/#commencer",
    titre: "Comprendre les bases",
    texte: "PIB, déficit, dette, taux : les notions de départ, en parcours guidé de trois quarts d'heure.",
    action: "Commencer",
  },
  {
    href: "/actu/",
    titre: "Suivre l'actualité",
    texte: "Les indicateurs mis à jour chaque jour ouvré, les seuils franchis et les échéances à venir.",
    action: "Voir l'actu",
  },
  {
    href: "/decrypter/",
    titre: "Me faire un avis sur une proposition",
    texte: "Annuler la dette, taxer les plus riches, retraite à 60 ans : arguments, chiffres et verdict.",
    action: "Décrypter",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="pt-6">
        <BandeauAlertes />
      </div>
      <section className="py-14 sm:py-20">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">Les finances publiques, sans le jargon</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl">
          Dette, déficit, retraites : comprendre ce qui se joue vraiment
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          D&apos;où vient l&apos;argent public, comment l&apos;État emprunte, pourquoi la hausse des
          taux coûte cher, qui paie les retraites. Des explications simples, des chiffres
          sourcés et des simulateurs pour tester par vous-même. Sans parti pris : quand un
          sujet fait débat, vous avez les arguments des deux côtés.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {PORTES.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
              >
                <span className="font-serif text-xl font-semibold text-ink">{p.titre}</span>
                <span className="mt-2 text-sm leading-relaxed text-muted">{p.texte}</span>
                <span className="mt-auto pt-4 text-sm font-medium text-accent">
                  {p.action}{" "}
                  <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="parcours" className="border-t border-line py-12">
        <h2 id="parcours" className="font-serif text-2xl font-semibold text-ink">
          Choisissez votre parcours
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Deux façons de lire le site. Vous pouvez passer de l&apos;une à l&apos;autre à tout moment avec
          l&apos;interrupteur « Simple / Approfondi ».
        </p>
        <div className="mt-6">
          <CartesParcours />
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RACCOURCIS.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="font-semibold text-ink">{r.titre}</span>
                <span className="mt-1 text-sm text-muted">{r.texte}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ModuleTheme color={rubriqueColors.propositions}>
        <section aria-labelledby="propositions" className="border-t border-line py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="propositions" className="font-serif text-2xl font-semibold text-ink">
              Les propositions au crible
            </h2>
            <Link href="/propositions/" className="text-sm font-medium text-accent underline underline-offset-4">
              Voir les {propositions.length} fiches
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-muted">
            Les idées qui reviennent dans le débat, présentées sous leur meilleur jour, chiffrées, puis jugées sur leur
            mécanisme, jamais sur ceux qui les portent.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {propositionsPhares.map((p) => (
              <li key={p.slug}>
                <CarteProposition fiche={versCarte(p)} />
              </li>
            ))}
          </ul>
        </section>
      </ModuleTheme>

      <section aria-labelledby="premiers" className="border-t border-line py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="premiers" className="font-serif text-2xl font-semibold text-ink">
            Les premiers modules
          </h2>
          <Link href="/comprendre/" className="text-sm font-medium text-accent underline underline-offset-4">
            Voir les {modules.length} modules
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.slice(0, 3).map((m) => (
            <li key={m.slug}>
              <ModuleCard module={m} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
