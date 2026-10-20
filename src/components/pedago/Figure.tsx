import type { ReactNode } from "react";
import { getDonnee } from "@/lib/data";
import { formatDateDonnee } from "@/lib/format";
import { FigureCadre } from "./FigureCadre";

/**
 * Cadre de tout graphique ou schéma chiffré : titre, résumé en texte (lu par
 * tous, et par les lecteurs d'écran à la place du dessin), ligne de source
 * datée, bouton de partage en PNG.
 *
 * `donnees` liste les identifiants data/*.json utilisés : la source et la date
 * s'en déduisent. `source` sert pour un schéma sans donnée (exemple fictif).
 */
export function Figure({
  titre,
  resume,
  donnees = [],
  source,
  children,
}: {
  titre: string;
  resume: string;
  donnees?: string[];
  source?: string;
  children: ReactNode;
}) {
  const lignes = new Map<string, { url?: string; date: string; aVerifier: boolean }>();
  for (const id of donnees) {
    const d = getDonnee(id);
    const deja = lignes.get(d.source.nom);
    // Pour une même source, on affiche la date la plus récente.
    if (!deja || d.date > deja.date) {
      lignes.set(d.source.nom, {
        url: d.source.url,
        date: d.date,
        aVerifier: (deja?.aVerifier ?? false) || d.statut === "a_verifier",
      });
    } else if (d.statut === "a_verifier") {
      deja.aVerifier = true;
    }
  }
  const sources = [...lignes.entries()].map(([nom, l]) => ({
    nom,
    url: l.url,
    date: formatDateDonnee(l.date),
    aVerifier: l.aVerifier,
  }));

  return (
    <FigureCadre titre={titre} resume={resume} sources={sources} sourceLibre={source}>
      {children}
    </FigureCadre>
  );
}
