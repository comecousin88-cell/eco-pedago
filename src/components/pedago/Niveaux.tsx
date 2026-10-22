import type { ReactNode } from "react";
import { Depliable } from "./Depliable";

/**
 * Les trois niveaux de lecture d'une notion. Usage en MDX :
 *
 * <Niveaux>
 *   <Essentiel>…</Essentiel>
 *   <Mecanisme>…</Mecanisme>
 *   <PlusLoin>…</PlusLoin>
 * </Niveaux>
 *
 * « L'essentiel » et « Le mécanisme » s'affichent dans les deux modes de
 * lecture ; « Pour aller plus loin » n'existe qu'en mode Approfondi (masqué
 * entièrement en mode Simple). Chacun reste repliable à la main.
 */
export function Niveaux({ children }: { children: ReactNode }) {
  return <div className="my-8 space-y-3">{children}</div>;
}

function Niveau({
  numero,
  titre,
  sousTitre,
  children,
}: {
  numero: number;
  titre: string;
  sousTitre: string;
  children: ReactNode;
}) {
  return (
    <Depliable
      className="rounded-2xl border border-line bg-surface"
      classeEntete="rounded-2xl px-5 py-4 hover:bg-subtle"
      classeContenu="prose-eco max-w-none px-5 pt-1 pb-6"
      entete={
        <span className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-serif text-base font-semibold text-accent"
          >
            {numero}
          </span>
          <span>
            <span className="block font-semibold text-ink">{titre}</span>
            <span className="block text-sm text-muted">{sousTitre}</span>
          </span>
        </span>
      }
    >
      {children}
    </Depliable>
  );
}

export function Essentiel({ children }: { children: ReactNode }) {
  return (
    <Niveau numero={1} titre="L'essentiel" sousTitre="En deux minutes, avec une image du quotidien">
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
    <div data-selon-mode="approfondi" data-bloc="Pour aller plus loin">
      <Niveau numero={3} titre="Pour aller plus loin" sousTitre="Formules, nuances, débats et sources">
        {children}
      </Niveau>
    </div>
  );
}
