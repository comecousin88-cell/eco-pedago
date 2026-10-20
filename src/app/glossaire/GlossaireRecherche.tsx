"use client";

import { useDeferredValue, useState } from "react";
import type { EntreeGlossaire } from "@/content/glossaire";

/** Minuscules sans accents, pour chercher « deficit » comme « déficit ». */
function normaliser(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function GlossaireRecherche({
  entrees,
  noms,
}: {
  entrees: EntreeGlossaire[];
  noms: Record<string, string>;
}) {
  const [recherche, setRecherche] = useState("");
  const q = normaliser(useDeferredValue(recherche).trim());
  const visibles = q
    ? entrees.filter((e) => normaliser(`${e.terme} ${e.court} ${e.long}`).includes(q))
    : entrees;
  // Les termes dont le nom correspond passent avant ceux qui le citent seulement.
  const triees = q
    ? [...visibles].sort((a, b) => Number(!normaliser(a.terme).includes(q)) - Number(!normaliser(b.terme).includes(q)))
    : visibles;

  return (
    <>
      <div className="sticky top-16 z-10 -mx-4 mt-8 bg-page/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <label htmlFor="recherche-glossaire" className="sr-only">
          Chercher un terme
        </label>
        <input
          id="recherche-glossaire"
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Chercher un terme : dette, OAT, inflation…"
          className="w-full rounded-full border border-line-strong bg-surface px-5 py-3 text-ink placeholder:text-muted"
        />
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {q ? `${triees.length} résultat${triees.length > 1 ? "s" : ""}` : ""}
        </p>
      </div>

      <dl className="mt-4 space-y-4">
        {triees.map((e) => (
          <div key={e.id} id={e.id} className="scroll-mt-36 rounded-2xl border border-line bg-surface p-5 target:border-accent target:ring-2 target:ring-accent-line">
            <dt className="font-serif text-xl font-semibold text-ink">{e.terme}</dt>
            <dd className="mt-2 font-medium text-body">{e.court}</dd>
            <dd className="mt-2 leading-relaxed text-muted">{e.long}</dd>
            {e.voir && e.voir.length > 0 && (
              <dd className="mt-3 text-sm text-muted">
                Voir aussi :{" "}
                {e.voir.map((v, i) => (
                  <span key={v}>
                    {i > 0 && ", "}
                    <a href={`#${v}`} className="font-medium text-accent underline underline-offset-4">
                      {noms[v]}
                    </a>
                  </span>
                ))}
              </dd>
            )}
          </div>
        ))}
      </dl>
      {triees.length === 0 && (
        <p className="mt-6 text-muted">
          Aucun terme ne correspond. Le glossaire s&apos;enrichit au fil des modules.
        </p>
      )}
    </>
  );
}
