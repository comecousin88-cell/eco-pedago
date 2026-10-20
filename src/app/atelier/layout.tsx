import { FilAriane } from "@/components/modules/FilAriane";
import { ModuleTheme } from "@/components/modules/ModuleTheme";
import { getModule } from "@/content/modules";

/** Page de travail (non référencée) : toutes les briques pédagogiques en situation. */
export default function AtelierLayout({ children }: LayoutProps<"/atelier">) {
  return (
    <ModuleTheme color={getModule("deficit-et-dette").color}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <FilAriane etapes={[{ label: "Atelier" }]} />
        <article className="prose-eco mt-6 max-w-none">{children}</article>
      </div>
    </ModuleTheme>
  );
}
