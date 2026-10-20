"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { site } from "@/content/site";

export interface LigneSource {
  nom: string;
  url?: string;
  date: string;
  aVerifier: boolean;
  /** Montant de comparaison choisi pour l'illustration, pas une donnée observée. */
  hypothese?: boolean;
}

function nomDeFichier(titre: string) {
  const slug = titre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `eco-en-clair-${slug || "graphique"}.png`;
}

export function FigureCadre({
  titre,
  resume,
  sources,
  sourceLibre,
  children,
}: {
  titre: string;
  resume: string;
  sources: LigneSource[];
  sourceLibre?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const titreId = useId();
  const [etat, setEtat] = useState<"repos" | "export" | "erreur">("repos");

  async function partager() {
    if (!ref.current) return;
    setEtat("export");
    try {
      const { toPng } = await import("html-to-image");
      const fond = getComputedStyle(ref.current).backgroundColor;
      const url = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: fond,
        // Le bouton de partage n'a rien à faire sur l'image.
        filter: (n) => !(n instanceof HTMLElement && n.dataset.exportIgnore === "true"),
      });
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = nomDeFichier(titre);
      lien.click();
      setEtat("repos");
    } catch {
      setEtat("erreur");
    }
  }

  return (
    <figure
      ref={ref}
      aria-labelledby={titreId}
      className="my-8 -mx-2 rounded-2xl border border-line bg-surface p-3 sm:mx-0 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <h3 id={titreId} className="min-w-0 flex-1 basis-56 font-serif text-lg font-semibold text-ink sm:text-xl">
          {titre}
        </h3>
        <button
          type="button"
          onClick={partager}
          disabled={etat === "export"}
          data-export-ignore="true"
          className="shrink-0 rounded-full border border-line px-3 py-1 text-sm font-medium text-muted transition-colors hover:border-line-strong hover:text-ink disabled:opacity-60"
        >
          {etat === "export" ? "Export…" : "Partager (PNG)"}
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{resume}</p>

      <div className="mt-5">{children}</div>

      <figcaption className="mt-5 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        {sources.map((s) =>
          s.hypothese ? (
            <span key={s.nom} className="block">
              Hypothèse : {s.nom}
            </span>
          ) : (
            <span key={s.nom} className="block">
              Source :{" "}
              {s.url ? (
                <a href={s.url} className="underline underline-offset-2 hover:text-ink" rel="noopener" target="_blank">
                  {s.nom}
                </a>
              ) : (
                s.nom
              )}{" "}
              — données {s.date}
              {s.aVerifier && (
                <span className="ml-1.5 rounded bg-warn-soft px-1.5 py-0.5 font-semibold text-warn">
                  chiffre à vérifier
                </span>
              )}
            </span>
          ),
        )}
        {sourceLibre && <span className="block">{sourceLibre}</span>}
        <span className="mt-1 block font-serif font-semibold text-body">{site.name}</span>
      </figcaption>
      {etat === "erreur" && (
        <p role="alert" data-export-ignore="true" className="mt-2 text-sm text-bad">
          L&apos;export de l&apos;image a échoué. Vous pouvez faire une capture d&apos;écran à la place.
        </p>
      )}
    </figure>
  );
}
