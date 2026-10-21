import { describe, expect, it } from "vitest";
import { agenda as agendaReel, type Agenda, type Evenement } from "./agenda";
import {
  constatPage,
  constatsBce,
  constatsEcheancesPassees,
  constatsInsee,
  corpsDemande,
  empreinte,
  lireCalendrierBce,
  lireCalendrierInsee,
  pageUtilisable,
  texteDePage,
} from "./veille";

const ev = (e: Partial<Evenement> & Pick<Evenement, "id" | "date">): Evenement => ({
  titre: e.id,
  categorie: "publication",
  precision: "jour",
  statut: "confirme",
  mise_a_jour: "validation",
  description: "",
  donnees: [],
  pages: ["/tableau-de-bord/"],
  source: { nom: "s", url: "https://exemple.fr/x" },
  consulte_le: "2026-10-21",
  ...e,
});
const agendaDe = (evenements: Evenement[], surveillance: Agenda["surveillance"] = []): Agenda => ({ description: "", evenements, surveillance });

describe("lecture des pages officielles", () => {
  it("réduit une page HTML à son texte", () => {
    expect(texteDePage("<html><script>var a=1</script><p>Dette&nbsp;publique</p>\n<p>T3</p></html>")).toBe("Dette publique T3");
  });

  it("écarte les pages d'erreur", () => {
    expect(pageUtilisable("Erreur serveur Service indisponible. " + "x".repeat(2000))).toBe(false);
    expect(pageUtilisable("court")).toBe(false);
    expect(pageUtilisable("Rapports annuels du COR " + "x".repeat(2000))).toBe(true);
  });

  it("donne une empreinte stable et sensible au moindre changement", () => {
    expect(empreinte("abc")).toBe(empreinte("abc"));
    expect(empreinte("abc")).not.toBe(empreinte("abd"));
    expect(empreinte("abc")).toMatch(/^[0-9a-f]{16}$/);
  });

  it("lit le calendrier de l'Insee, année comprise", () => {
    const texte =
      "Menu Chiffre d'affaires dans l'industrie - août 2026 29 octobre à 12h Comptes nationaux trimestriels – Première estimation - 3e trimestre 2026 30 octobre à 7h30 Taux de chômage au sens du BIT - 3e trimestre 2026 1er décembre à 7h30 Comptes nationaux annuels 5 janvier à 8h45";
    expect(lireCalendrierInsee(texte, "2026-10-21")).toEqual([
      { titre: "Menu Chiffre d'affaires dans l'industrie - août 2026", date: "2026-10-29" },
      { titre: "Comptes nationaux trimestriels – Première estimation - 3e trimestre 2026", date: "2026-10-30" },
      { titre: "Taux de chômage au sens du BIT - 3e trimestre 2026", date: "2026-12-01" },
      { titre: "Comptes nationaux annuels", date: "2027-01-05" },
    ]);
  });

  it("lit les réunions de politique monétaire de la BCE (jour de la conférence de presse)", () => {
    const texte =
      "28/10/2026 Governing Council of the ECB: monetary policy meeting in Frankfurt (Day 1) 29/10/2026 Governing Council of the ECB: monetary policy meeting in Frankfurt (Day 2), followed by press conference 25/11/2026 Governing Council of the ECB: non-monetary policy meeting (in Frankfurt) 17/12/2026 Governing Council of the ECB: monetary policy meeting in Frankfurt (Day 2), followed by press conference";
    expect(lireCalendrierBce(texte)).toEqual(["2026-10-29", "2026-12-17"]);
  });
});

describe("constats", () => {
  it("une échéance à validation passée ouvre une demande, une seule fois", () => {
    const a = agendaDe([
      ev({ id: "moodys", date: "2026-10-23", categorie: "notation", donnees: ["notation.france"], situation: "Aa3, perspective négative" }),
      ev({ id: "bce", date: "2026-10-22", categorie: "bce", mise_a_jour: "automatique", donnees: ["bce.taux-depot"] }),
      ev({ id: "budget", date: "2026-12", precision: "mois" }),
    ]);
    expect(constatsEcheancesPassees(a, "2026-10-23")).toEqual([]);
    const [c, ...autres] = constatsEcheancesPassees(a, "2026-10-24");
    expect(autres).toEqual([]);
    expect(c.id).toBe("echeance-moodys");
    expect(c.aFaire.join(" ")).toContain("notation.france");
    expect(c.explication).toContain("Aa3, perspective négative");
    const traite = c.modifier(a);
    expect(traite.evenements[0].traite).toBe("2026-10-24");
    expect(constatsEcheancesPassees(traite, "2026-10-25")).toEqual([]);
    // Une échéance au mois n'est passée qu'à la fin du mois.
    expect(constatsEcheancesPassees(traite, "2026-12-31").map((x) => x.id)).toEqual([]);
    expect(constatsEcheancesPassees(traite, "2027-01-01").map((x) => x.id)).toEqual(["echeance-budget"]);
  });

  it("confirme ou corrige une date d'après le calendrier de l'Insee", () => {
    const a = agendaDe([
      ev({ id: "pib", date: "2026-10-30", statut: "a_confirmer", note: "à confirmer", calendrier_insee: ["Comptes nationaux trimestriels", "3e trimestre 2026"] }),
      ev({ id: "chomage", date: "2026-11-10", calendrier_insee: ["chômage", "3e trimestre 2026"] }),
      ev({ id: "dette", date: "2026-12-18", calendrier_insee: ["Dette", "3e trimestre 2026"] }),
    ]);
    const pubs = [
      { titre: "Comptes nationaux trimestriels – Première estimation - 3e trimestre 2026", date: "2026-10-30" },
      { titre: "Taux de chômage au sens du BIT - 3e trimestre 2026", date: "2026-11-12" },
    ];
    const cs = constatsInsee(a, pubs, "2026-10-21");
    expect(cs.map((c) => c.id)).toEqual(["insee-pib-2026-10-30", "insee-chomage-2026-11-12"]);
    const maj = cs[1].modifier(cs[0].modifier(a));
    expect(maj.evenements.find((e) => e.id === "pib")).toMatchObject({ statut: "confirme", date: "2026-10-30" });
    expect(maj.evenements.find((e) => e.id === "pib")?.note).toBeUndefined();
    expect(maj.evenements.find((e) => e.id === "chomage")).toMatchObject({ date: "2026-11-12" });
    expect(constatsInsee(maj, pubs, "2026-10-21")).toEqual([]);
  });

  it("ajoute les réunions de la BCE manquantes et signale celles qui ont disparu", () => {
    const a = agendaDe([
      ev({ id: "bce-2026-10-29", date: "2026-10-29", categorie: "bce", mise_a_jour: "automatique", donnees: ["bce.taux-depot"] }),
      ev({ id: "bce-2026-12-10", date: "2026-12-10", categorie: "bce", mise_a_jour: "automatique", donnees: ["bce.taux-depot"] }),
    ]);
    const cs = constatsBce(a, ["2026-09-10", "2026-10-29", "2026-12-17", "2027-02-04"], "2026-10-21");
    expect(cs.map((c) => c.id)).toEqual(["bce-ajout-2026-12-17-a-2027-02-04", "bce-retrait-2026-12-10"]);
    const maj = cs[0].modifier(a);
    expect(maj.evenements.map((e) => e.date)).toEqual(["2026-10-29", "2026-12-10", "2026-12-17", "2027-02-04"]);
    expect(maj.evenements[2]).toMatchObject({ categorie: "bce", mise_a_jour: "automatique", donnees: ["bce.taux-depot"] });
    expect(constatsBce(a, [], "2026-10-21")).toEqual([]);
  });

  it("repère une page surveillée modifiée, et pas une page d'erreur", () => {
    const texte = "Rapport annuel du COR, juin 2027 " + "x".repeat(2000);
    const a = agendaDe([], [{ id: "cor", titre: "COR", url: "https://exemple.fr/cor", donnees: [], pages: ["/modules/retraites/"], empreinte: null }]);
    const premier = constatPage(a, "cor", texte)!;
    expect(premier.titre).toContain("premier relevé");
    const releve = premier.modifier(a);
    expect(constatPage(releve, "cor", texte)).toBeUndefined();
    expect(constatPage(releve, "cor", texte.replace("2027", "2028"))?.titre).toContain("la page a changé");
    expect(constatPage(releve, "cor", "Erreur serveur Service indisponible")).toBeUndefined();
  });

  it("la demande mentionne le propriétaire et rappelle que rien n'est publié sans validation", () => {
    const [c] = constatsEcheancesPassees(agendaDe([ev({ id: "x", date: "2026-10-23" })]), "2026-10-24");
    const corps = corpsDemande(c, "comec");
    expect(corps).toMatch(/^@comec/);
    expect(corps).toContain("Rien n'est publié");
    expect(corps).toContain("- [ ] ");
  });

  it("l'agenda réel ne déclenche aucune demande aujourd'hui pour une échéance déjà traitée", () => {
    for (const e of agendaReel.evenements.filter((x) => x.traite)) {
      expect(constatsEcheancesPassees(agendaReel, "2099-01-01").map((c) => c.id)).not.toContain(`echeance-${e.id}`);
    }
  });
});
