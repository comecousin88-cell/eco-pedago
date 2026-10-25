"use client";

import { useSyncExternalStore } from "react";
import { etatEcheance, jourLocal, type Evenement } from "@/lib/echeances";

const sansAbonnement = () => () => {};

/** Jour du visiteur dans le navigateur ; undefined pendant la construction du site et avant l'hydratation. */
function useJourVisiteur(): string | undefined {
  return useSyncExternalStore(sansAbonnement, jourLocal, () => undefined);
}

/**
 * État d'une échéance (« a eu lieu le … », « aujourd'hui », « dans 3 jours »,
 * ou son résultat). Le HTML construit d'avance n'écrit que des dates ; les
 * mentions relatives sont calculées dans le navigateur, avec la date du
 * visiteur : elles restent justes même si le site n'a pas été reconstruit.
 */
export function EtatEcheance({
  echeance,
  construitLe,
  className = "",
}: {
  echeance: Pick<Evenement, "date" | "precision" | "resultat">;
  construitLe: string;
  className?: string;
}) {
  const jour = useJourVisiteur();
  const { texte, passee } = etatEcheance(echeance, jour ?? construitLe, jour !== undefined);
  return <span className={`${passee ? "text-muted" : "font-semibold text-accent"} ${className}`}>{texte}</span>;
}

/** Masque, dans le navigateur, une échéance déjà passée pour le visiteur (liste « Prochaines échéances »). */
export function SiAVenir({ fin, children }: { fin: string; children: React.ReactNode }) {
  const jour = useJourVisiteur();
  if (jour && fin < jour) return null;
  return <>{children}</>;
}
