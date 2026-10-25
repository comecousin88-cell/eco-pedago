/**
 * Récapitulatif quotidien de ce qui a été publié automatiquement (résumés des
 * actualités, fusions de demandes de mise à jour) et de ce qui a été rejeté,
 * avec les raisons : écrit dans RECAPITULATIF.md pour être relu et corrigé.
 * Fonctions pures, sans import de module Node (les scripts écrivent le fichier).
 */
import { slugifier } from "./slug.ts";

export interface ResumeAuto {
  en_bref: string[];
  ce_que_ca_veut_dire: string;
  source_url: string;
  genere_le: string;
  modele: string;
}

export interface ResumesAuto {
  description: string;
  resumes: Record<string, ResumeAuto>;
}

export interface EntreeJournalResume {
  /** Date et heure de la tentative (ISO). */
  date: string;
  id: string;
  titre: string;
  date_publication: string;
  lien: string;
  statut: "publie" | "rejete";
  raisons?: string[];
  /** Empreinte du texte source : un texte rejeté deux fois n'est plus soumis tant qu'il ne change pas. */
  empreinte?: string;
  modele?: string;
  jetons?: { entree: number; sortie: number };
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

/** Une raison qui ne dépend pas du texte (page interdite, protégée, inaccessible) : inutile de réessayer chaque jour. */
export const raisonDurable = (raisons: string[] = []) => raisons.some((r) => /robots|protégée|inaccessible/.test(r));

/** Faut-il (re)tenter le résumé de cette publication ? */
export function aTenter(journal: EntreeJournalResume[], id: string, aujourdhui: string): boolean {
  // Un résumé déjà publié puis retiré à la main de data/actu-resumes-auto.json n'est pas regénéré.
  if (journal.some((j) => j.id === id && j.statut === "publie")) return false;
  const essais = journal.filter((j) => j.id === id && j.statut === "rejete");
  // Page illisible : un nouvel essai par semaine au plus.
  const durable = essais.find((j) => raisonDurable(j.raisons));
  if (durable && Date.parse(aujourdhui) - Date.parse(durable.date) < 7 * 86_400_000) return false;
  return true;
}

/** Ce texte source a-t-il déjà été rejeté deux fois ? */
export const rejeteDeuxFois = (journal: EntreeJournalResume[], id: string, empreinte: string) =>
  journal.filter((j) => j.id === id && j.statut === "rejete" && j.empreinte === empreinte).length >= 2;

const PRIX = { entree: 0.1, sortie: 0.5 }; // dollars par million de jetons (Claude Haiku 5.5)

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
    "Fichier écrit chaque jour par les tâches automatiques (`npm run resumer:actu`, fusion automatique des demandes de mise à jour). Ne pas modifier à la main.",
    "",
    "- **Résumés publiés** : générés par IA à partir de la publication officielle, après contrôle automatique (format, chiffres présents tels quels dans la source, aucun nom propre ni opinion absents de la source). Pour corriger un résumé, modifier son entrée dans `data/actu-resumes-auto.json` ; pour le retirer, supprimer l'entrée : il ne sera pas regénéré.",
    "- **Résumés rejetés** : la page garde « Résumé à venir ».",
    "- **Demandes laissées ouvertes** : un contrôle a échoué ; elles attendent une décision.",
    "",
  ];
  if (jours.size === 0) lignes.push("Aucune publication automatique ces trente derniers jours.");
  for (const [j, { r, f }] of [...jours.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))) {
    const publies = r.filter((e) => e.statut === "publie");
    const rejetes = r.filter((e) => e.statut === "rejete");
    const jetons = r.reduce((s, e) => ({ entree: s.entree + (e.jetons?.entree ?? 0), sortie: s.sortie + (e.jetons?.sortie ?? 0) }), { entree: 0, sortie: 0 });
    const cout = (jetons.entree * PRIX.entree + jetons.sortie * PRIX.sortie) / 1e6;
    lignes.push(`## ${j}`, "");
    if (r.length) lignes.push(`${publies.length} résumé(s) publié(s), ${rejetes.length} rejeté(s) ; coût estimé de l'API : ${cout.toFixed(4)} $.`, "");
    for (const e of publies) lignes.push(`- ✅ [${e.titre}](${site}/actu/${e.date_publication}-${slugifier(e.titre)}/) ([source](${e.lien}))`);
    for (const e of rejetes) lignes.push(`- ❌ ${e.titre} ([source](${e.lien})) : ${(e.raisons ?? []).join(" ; ")}`);
    for (const e of f.filter((x) => x.statut === "fusionnee")) lignes.push(`- 🔀 Demande n° ${e.numero} fusionnée : ${e.titre}`);
    for (const e of f.filter((x) => x.statut !== "fusionnee")) lignes.push(`- ⏸️ Demande n° ${e.numero} laissée ouverte : ${e.titre} : ${(e.raisons ?? []).join(" ; ")}`);
    lignes.push("");
  }
  return `${lignes.join("\n").trimEnd()}\n`;
}
