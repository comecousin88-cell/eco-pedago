/**
 * Récapitulatif quotidien de ce qui a été publié automatiquement (résumés
 * officiels repris, fusions de demandes de mise à jour) et de ce qui ne l'a
 * pas été, avec les raisons : écrit dans RECAPITULATIF.md pour être relu.
 * Fonctions pures, sans import de module Node (les scripts écrivent le fichier).
 */
import { slugifier } from "./slug.ts";

/** Résumé rédigé par l'organisme, repris tel quel et en entier. */
export interface ResumeOfficiel {
  paragraphes: string[];
  /** Page d'où le résumé est repris (pour la BCE : la version française de son communiqué). */
  lien: string;
  /** Organisme auteur, quand il diffère du site qui relaie l'actualité (BCE relayée par la Banque de France). */
  organisme?: string;
  /** Licence qui autorise la reprise. */
  licence: string;
  /** Date de dernière mise à jour affichée par la source, quand sa licence demande de la citer (Banque de France). */
  mis_a_jour?: string;
  recupere_le: string;
}

export interface ResumesOfficiels {
  description: string;
  resumes: Record<string, ResumeOfficiel>;
}

export interface EntreeJournalResume {
  /** Date et heure de la tentative (ISO). */
  date: string;
  id: string;
  titre: string;
  date_publication: string;
  lien: string;
  statut: "repris" | "non-repris";
  raison?: string;
}

export interface JournalResumes {
  description: string;
  entrees: EntreeJournalResume[];
}

export interface EntreeJournalFusion {
  date: string;
  numero: number;
  titre: string;
  branche: string;
  statut: "fusionnee" | "laissee-ouverte";
  raisons?: string[];
}

export interface JournalFusions {
  description: string;
  entrees: EntreeJournalFusion[];
}

/**
 * Faut-il (re)chercher le résumé officiel de cette publication ? Non si la
 * licence l'interdit ou si le résumé n'est pas affiché (raisons durables) ;
 * une page illisible ou sans résumé reconnaissable est réessayée chaque semaine.
 */
export function aChercher(journal: EntreeJournalResume[], id: string, aujourdhui: string): boolean {
  const dernier = journal.find((j) => j.id === id);
  if (!dernier) return true;
  if (dernier.statut === "repris" || /^licence|anglais|en français/.test(dernier.raison ?? "")) return false;
  return Date.parse(aujourdhui) - Date.parse(dernier.date) >= 7 * 86_400_000;
}

/** Contenu de RECAPITULATIF.md : les trente derniers jours, du plus récent au plus ancien. */
export function texteRecapitulatif(resumes: JournalResumes, fusions: JournalFusions, site: string, aujourdhui: string): string {
  const limite = new Date(Date.parse(aujourdhui) - 30 * 86_400_000).toISOString();
  const jours = new Map<string, { r: EntreeJournalResume[]; f: EntreeJournalFusion[] }>();
  const jour = (d: string) => {
    const j = d.slice(0, 10);
    if (!jours.has(j)) jours.set(j, { r: [], f: [] });
    return jours.get(j)!;
  };
  for (const e of resumes.entrees) if (e.date >= limite) jour(e.date).r.push(e);
  for (const e of fusions.entrees) if (e.date >= limite) jour(e.date).f.push(e);

  const lignes = [
    "# Récapitulatif des publications automatiques",
    "",
    "Fichier écrit chaque jour par les tâches automatiques (`npm run resumes:officiels`, fusion automatique des demandes de mise à jour). Ne pas modifier à la main.",
    "",
    "- **Résumés repris** : le chapô ou le paragraphe d'introduction rédigé par l'organisme, repris tel quel et en entier, quand sa licence le permet. Pour en retirer un, supprimer son entrée dans `data/actu-resumes-officiels.json`.",
    "- **Résumés non repris** : licence qui ne le permet pas, résumé en anglais (Eurostat), page illisible ou sans résumé reconnaissable ; la page garde le titre, les chiffres, les liens vers les modules et le lien vers la source.",
    "- **Demandes laissées ouvertes** : un contrôle a échoué ; elles attendent une décision.",
    "",
  ];
  if (jours.size === 0) lignes.push("Aucune publication automatique ces trente derniers jours.");
  for (const [j, { r, f }] of [...jours.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))) {
    const repris = r.filter((e) => e.statut === "repris");
    const nonRepris = r.filter((e) => e.statut !== "repris");
    lignes.push(`## ${j}`, "");
    if (r.length) lignes.push(`${repris.length} résumé(s) officiel(s) repris, ${nonRepris.length} non repris.`, "");
    for (const e of repris) lignes.push(`- ✅ [${e.titre}](${site}/actu/${e.date_publication}-${slugifier(e.titre)}/) ([source](${e.lien}))`);
    for (const e of nonRepris) lignes.push(`- ➖ ${e.titre} ([source](${e.lien})) : ${e.raison ?? ""}`);
    for (const e of f.filter((x) => x.statut === "fusionnee")) lignes.push(`- 🔀 Demande n° ${e.numero} fusionnée : ${e.titre}`);
    for (const e of f.filter((x) => x.statut !== "fusionnee")) lignes.push(`- ⏸️ Demande n° ${e.numero} laissée ouverte : ${e.titre} : ${(e.raisons ?? []).join(" ; ")}`);
    lignes.push("");
  }
  return `${lignes.join("\n").trimEnd()}\n`;
}
