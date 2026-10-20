import Link from "next/link";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { SoonBadge } from "@/components/ui/SoonBadge";
import { modules } from "@/content/modules";

const PORTES = [
  {
    titre: "Comprendre la dette en 10 minutes",
    texte: "Le parcours guidé pour grands débutants : déficit, dette, taux, en sept étapes.",
    href: "/parcours/",
    disponible: false,
  },
  {
    titre: "La France en 10 chiffres",
    texte: "La situation des finances publiques en un coup d'œil, chiffres sourcés et datés.",
    href: "/la-france-en-10-chiffres/",
    disponible: false,
  },
  {
    titre: "Tous les modules",
    texte: "Treize modules, de la définition du PIB aux grandes sorties de crise de la dette.",
    href: "/modules/",
    disponible: true,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
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
        <Link
          href="/modules/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-page transition hover:opacity-85"
        >
          Commencer
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section aria-labelledby="portes" className="border-t border-line py-12">
        <h2 id="portes" className="font-serif text-2xl font-semibold text-ink">
          Par où commencer ?
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {PORTES.map((p) => {
            const contenu = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-ink">{p.titre}</h3>
                  {!p.disponible && <SoonBadge />}
                </div>
                <p className="mt-2 text-muted">{p.texte}</p>
              </>
            );
            const classes = "flex h-full flex-col rounded-2xl border border-line bg-surface p-6";
            return (
              <li key={p.href}>
                {p.disponible ? (
                  <Link href={p.href} className={`${classes} transition hover:shadow-md`}>
                    {contenu}
                  </Link>
                ) : (
                  <div className={classes}>{contenu}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="premiers" className="border-t border-line py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="premiers" className="font-serif text-2xl font-semibold text-ink">
            Les premiers modules
          </h2>
          <Link href="/modules/" className="text-sm font-medium text-accent underline underline-offset-4">
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
