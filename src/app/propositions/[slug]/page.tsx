import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModeLecture } from "@/components/lecture/ModeLecture";
import { FilAriane } from "@/components/modules/FilAriane";
import { MarquerLue } from "@/components/modules/MarquerLue";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { BadgeVerdict } from "@/components/pedago/Encadres";
import { SourcesPage } from "@/components/pedago/SourcesPage";
import { getModule, moduleHref, rubriqueColors } from "@/content/modules";
import { PARTIES, PARTIES_FICHE, getProposition, propositionHref, propositions } from "@/content/propositions";
import { EtEnsuite } from "@/components/layout/EtEnsuite";
import { suiteProposition } from "@/content/suite";
import { ancre } from "@/lib/ancre";
import { sourcesPage } from "@/lib/sources-page";

export const dynamicParams = false;

export function generateStaticParams() {
  return propositions.filter((p) => p.contenu).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/propositions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProposition(slug);
  return p ? { title: p.titre, description: `${p.titre} : l'idée, le mécanisme, les arguments, les chiffres et le verdict.` } : {};
}

export default async function PagePropositionFiche({ params }: PageProps<"/propositions/[slug]">) {
  const { slug } = await params;
  const p = getProposition(slug);
  if (!p?.contenu) notFound();
  const { default: Texte } = await p.contenu();
  const m = getModule(p.module);
  const href = propositionHref(slug);
  // Fiches refondues : les sources des chiffres cités sont listées en bas de page.
  const mdx = p.refondue ? readFileSync(join(process.cwd(), "src/content/propositions", `${slug}.mdx`), "utf8") : "";
  const sources = sourcesPage(mdx);
  // Le plan ne garde que les parties présentes (« Et si on le faisait ? » est facultative).
  const plan = p.refondue
    ? PARTIES_FICHE.filter((x) => (x.titre === "Sources" ? sources.length > 0 : mdx.includes(`## ${x.titre}\n`))).map((x) => ({
        titre: x.titre,
        approfondi: "approfondi" in x && x.approfondi,
      }))
    : PARTIES.map((x) => ({ titre: x, approfondi: false }));

  return (
    <ModuleTheme color={rubriqueColors.propositions}>
      <MarquerLue href={href} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <FilAriane etapes={[{ label: "Décrypter", href: "/decrypter/" }, { label: "Les propositions au crible", href: "/propositions/" }, { label: p.titre }]} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            <header className="border-b border-line pb-6">
              <p className="text-sm font-semibold text-accent">Proposition passée au crible · {p.themes.join(" · ")}</p>
              <h1 className="mt-2 font-serif text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">{p.titre}</h1>
              <ModeLecture className="mt-5" />
              {/* Fiche refondue : le verdict est dans « En 30 secondes ». */}
              {p.verdict && !p.refondue && (
                <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                  Verdict : <BadgeVerdict niveau={p.verdict} />
                  <a href={`#${ancre(PARTIES[5])}`} className="underline underline-offset-4 hover:text-ink">
                    lire la justification
                  </a>
                </p>
              )}
            </header>
            <article className="prose-eco fiche-proposition mt-8 max-w-none">
              <Texte />
            </article>
            <SourcesPage sources={sources} />
            <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
              Le mécanisme est expliqué en détail dans le module{" "}
              <Link href={moduleHref(m.slug)} className="font-medium text-accent underline underline-offset-4">
                {m.title}
              </Link>
              . <Link href="/propositions/" className="underline underline-offset-4 hover:text-ink">Toutes les propositions</Link>
            </p>
          </div>
          <aside>
            <nav aria-label="Plan de la fiche" className="rounded-2xl border border-line bg-surface p-4 text-sm lg:sticky lg:top-20">
              <p className="font-semibold text-ink">Plan de la fiche</p>
              <ol className="mt-3 space-y-1.5">
                {plan.map((x) => (
                  <li key={x.titre} data-selon-mode={x.approfondi ? "approfondi" : undefined}>
                    <a href={`#${ancre(x.titre)}`} className="text-body hover:text-accent hover:underline">
                      {x.titre}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        </div>
        <EtEnsuite suggestions={suiteProposition(p.slug)} />
      </div>
    </ModuleTheme>
  );
}
