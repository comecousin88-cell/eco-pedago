"use client";

import { useId, type ReactNode } from "react";

/**
 * Curseur étiqueté, avec la valeur affichée et lue par les lecteurs d'écran.
 * `reference` (obligatoire dans les simulateurs) est la valeur actuelle : un
 * repère discret la marque sous la piste, et le réglage est mis en évidence
 * dès qu'il s'en écarte.
 */
export function Curseur({
  libelle,
  valeur,
  min,
  max,
  pas,
  onChange,
  affichage,
  aide,
  reference,
  affichageReference,
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
  /** Valeur actuelle (chiffres de data/*.json) ou valeur de départ de l'exemple. */
  reference?: number;
  /** Texte de la valeur de référence (par défaut, la valeur brute). */
  affichageReference?: string;
}) {
  const id = useId();
  const texte = affichage ?? String(valeur);
  const modifie = reference !== undefined && Math.abs(valeur - reference) > 1e-9;
  const position = reference === undefined ? 0 : Math.min(100, Math.max(0, ((reference - min) / (max - min || 1)) * 100));
  const texteReference = affichageReference ?? (reference === undefined ? "" : String(reference));
  return (
    <div
      className={modifie ? "-mx-2 rounded-lg border-l-2 border-warn bg-warn-soft/40 px-2 py-1" : undefined}
      data-modifie={modifie || undefined}
    >
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-semibold text-ink">
        <span>
          {libelle}
          {modifie && <span className="ml-2 text-xs font-medium text-warn">modifié</span>}
        </span>
        <span className="whitespace-nowrap tabular-nums">{texte}</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={pas}
          value={valeur}
          aria-valuetext={modifie ? `${texte} (valeur actuelle : ${texteReference})` : texte}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
        {reference !== undefined && (
          <span
            aria-hidden="true"
            title={`Valeur actuelle : ${texteReference}`}
            className="pointer-events-none absolute -bottom-1.5 h-2 w-0.5 -translate-x-1/2 rounded-full bg-muted"
            style={{ left: `calc(${position}% + ${(0.5 - position / 100) * 16}px)` }}
          />
        )}
      </div>
      {modifie && (
        <p className="mt-1 text-xs text-muted">
          Valeur actuelle : <span className="tabular-nums">{texteReference}</span>
        </p>
      )}
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
