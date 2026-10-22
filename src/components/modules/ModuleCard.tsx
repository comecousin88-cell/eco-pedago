import Link from "next/link";
import { moduleHref, type ModuleInfo } from "@/content/modules";
import { themeDuModule } from "@/content/rubriques";
import { SoonBadge } from "@/components/ui/SoonBadge";
import { ModuleTheme } from "./ModuleTheme";

/** Carte d'un module dans le sommaire. Un module « bientôt » n'est pas cliquable. */
export function ModuleCard({ module }: { module: ModuleInfo }) {
  const disponible = module.status === "available";
  const contenu = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-accent">{themeDuModule(module.slug).titre}</span>
        {!disponible && <SoonBadge />}
      </div>
      <h3 className="mt-2 font-serif text-xl leading-snug font-semibold text-ink">{module.title}</h3>
      <p className="mt-1 font-medium text-body">{module.question}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{module.summary}</p>
      {disponible && (
        <span className="mt-4 text-sm font-medium text-accent">
          Commencer{" "}
          <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      )}
    </>
  );
  const classes = "flex h-full flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5";
  return (
    <ModuleTheme color={module.color} className="h-full">
      {disponible ? (
        <Link href={moduleHref(module.slug)} className={`group ${classes} transition hover:-translate-y-0.5 hover:shadow-md`}>
          {contenu}
        </Link>
      ) : (
        <div className={classes}>{contenu}</div>
      )}
    </ModuleTheme>
  );
}
