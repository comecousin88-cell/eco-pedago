import type { ReactNode } from "react";

/**
 * Les arguments des deux camps, toujours affichés (contrairement à l'encadré
 * « Débat », qui se replie en mode Simple) : dans une fiche, ils sont le cœur
 * de l'analyse. Les partisans sont présentés en premier, sous leur meilleur jour.
 */
export function ArgumentsFiche({
  pour,
  contre,
  titrePour = "Les meilleurs arguments des partisans",
  titreContre = "Les meilleurs arguments des opposants",
}: {
  pour: ReactNode;
  contre: ReactNode;
  titrePour?: string;
  titreContre?: string;
}) {
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border border-line bg-surface p-5" aria-label={titrePour}>
        <p className="font-semibold text-ink">{titrePour}</p>
        <div className="prose-eco mt-3 max-w-none text-base">{pour}</div>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-5" aria-label={titreContre}>
        <p className="font-semibold text-ink">{titreContre}</p>
        <div className="prose-eco mt-3 max-w-none text-base">{contre}</div>
      </section>
    </div>
  );
}

/** « Ce qui tient / ce qui ne tient pas / ce qui reste débattu » : la grille du verdict. */
export function GrilleVerdict({ tient, tientPas, debattu }: { tient: ReactNode; tientPas: ReactNode; debattu: ReactNode }) {
  const colonnes = [
    { titre: "Ce qui tient", contenu: tient, classes: "border-ok bg-ok-soft", icone: "✓" },
    { titre: "Ce qui ne tient pas", contenu: tientPas, classes: "border-bad bg-bad-soft", icone: "✕" },
    { titre: "Ce qui reste débattu", contenu: debattu, classes: "border-warn bg-warn-soft", icone: "≈" },
  ];
  return (
    <div className="my-6 grid gap-3 md:grid-cols-3">
      {colonnes.map((c) => (
        <section key={c.titre} className={`rounded-2xl border-l-4 p-4 ${c.classes}`}>
          <p className="font-semibold text-ink">
            <span aria-hidden="true" className="mr-1.5">
              {c.icone}
            </span>
            {c.titre}
          </p>
          <div className="prose-eco mt-2 max-w-none text-sm">{c.contenu}</div>
        </section>
      ))}
    </div>
  );
}
