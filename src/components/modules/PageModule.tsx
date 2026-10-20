import type { ReactNode } from "react";
import { BarreParcours } from "@/components/lecture/BarreParcours";
import { ModeLecture } from "@/components/lecture/ModeLecture";
import { Quiz, type QuestionQuiz } from "@/components/pedago/Quiz";
import { moduleHref, type ModuleInfo } from "@/content/modules";
import { FilAriane } from "./FilAriane";
import { MarquerLue } from "./MarquerLue";
import { ModuleTheme } from "./ModuleTheme";
import { NavModule } from "./NavModule";
import { ProgressionModule } from "./ProgressionModule";

/**
 * Mise en page d'une page de module (introduction ou section) : fil d'Ariane,
 * en-tête, interrupteur de lecture, barre de parcours, texte, quiz en fin de
 * module, progression et navigation.
 */
export function PageModule({
  module,
  section,
  quiz,
  children,
}: {
  module: ModuleInfo;
  /** Slug de la section ; absent sur la page d'introduction. */
  section?: string;
  /** Questions du quiz, affichées sur la dernière page du module. */
  quiz?: QuestionQuiz[];
  children: ReactNode;
}) {
  const index = section ? module.sections.findIndex((s) => s.slug === section) : -1;
  const infoSection = index >= 0 ? module.sections[index] : undefined;
  const derniere = module.sections.length === 0 ? !section : index === module.sections.length - 1;
  const href = moduleHref(module.slug, section);

  return (
    <ModuleTheme color={module.color}>
      <MarquerLue href={href} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <FilAriane
          etapes={[
            { label: "Modules", href: "/modules/" },
            infoSection
              ? { label: `${module.number}. ${module.title}`, href: moduleHref(module.slug) }
              : { label: `${module.number}. ${module.title}` },
            ...(infoSection ? [{ label: infoSection.title }] : []),
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            <header className="border-b border-line pb-6">
              <p className="text-sm font-semibold text-accent">
                Module {module.number}
                {infoSection && (
                  <span className="font-normal text-muted">
                    {" "}
                    · section {index + 1} sur {module.sections.length}
                  </span>
                )}
              </p>
              <h1 className="mt-2 font-serif text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl">
                {infoSection ? infoSection.title : module.title}
              </h1>
              {!infoSection && <p className="mt-3 text-lg text-muted">{module.question}</p>}
              <ModeLecture detaille className="mt-5" />
            </header>

            <div className="mt-6">
              <BarreParcours href={href} />
            </div>

            <article className="prose-eco mt-8 max-w-none">{children}</article>

            {derniere && quiz && quiz.length > 0 && <Quiz module={module.slug} questions={quiz} />}

            <NavModule module={module.slug} section={section} />
          </div>

          {module.sections.length > 0 && (
            <aside>
              <div className="lg:sticky lg:top-20">
                <ProgressionModule module={module.slug} sections={module.sections} courante={section} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </ModuleTheme>
  );
}
