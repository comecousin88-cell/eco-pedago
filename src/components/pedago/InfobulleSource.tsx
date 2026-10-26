"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const MARGE = 12;

/**
 * Un chiffre et sa source : la source n'est plus écrite entre parenthèses
 * dans le texte, elle s'affiche dans une infobulle au survol, au clavier ou
 * d'un toucher. La liste complète des sources est en bas de la page.
 * L'infobulle reste toujours dans le DOM (lue par les lecteurs d'écran
 * grâce à aria-describedby), et ne s'affiche qu'à l'ouverture.
 */
export function InfobulleSource({ source, children, className = "" }: { source: string; children: ReactNode; className?: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [decalage, setDecalage] = useState(0);
  const bulle = useRef<HTMLSpanElement>(null);
  const id = useId();

  // Garder la bulle dans l'écran (utile sur téléphone).
  useLayoutEffect(() => {
    if (!ouvert || !bulle.current) return;
    const r = bulle.current.getBoundingClientRect();
    const largeur = document.documentElement.clientWidth;
    if (r.left < MARGE) setDecalage((d) => d + MARGE - r.left);
    else if (r.right > largeur - MARGE) setDecalage((d) => d - (r.right - (largeur - MARGE)));
  }, [ouvert]);

  const ouvrir = () => {
    setDecalage(0);
    setOuvert(true);
  };

  return (
    <span
      tabIndex={0}
      aria-describedby={id}
      data-source=""
      onMouseEnter={ouvrir}
      onMouseLeave={() => setOuvert(false)}
      onFocus={ouvrir}
      onBlur={() => setOuvert(false)}
      onKeyDown={(e) => e.key === "Escape" && setOuvert(false)}
      className={`relative cursor-help underline decoration-line-strong decoration-dotted decoration-1 underline-offset-4 ${className}`}
    >
      {children}
      <span
        ref={bulle}
        id={id}
        role="tooltip"
        style={ouvert ? { transform: `translateX(calc(-50% + ${decalage}px))` } : undefined}
        className={
          ouvert
            ? "absolute top-full left-1/2 z-30 mt-2 block w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-3 text-left text-xs leading-relaxed font-normal whitespace-normal text-body shadow-lg"
            : "sr-only"
        }
      >
        {source}
      </span>
    </span>
  );
}
