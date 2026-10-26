"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ModuleSection } from "@/content/modules";
import { Cadenas, LienVerrouille, useEtapes } from "./Etapes";
import { ProgressionModule } from "./ProgressionModule";

const BOUTON = "flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-3 text-sm font-medium";

/**
 * Sur mobile, une barre fixe en bas de l'écran : « ← Précédent · Sommaire ·
 * Suivant → ». « Suivant » respecte le verrouillage des sections : une
 * section verrouillée ramène au bouton « J'ai compris » de la section en
 * cours. « Sommaire » ouvre le panneau « Progression » du module.
 */
export function BarreModuleMobile({
  module,
  sections,
  courante,
  precedente,
  suivante,
}: {
  module: string;
  sections: ModuleSection[];
  courante?: string;
  precedente?: { href: string; titre: string };
  suivante?: { href: string; titre: string };
}) {
  const [sommaire, setSommaire] = useState(false);
  const hrefs = sections.map((s) => `/modules/${module}/${s.slug}/`);
  const { etats, enCours } = useEtapes(hrefs);
  const i = suivante ? hrefs.indexOf(suivante.href) : -1;
  const verrouillee = i >= 0 && etats[i] === "verrouillee" && enCours;

  // Échap ferme le sommaire.
  useEffect(() => {
    if (!sommaire) return;
    const clavier = (e: KeyboardEvent) => e.key === "Escape" && setSommaire(false);
    document.addEventListener("keydown", clavier);
    return () => document.removeEventListener("keydown", clavier);
  }, [sommaire]);

  return (
    <>
      <nav aria-label="Navigation dans le module" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        {precedente ? (
          <Link href={precedente.href} className={`${BOUTON} text-body`}>
            <span aria-hidden="true">←</span> Précédent
            <span className="sr-only"> : {precedente.titre}</span>
          </Link>
        ) : (
          <span className={`${BOUTON} text-muted`} aria-hidden="true" />
        )}
        <button type="button" onClick={() => setSommaire(true)} aria-expanded={sommaire} className={`${BOUTON} border-x border-line text-ink`}>
          Sommaire
        </button>
        {suivante && verrouillee ? (
          <LienVerrouille enCours={enCours!} label={`Suivant : ${suivante.titre} (verrouillée, termine d’abord la section en cours)`} className={`${BOUTON} text-muted`}>
            Suivant <Cadenas />
          </LienVerrouille>
        ) : suivante ? (
          <Link href={suivante.href} className={`${BOUTON} text-body`}>
            Suivant <span aria-hidden="true">→</span>
            <span className="sr-only"> : {suivante.titre}</span>
          </Link>
        ) : (
          <span className={`${BOUTON} text-muted`} aria-hidden="true" />
        )}
      </nav>

      {sommaire && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Sommaire du module">
          <button type="button" aria-label="Fermer le sommaire" onClick={() => setSommaire(false)} className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-page p-4 pb-6 shadow-lg">
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => setSommaire(false)} className="rounded-full border border-line px-3 py-1 text-sm text-body hover:text-ink">
                Fermer
              </button>
            </div>
            {/* Un clic sur une section ferme le sommaire. */}
            <div onClick={(e) => (e.target as HTMLElement).closest("a") && setSommaire(false)}>
              <ProgressionModule module={module} sections={sections} courante={courante} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
