import type { ReactNode } from "react";

/**
 * Les trois niveaux de lecture d'une notion. « L'essentiel » est ouvert par
 * défaut, les deux autres se déplient. Usage en MDX :
 *
 * <Niveaux>
 *   <Essentiel>…</Essentiel>
 *   <Mecanisme>…</Mecanisme>
 *   <PlusLoin>…</PlusLoin>
 * </Niveaux>
 */
export function Niveaux({ children }: { children: ReactNode }) {
  return <div className="my-8 space-y-3">{children}</div>;
}

function Niveau({
  numero,
  titre,
  sousTitre,
  ouvert = false,
  children,
}: {
  numero: number;
  titre: string;
  sousTitre: string;
  ouvert?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={ouvert}
      className="group rounded-2xl border border-line bg-surface open:border-accent-line"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 rounded-2xl px-5 py-4 select-none hover:bg-subtle [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-serif text-base font-semibold text-accent"
        >
          {numero}
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-ink">{titre}</span>
          <span className="block text-sm text-muted">{sousTitre}</span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </summary>
      <div className="prose-eco max-w-none px-5 pt-1 pb-6">{children}</div>
    </details>
  );
}

export function Essentiel({ children }: { children: ReactNode }) {
  return (
    <Niveau numero={1} titre="L'essentiel" sousTitre="En deux minutes, avec une image du quotidien" ouvert>
      {children}
    </Niveau>
  );
}

export function Mecanisme({ children }: { children: ReactNode }) {
  return (
    <Niveau numero={2} titre="Le mécanisme" sousTitre="Comment ça marche, avec un exemple chiffré">
      {children}
    </Niveau>
  );
}

export function PlusLoin({ children }: { children: ReactNode }) {
  return (
    <Niveau numero={3} titre="Pour aller plus loin" sousTitre="Formules, nuances, débats et sources">
      {children}
    </Niveau>
  );
}
