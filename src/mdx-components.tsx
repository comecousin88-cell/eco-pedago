import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { Chiffre } from "@/components/pedago/Chiffre";
import { ARetenir, BadgeVerdict, Debat, Exemple, Verdict } from "@/components/pedago/Encadres";
import { Figure } from "@/components/pedago/Figure";
import { Essentiel, Mecanisme, Niveaux, PlusLoin } from "@/components/pedago/Niveaux";
import { Quiz } from "@/components/pedago/Quiz";
import { Terme } from "@/components/pedago/Terme";

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
  ARetenir,
  BadgeVerdict,
  Chiffre,
  Debat,
  Essentiel,
  Exemple,
  Figure,
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
