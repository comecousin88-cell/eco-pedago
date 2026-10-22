"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { rechercher, type EntreeRecherche } from "@/lib/recherche";

/**
 * Recherche dans tout le site : bouton loupe dans l'en-tête, raccourci « / ».
 * L'index (/recherche.json) est chargé à la première ouverture ; la recherche
 * se fait dans le navigateur.
 */
export function Recherche() {
  const [ouvert, setOuvert] = useState(false);
  const [requete, setRequete] = useState("");
  const [index, setIndex] = useState<EntreeRecherche[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [choix, setChoix] = useState(0);
  const champ = useRef<HTMLInputElement>(null);
  const dialogue = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const resultats = useMemo(() => (index ? rechercher(index, requete) : []), [index, requete]);

  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement;
      const saisie = cible.tagName === "INPUT" || cible.tagName === "TEXTAREA" || cible.isContentEditable;
      if (e.key === "/" && !saisie && !ouvert) {
        e.preventDefault();
        setOuvert(true);
      }
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [ouvert]);

  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (ouvert && !d.open) {
      d.showModal();
      champ.current?.focus();
      if (!index && !erreur)
        fetch("/recherche.json")
          .then((r) => r.json())
          .then(setIndex)
          .catch(() => setErreur(true));
    }
    if (!ouvert && d.open) d.close();
  }, [ouvert, index, erreur]);

  const aller = (href: string) => {
    setOuvert(false);
    setRequete("");
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="rounded-md p-2 text-body hover:bg-subtle"
        aria-label="Rechercher dans le site (raccourci : /)"
        title="Rechercher (/)"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </button>

      <dialog
        ref={dialogue}
        onClose={() => setOuvert(false)}
        onClick={(e) => e.target === dialogue.current && setOuvert(false)}
        aria-label="Rechercher dans le site"
        className="m-0 mx-auto mt-16 w-[min(40rem,calc(100%-2rem))] rounded-2xl border border-line bg-surface p-0 text-body shadow-xl backdrop:bg-ink/40"
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref={champ}
            type="search"
            value={requete}
            onChange={(e) => {
              setRequete(e.target.value);
              setChoix(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setChoix((c) => Math.min(c + 1, resultats.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setChoix((c) => Math.max(c - 1, 0));
              } else if (e.key === "Enter" && resultats[choix]) {
                e.preventDefault();
                aller(resultats[choix].href);
              }
            }}
            placeholder="Dette, retraite, TVA, spread…"
            aria-label="Mots à chercher"
            aria-controls="resultats-recherche"
            aria-activedescendant={resultats[choix] ? `resultat-${choix}` : undefined}
            className="w-full bg-transparent py-4 text-base text-ink outline-none placeholder:text-muted"
          />
          <button type="button" onClick={() => setOuvert(false)} className="rounded-md px-2 py-1 text-sm text-muted hover:bg-subtle">
            Fermer
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {erreur && <p className="p-3 text-sm text-warn">L&apos;index de recherche n&apos;a pas pu être chargé.</p>}
          {!erreur && !index && ouvert && <p className="p-3 text-sm text-muted">Chargement…</p>}
          {index && requete.trim() && resultats.length === 0 && (
            <p className="p-3 text-sm text-muted">Aucun résultat. Essayez un autre mot, ou consultez le glossaire.</p>
          )}
          {index && !requete.trim() && (
            <p className="p-3 text-sm text-muted">Pages, modules, fiches, idées reçues, glossaire et simulateurs.</p>
          )}
          <ul id="resultats-recherche" role="listbox" aria-label="Résultats">
            {resultats.map((r, i) => (
              <li key={`${r.href}-${i}`} id={`resultat-${i}`} role="option" aria-selected={i === choix}>
                <a
                  href={r.href}
                  onClick={(e) => {
                    e.preventDefault();
                    aller(r.href);
                  }}
                  onMouseEnter={() => setChoix(i)}
                  className={`block rounded-lg px-3 py-2 ${i === choix ? "bg-subtle" : ""}`}
                >
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">{r.type}</span>
                  <span className="block font-medium text-ink">{r.titre}</span>
                  <span className="block truncate text-sm text-muted">{r.extrait}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
