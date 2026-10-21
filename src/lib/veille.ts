import { dateEcheance, finEcheance, type Agenda, type Evenement } from "./echeances.ts";

/**
 * Veille de l'agenda : fonctions pures qui comparent data/agenda.json aux
 * calendriers officiels et à la date du jour, et décrivent les changements à
 * proposer. Le script scripts/veille-agenda.ts télécharge les pages et ouvre
 * une demande de mise à jour (pull request) par constat : rien n'est publié
 * sans validation.
 */

export interface Constat {
  /** Identifiant stable : nom de la branche veille/<id>, pour ne jamais ouvrir deux fois la même demande. */
  id: string;
  titre: string;
  /** Explication en clair, en Markdown. */
  explication: string;
  /** Ce qu'il reste à faire avant de valider (cases à cocher). */
  aFaire: string[];
  /** Modification de data/agenda.json proposée dans la demande. */
  modifier: (agenda: Agenda) => Agenda;
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Texte lisible d'une page HTML : sans scripts, styles ni balises, espaces réduits. */
export function texteDePage(html: string): string {
  return html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&rsquo;/gi, "'")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Une page d'erreur ou presque vide ne doit pas passer pour une modification. */
export function pageUtilisable(texte: string): boolean {
  return texte.length >= 1000 && !/service (est actuellement )?indisponible|erreur serveur|access denied|forbidden/i.test(texte.slice(0, 600));
}

/** Empreinte courte d'un texte : deux FNV-1a 32 bits à graines différentes, 16 caractères hexadécimaux. */
export function empreinte(texte: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  for (const c of new TextEncoder().encode(texte)) {
    a = Math.imul(a ^ c, 0x01000193);
    b = Math.imul(b ^ c, 0x01000193) ^ (b >>> 15);
  }
  return (a >>> 0).toString(16).padStart(8, "0") + (b >>> 0).toString(16).padStart(8, "0");
}

/**
 * Calendrier des publications de l'Insee : « <titre> <jour> <mois> à <heure> ».
 * L'année n'est pas écrite : c'est celle d'aujourd'hui, ou la suivante si le
 * mois est déjà passé de plus de six mois.
 */
export function lireCalendrierInsee(texte: string, aujourdhui: string): { titre: string; date: string }[] {
  const [annee, moisActuel] = aujourdhui.split("-").map(Number);
  const re = new RegExp(`(\\d{1,2})(?:er)? (${MOIS.join("|")}) à \\d{1,2}h\\d{0,2}`, "g");
  const res: { titre: string; date: string }[] = [];
  let debut = 0;
  for (const m of texte.matchAll(re)) {
    const titre = texte.slice(debut, m.index).trim();
    debut = m.index + m[0].length;
    const mois = MOIS.indexOf(m[2]) + 1;
    const a = mois < moisActuel - 6 ? annee + 1 : annee;
    res.push({ titre: titre.slice(-200), date: `${a}-${String(mois).padStart(2, "0")}-${m[1].padStart(2, "0")}` });
  }
  return res;
}

/** Calendrier de la BCE : dates des réunions de politique monétaire (jour de la conférence de presse). */
export function lireCalendrierBce(texte: string): string[] {
  const dates = new Set<string>();
  for (const m of texte.matchAll(/(\d{2})\/(\d{2})\/(\d{4}) Governing Council of the ECB: monetary policy meeting[^0-9]*?\(Day 2\)/g)) {
    dates.add(`${m[3]}-${m[2]}-${m[1]}`);
  }
  return [...dates].sort();
}

const remplacerEvenement = (agenda: Agenda, id: string, changement: (e: Evenement) => Evenement): Agenda => ({
  ...agenda,
  evenements: agenda.evenements.map((e) => (e.id === id ? changement(e) : e)),
});

const trier = (evenements: Evenement[]) => [...evenements].sort((a, b) => (finEcheance(a) < finEcheance(b) ? -1 : finEcheance(a) > finEcheance(b) ? 1 : 0));

const listeDonnees = (ids: string[]) => (ids.length ? ids.map((d) => `\`${d}\``).join(", ") : "aucune donnée chiffrée");

/** Échéances passées qui demandent une relecture (notes, budget…), pas encore traitées. */
export function constatsEcheancesPassees(agenda: Agenda, aujourdhui: string): Constat[] {
  return agenda.evenements
    .filter((e) => e.mise_a_jour === "validation" && !e.traite && finEcheance(e) < aujourdhui)
    .map((e) => ({
      id: `echeance-${e.id}`,
      titre: `${e.titre} (${dateEcheance(e)}) : mise à jour à valider`,
      explication: [
        `L'échéance **${e.titre}** du ${dateEcheance(e)} est passée.`,
        e.situation ? `Situation inscrite avant l'échéance : ${e.situation}.` : "",
        `Données concernées : ${listeDonnees(e.donnees)}.`,
        `Pages à relire : ${e.pages.join(", ")}.`,
        `Source : [${e.source.nom}](${e.source.url}).`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      aFaire: [
        "Lire la décision ou la publication officielle",
        ...e.donnees.map((d) => `Mettre à jour \`${d}\` dans data/ (valeur, date, source, statut) sur cette branche`),
        "Mettre à jour la situation et ajouter l'échéance suivante dans data/agenda.json, s'il y en a une",
        ...e.pages.map((p) => `Relire ${p}`),
        "Vérifier que les tests passent, puis fusionner",
      ],
      modifier: (a) => remplacerEvenement(a, e.id, (x) => ({ ...x, traite: aujourdhui })),
    }));
}

/** Dates de l'agenda à confirmer ou à corriger d'après le calendrier de l'Insee. */
export function constatsInsee(agenda: Agenda, publications: { titre: string; date: string }[], aujourdhui: string): Constat[] {
  const url = "https://www.insee.fr/fr/information/5235017";
  return agenda.evenements.flatMap((e) => {
    if (!e.calendrier_insee || finEcheance(e) < aujourdhui) return [];
    const mots = e.calendrier_insee.map((m) => m.toLowerCase());
    const pub = publications.find((p) => mots.every((m) => p.titre.toLowerCase().includes(m)));
    if (!pub || (pub.date === e.date && e.statut === "confirme")) return [];
    const nouveau = { date: pub.date, precision: "jour" as const };
    return [
      {
        id: `insee-${e.id}-${pub.date}`,
        titre: `${e.titre} : date ${e.statut === "a_confirmer" ? "confirmée" : "modifiée"}, ${dateEcheance(nouveau)}`,
        explication: [
          `Le calendrier des publications de l'Insee annonce « ${pub.titre} » le **${dateEcheance(nouveau)}**.`,
          `L'agenda indiquait : ${dateEcheance(e)}${e.statut === "a_confirmer" ? " (date à confirmer)" : ""}.`,
          `Source : [Insee, calendrier des publications](${url}).`,
        ].join("\n\n"),
        aFaire: ["Vérifier la date sur le calendrier de l'Insee", "Fusionner"],
        modifier: (a) => {
          const maj = remplacerEvenement(a, e.id, (x) => {
            const reste = { ...x };
            delete reste.note;
            return { ...reste, ...nouveau, statut: "confirme", source: { nom: "Insee, calendrier des publications", url }, consulte_le: aujourdhui };
          });
          return { ...maj, evenements: trier(maj.evenements) };
        },
      },
    ];
  });
}

/** Réunions de la BCE annoncées mais absentes de l'agenda, ou inscrites mais disparues du calendrier. */
export function constatsBce(agenda: Agenda, dates: string[], aujourdhui: string): Constat[] {
  const url = "https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.fr.html";
  if (dates.length === 0) return [];
  const futures = dates.filter((d) => d >= aujourdhui);
  const inscrites = agenda.evenements.filter((e) => e.categorie === "bce" && e.date >= aujourdhui);
  const constats: Constat[] = [];
  const manquantes = futures.filter((d) => !inscrites.some((e) => e.date === d));
  if (manquantes.length) {
    const modele = agenda.evenements.find((e) => e.categorie === "bce");
    constats.push({
      id: manquantes.length > 1 ? `bce-ajout-${manquantes[0]}-a-${manquantes.at(-1)}` : `bce-ajout-${manquantes[0]}`,
      titre: `BCE : ${manquantes.length > 1 ? `${manquantes.length} nouvelles réunions` : "nouvelle réunion"} de politique monétaire à inscrire`,
      explication: `Le calendrier de la BCE annonce des réunions absentes de l'agenda : ${manquantes.map((d) => dateEcheance({ date: d, precision: "jour" })).join(", ")}.\n\nSource : [BCE, calendrier des réunions](${url}).`,
      aFaire: ["Vérifier les dates sur le calendrier de la BCE", "Fusionner"],
      modifier: (a) => ({
        ...a,
        evenements: trier([
          ...a.evenements,
          ...manquantes.map(
            (d): Evenement => ({
              id: `bce-${d}`,
              titre: "Réunion de politique monétaire de la BCE",
              categorie: "bce",
              date: d,
              precision: "jour",
              statut: "confirme",
              mise_a_jour: "automatique",
              description: "Le Conseil des gouverneurs décide des taux directeurs.",
              donnees: modele?.donnees ?? ["bce.taux-depot", "bce.taux-depot-actuel", "bce.taux-refi-actuel"],
              pages: ["/tableau-de-bord/"],
              source: { nom: "BCE, calendrier des réunions du Conseil des gouverneurs", url },
              consulte_le: aujourdhui,
            }),
          ),
        ]),
      }),
    });
  }
  const derniere = futures.at(-1)!;
  const disparues = inscrites.filter((e) => e.date <= derniere && !futures.includes(e.date));
  for (const e of disparues) {
    constats.push({
      id: `bce-retrait-${e.date}`,
      titre: `BCE : la réunion du ${dateEcheance(e)} n'apparaît plus au calendrier`,
      explication: `La réunion du ${dateEcheance(e)} inscrite à l'agenda ne figure plus dans le calendrier de la BCE (date déplacée ?).\n\nSource : [BCE, calendrier des réunions](${url}).`,
      aFaire: ["Vérifier le calendrier de la BCE", "Corriger la date dans data/agenda.json sur cette branche si besoin", "Fusionner"],
      modifier: (a) => remplacerEvenement(a, e.id, (x) => ({ ...x, statut: "a_confirmer", note: "N'apparaît plus au calendrier de la BCE : à vérifier." })),
    });
  }
  return constats;
}

/** Page officielle surveillée dont le texte a changé depuis la dernière validation. */
export function constatPage(agenda: Agenda, id: string, texte: string): Constat | undefined {
  const s = agenda.surveillance.find((x) => x.id === id);
  if (!s || !pageUtilisable(texte)) return undefined;
  const e = empreinte(texte);
  if (e === s.empreinte) return undefined;
  const premiere = s.empreinte === null;
  return {
    id: `page-${s.id}-${e.slice(0, 8)}`,
    titre: premiere ? `${s.titre} : premier relevé de la page` : `${s.titre} : la page a changé`,
    explication: [
      premiere
        ? `Premier relevé de la page [${s.titre}](${s.url}) : la fusion enregistre son empreinte, pour repérer ses prochaines modifications.`
        : `La page [${s.titre}](${s.url}) a été modifiée depuis la dernière validation.`,
      `Données concernées : ${listeDonnees(s.donnees)}. Pages à relire : ${s.pages.join(", ")}.`,
    ].join("\n\n"),
    aFaire: premiere
      ? ["Fusionner pour enregistrer l'empreinte"]
      : ["Ouvrir la page et repérer la nouveauté", ...s.donnees.map((d) => `Mettre à jour \`${d}\` si besoin`), "Fusionner"],
    modifier: (a) => ({ ...a, surveillance: a.surveillance.map((x) => (x.id === id ? { ...x, empreinte: e } : x)) }),
  };
}

/** Texte de la demande de mise à jour (corps de la pull request). */
export function corpsDemande(c: Constat, proprietaire: string): string {
  return [
    `@${proprietaire} : la veille de l'agenda propose une mise à jour. **Rien n'est publié tant que vous n'avez pas fusionné cette demande.**`,
    c.explication,
    "### À faire avant de fusionner",
    c.aFaire.map((t) => `- [ ] ${t}`).join("\n"),
    "_Demande ouverte automatiquement par la tâche « Veille de l'agenda » (scripts/veille-agenda.ts). Pour l'écarter, fermez-la sans fusionner : elle ne sera pas rouverte._",
  ].join("\n\n");
}
