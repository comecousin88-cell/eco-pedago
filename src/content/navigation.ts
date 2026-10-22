import { rubriques, type Rubrique } from "./rubriques";

/**
 * Entrées du menu principal : les cinq rubriques, dans l'ordre. La rubrique
 * en cours est repérée par préfixe d'adresse (src/content/rubriques.ts) ;
 * « Sources et méthode » est accessible depuis le pied de page.
 */
export type NavItem = Rubrique;

export const navItems: NavItem[] = rubriques;
