"use client";

import { useId, type ReactNode } from "react";

/** Curseur étiqueté, avec la valeur affichée et lue par les lecteurs d'écran. */
export function Curseur({
  libelle,
  valeur,
  min,
  max,
  pas,
  onChange,
  affichage,
  aide,
}: {
  libelle: string;
  valeur: number;
  min: number;
  max: number;
  pas: number;
  onChange: (v: number) => void;
  /** Texte de la valeur (par défaut, la valeur brute). */
  affichage?: string;
  aide?: ReactNode;
}) {
  const id = useId();
  const texte = affichage ?? String(valeur);
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-semibold text-ink">
        <span>{libelle}</span>
        <span className="whitespace-nowrap tabular-nums">{texte}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        aria-valuetext={texte}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--accent)]"
      />
      {aide && <p className="mt-1 text-xs text-muted">{aide}</p>}
    </div>
  );
}

/** Bouton secondaire des simulateurs. */
export function BoutonSimu({
  children,
  onClick,
  actif = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  actif?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={actif}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        actif ? "border-accent bg-accent text-surface" : "border-accent-line text-accent hover:bg-accent-soft"
      }`}
    >
      {children}
    </button>
  );
}
