"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MARGE = 12;

export function TermeInfobulle({
  id,
  terme,
  definition,
  children,
}: {
  id: string;
  terme: string;
  definition: string;
  children: ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [decalage, setDecalage] = useState(0);
  const conteneur = useRef<HTMLSpanElement>(null);
  const bulle = useRef<HTMLSpanElement>(null);
  const bulleId = useId();

  // Fermer avec Échap ou par un clic en dehors.
  useEffect(() => {
    if (!ouvert) return;
    const clavier = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    const clic = (e: PointerEvent) => {
      if (!conteneur.current?.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener("keydown", clavier);
    document.addEventListener("pointerdown", clic);
    return () => {
      document.removeEventListener("keydown", clavier);
      document.removeEventListener("pointerdown", clic);
    };
  }, [ouvert]);

  // Garder la bulle dans l'écran (utile sur téléphone).
  useLayoutEffect(() => {
    if (!ouvert || !bulle.current) return;
    const r = bulle.current.getBoundingClientRect();
    const largeur = document.documentElement.clientWidth;
    if (r.left < MARGE) setDecalage((d) => d + MARGE - r.left);
    else if (r.right > largeur - MARGE) setDecalage((d) => d - (r.right - (largeur - MARGE)));
  }, [ouvert]);

  return (
    <span ref={conteneur} className="relative inline">
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls={bulleId}
        onClick={() => {
          setDecalage(0);
          setOuvert((o) => !o);
        }}
        className="cursor-help font-[inherit] text-inherit underline decoration-accent decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid"
      >
        {children}
      </button>
      {ouvert && (
        <span
          ref={bulle}
          id={bulleId}
          role="note"
          style={{ transform: `translateX(calc(-50% + ${decalage}px))` }}
          className="absolute top-full left-1/2 z-30 mt-2 block w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-4 text-left text-sm leading-relaxed font-normal text-body shadow-lg"
        >
          <span className="block font-semibold text-ink">{terme}</span>
          <span className="mt-1 block">{definition}</span>
          <Link
            href={`/glossaire/#${id}`}
            className="mt-2 inline-block font-medium text-accent underline underline-offset-4"
          >
            Voir dans le glossaire
          </Link>
        </span>
      )}
    </span>
  );
}
