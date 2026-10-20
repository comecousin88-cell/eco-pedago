import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { Chiffre } from "@/components/pedago/Chiffre";
import { DateDonnee } from "@/components/pedago/DateDonnee";
import { ARetenir, BadgeVerdict, Debat, Exemple, Verdict } from "@/components/pedago/Encadres";
import { Figure } from "@/components/pedago/Figure";
import { Essentiel, Mecanisme, Niveaux, PlusLoin } from "@/components/pedago/Niveaux";
import { Quiz } from "@/components/pedago/Quiz";
import { Terme } from "@/components/pedago/Terme";
import { ArgumentsFiche, GrilleVerdict } from "@/components/propositions/ArgumentsFiche";
import { ancre, texteDe } from "@/lib/ancre";

/**
 * Composants disponibles dans tous les fichiers .mdx, sans import :
 * <Niveaux>, <Terme>, <Chiffre>, <Figure>, <Exemple>, <Debat>, <Verdict>…
 * Les simulateurs propres à un module s'importent dans son fichier MDX.
 */
const components: MDXComponents = {
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener" {...props} />
    ),
  // Les titres de niveau 2 reçoivent une ancre (plan des fiches, liens directs).
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 id={ancre(texteDe(children))} className="scroll-mt-24" {...props}>
      {children}
    </h2>
  ),
  ARetenir,
  ArgumentsFiche,
  BadgeVerdict,
  Chiffre,
  DateDonnee,
  Debat,
  Essentiel,
  Exemple,
  Figure,
  GrilleVerdict,
  Mecanisme,
  Niveaux,
  PlusLoin,
  Quiz,
  Terme,
  Verdict,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
