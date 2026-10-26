"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { rechercher, type EntreeRecherche } from "@/lib/recherche";

/**
 * Barre de recherche dans tout le site (pages, modules, fiches, idées reçues,
 * termes du glossaire), affichée en haut de la page Glossaire. Même index que
 * la recherche du raccourci « / » (/recherche.json), chargé au premier usage.
 */
export function RechercheSite() {
  const [requete, setRequete] = useState("");
  const [index, setIndex] = useState<EntreeRecherche[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const resultats = useMemo(() => (index ? rechercher(index, requete).slice(0, 8) : []), [index, requete]);

  useEffect(() => {
    if (!requete.trim() || index || erreur) return;
    let annule = false;
    fetch("/recherche.json")
      .then((r) => r.json())
      .then((x: EntreeRecherche[]) => !annule && setIndex(x))
      .catch(() => !annule && setErreur(true));
    return () => {
      annule = true;
    };
  }, [requete, index, erreur]);

  return (
    <search className="mt-6 rounded-2xl border border-line bg-surface p-4">
      <label htmlFor="recherche-site" className="text-sm font-semibold text-ink">
        Rechercher dans tout le site
      </label>
      <p className="mt-0.5 text-xs text-muted">Pages, modules, fiches, idées reçues et termes du glossaire. Raccourci sur toutes les pages : touche « / ».</p>
      <input
        id="recherche-site"
        type="search"
        value={requete}
        onChange={(e) => setRequete(e.target.value)}
        placeholder="Dette, retraite, TVA, spread…"
        className="mt-3 w-full rounded-xl border border-line bg-page px-4 py-2.5 text-base text-ink outline-none placeholder:text-muted focus:border-accent"
      />
      {requete.trim() && (
        <div aria-live="polite" className="mt-2">
          {erreur && <p className="p-2 text-sm text-muted">L&apos;index de recherche n&apos;a pas pu être chargé.</p>}
          {!erreur && !index && <p className="p-2 text-sm text-muted">Chargement…</p>}
          {index && resultats.length === 0 && <p className="p-2 text-sm text-muted">Aucun résultat dans le site. Les termes du glossaire sont ci-dessous.</p>}
          <ul className="divide-y divide-line">
            {resultats.map((r, i) => (
              <li key={`${r.href}-${i}`}>
                <Link href={r.href} className="block rounded-lg px-2 py-2 hover:bg-subtle">
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">{r.type}</span>
                  <span className="block font-medium text-ink">{r.titre}</span>
                  <span className="block truncate text-sm text-muted">{r.extrait}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </search>
  );
}
