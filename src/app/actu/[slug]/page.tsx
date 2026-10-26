import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EtatEcheance } from "@/components/actu/EtatEcheance";
import { TexteAvecChiffres } from "@/components/actu/TexteAvecChiffres";
import { CarteIndicateur } from "@/components/indicateurs/CarteIndicateur";
import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { Chiffre } from "@/components/pedago/Chiffre";
import { actuParSlug, construireFil, LIBELLES_TYPE } from "@/content/actu";
import {
  absenceDeResume,
  chiffresCles,
  deLaSource,
  liensPlusLoin,
  mentionResumeRedige,
  resumeDe,
  resumeOfficielDe,
  signalerErreurHref,
  titreResumeOfficiel,
} from "@/content/actu-pages";
import { site } from "@/content/site";
import { indicateurs } from "@/content/indicateurs";
import { rubriqueColors } from "@/content/modules";
import { getDonnee } from "@/lib/data";
import { formatDateDonnee, sourceCourte } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return construireFil().flatMap((e) => (e.slug ? [{ slug: e.slug }] : []));
}

export async function generateMetadata({ params }: PageProps<"/actu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = actuParSlug(slug);
  return e ? { title: e.titre, description: `${LIBELLES_TYPE[e.type]} du ${e.dateLibelle} : ${e.titre}. Source : ${e.source?.nom}.` } : {};
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  const id = titre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, "-");
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="font-serif text-2xl font-semibold text-ink">
        {titre}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function PageActualite({ params }: PageProps<"/actu/[slug]">) {
  const { slug } = await params;
  const e = actuParSlug(slug);
  if (!e) notFound();
  const resume = resumeDe(e);
  const officiel = resumeOfficielDe(e);
  const absence = absenceDeResume(e);
  const { indicateurs: cartes, donnees } = chiffresCles(e);
  const liens = liensPlusLoin(e);
  // Encadré déjà validé dans le fil (data/actu-explications.json), à défaut d'un résumé.
  const sens = resume?.ce_que_ca_veut_dire ?? e.explication;

  return (
    <ModuleTheme color={rubriqueColors.indicateurs}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "L'actu", href: "/actu/" }, { label: e.dateLibelle }]} />
        <header className="mt-6 border-b border-line pb-6">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <time dateTime={e.date} className="font-semibold text-ink">
              {e.dateLibelle}
            </time>
            <span className="rounded-full border border-line px-2 py-0.5 text-muted">{LIBELLES_TYPE[e.type]}</span>
            {e.sujet && <span className="text-muted">{e.sujet}</span>}
          </p>
          <h1
            lang={e.langue}
            title={e.titreOriginal ? `Titre original : ${e.titreOriginal}` : undefined}
            className="mt-3 font-serif text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl"
          >
            {e.titre}
          </h1>
          {e.titreOriginal && (
            <p className="mt-2 text-sm text-muted">
              Titre original : <span lang="en">{e.titreOriginal}</span>
            </p>
          )}
          {e.version && <p className="mt-2 text-sm text-muted">{e.version}</p>}
          {e.echeance && (
            <p className="mt-3 text-base">
              <EtatEcheance echeance={e.echeance} construitLe={new Date().toISOString().slice(0, 10)} />
            </p>
          )}
        </header>

        {officiel && e.source && (
          <Section titre={titreResumeOfficiel(officiel.organisme ?? e.source.nom)}>
            <blockquote cite={officiel.lien} className="space-y-3 border-l-4 border-accent pl-4 text-lg leading-relaxed text-body">
              {officiel.paragraphes.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </blockquote>
            <p className="mt-3 text-sm text-muted">
              Texte repris tel quel et en entier de{" "}
              <a href={officiel.lien} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-ink">
                {officiel.organisme ? `la version française du communiqué, sur le site ${deLaSource(officiel.organisme)}` : "la publication originale"}
                <span className="sr-only"> (nouvel onglet)</span>
              </a>{" "}
              ({officiel.licence}
              {officiel.mis_a_jour ? `, dernière mise à jour le ${officiel.mis_a_jour}` : ""}).
            </p>
          </Section>
        )}

        {resume && (
          <Section titre="En bref">
            <ul className="space-y-3 text-lg leading-relaxed text-body">
              {resume.en_bref.map((p, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <span>
                    <TexteAvecChiffres texte={p} />
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {!officiel && !resume && (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-subtle px-5 py-4">
            <p className="font-semibold text-ink">{absence ? "Résumé à lire sur le site de la source" : "Résumé à venir"}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {absence?.includes("anglais")
                ? `${e.source?.nom} publie son résumé en anglais : il n'est pas repris ici.`
                : absence && /en français|introuvable/.test(absence)
                  ? "La BCE ne publie pas ce communiqué en français sur son site : il n'est pas repris ici."
                  : absence
                  ? `Les conditions de réutilisation ${e.source ? `de ${e.source.nom}` : "de la source"} ne permettent pas de reprendre son texte ici.`
                  : "Le résumé officiel de cette publication n'est pas encore disponible ici."}{" "}
              Les chiffres clés, les pages qui expliquent le sujet et le lien vers l&apos;original sont ci-dessous.
            </p>
          </div>
        )}

        {(cartes.length > 0 || donnees.length > 0) && (
          <Section titre="Les chiffres clés">
            {cartes.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {cartes.map((id) => {
                  const ind = indicateurs.find((i) => i.id === id);
                  return ind ? <CarteIndicateur key={id} indicateur={ind} /> : null;
                })}
              </div>
            )}
            {donnees.length > 0 && (
              <ul className={`divide-y divide-line rounded-2xl border border-line bg-surface ${cartes.length ? "mt-4" : ""}`}>
                {donnees.map((id) => {
                  const d = getDonnee(id);
                  return (
                    <li key={id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <span className="text-sm text-body">
                        {d.label} <span className="text-muted">(données {formatDateDonnee(d.date)})</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="font-semibold text-ink tabular-nums">
                          <Chiffre id={id} exact />
                        </span>
                        {d.source.url && (
                          <a href={d.source.url} target="_blank" rel="noopener" className="ml-2 text-xs text-muted underline underline-offset-4 hover:text-ink">
                            {sourceCourte(d.source.nom)}
                            <span className="sr-only"> (nouvel onglet)</span>
                          </a>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        )}

        {sens && (
          <Section titre="Ce que ça veut dire">
            <p className="rounded-xl border border-accent-line bg-subtle px-5 py-4 text-lg leading-relaxed text-body">
              <TexteAvecChiffres texte={sens} />
            </p>
          </Section>
        )}

        <Section titre="Pour aller plus loin">
          <ul className="grid gap-3 sm:grid-cols-2">
            {liens.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">{l.type}</span>
                  <span className="mt-1 font-medium text-ink">{l.titre}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {e.source && (
          <Section titre="Source">
          <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-muted">Publié par</dt>
            <dd className="font-medium text-ink">{e.source.nom}</dd>
            <dt className="text-muted">Date</dt>
            <dd className="text-ink">{e.dateLibelle}</dd>
          </dl>
          <a
            href={e.source.url}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex items-center gap-1 rounded-full border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-subtle"
          >
            Lire l&apos;original
            <span className="sr-only"> (nouvel onglet)</span> ↗
          </a>
          {resume && <p className="mt-6 text-sm text-muted italic">{mentionResumeRedige(e.source.nom)}</p>}
          </Section>
        )}

        <p className="mt-8 text-sm">
          <a href={signalerErreurHref(e, site.url)} target="_blank" rel="noopener" className="text-muted underline underline-offset-4 hover:text-ink">
            Signaler une erreur sur cette page
            <span className="sr-only"> (nouvel onglet)</span> ↗
          </a>
        </p>

        <p className="mt-12 border-t border-line pt-6 text-sm">
          <Link href="/actu/" className="font-medium text-accent underline underline-offset-4">
            ← Toute l&apos;actu
          </Link>
        </p>
      </div>
    </ModuleTheme>
  );
}
