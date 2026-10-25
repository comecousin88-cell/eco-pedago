import { describe, expect, it } from "vitest";
import explications from "../../data/actu-explications.json";
import flux from "../../data/actu-flux.json";
import journal from "../../data/actu-journal.json";
import {
  dateEnLettres,
  fusionnerFlux,
  idFlux,
  lienPropre,
  lireListeBanqueDeFrance,
  lireListeEurostat,
  lireRss,
  sansDoublon,
  SOURCES_FLUX,
  sujetDe,
  texteBrut,
  traduireEurostat,
  trierFlux,
  type EntreeFlux,
} from "@/lib/actu/flux";
import { agenda, etatEcheance, finEcheance } from "@/lib/agenda";
import { ajouterAuJournal, nouvellePeriode } from "@/lib/actu/journal";
import { constatsExplications, corpsDemande, type EntreeFilPubliee, type Explications } from "@/lib/veille";
import { construireFil, DEBUT_FIL, finDePeriode, jourEnLettres, titrePage, versionEurostat } from "./actu";
import { moduleHref, modules } from "./modules";

const pages = new Set(["/tableau-de-bord/", "/la-france-en-10-chiffres/", ...modules.flatMap((m) => [moduleHref(m.slug), ...m.sections.map((s) => moduleHref(m.slug, s.slug))])]);

describe("lecture des flux officiels", () => {
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>Flux</title>
    <item><title>À la fin du deuxième trimestre 2026, le ratio de dette publique s’établit à 119,0 % du PIB</title>
      <link>https://www.insee.fr/fr/statistiques/1</link><description>&lt;p&gt;La dette &amp;amp; le déficit&lt;/p&gt;</description>
      <pubDate>Tue, 29 Sep 2026 06:45:00 GMT</pubDate></item>
    <item><title><![CDATA[Le climat des affaires s'éclaircit]]></title><link>https://www.insee.fr/fr/statistiques/2</link>
      <pubDate>Thu, 22 Oct 2026 06:45:00 GMT</pubDate></item>
    <item><title>Sans date</title><link>https://exemple.fr</link></item>
    <item><title>Monetary policy decisions</title><link>https://www.ecb.europa.eu//press/pr/date/2026/html/ecb.mp261029.en.html</link>
      <pubDate>Thu, 29 Oct 2026 14:15:00 +0100</pubDate></item>
    <item><title>Piero Cipollone: a speech on monetary policy</title><link>https://www.ecb.europa.eu//press/key/date/2026/html/x.en.html</link>
      <pubDate>Wed, 21 Oct 2026 10:00:00 +0200</pubDate></item>
  </channel></rss>`;
  const items = lireRss(xml);

  it("lit titre, lien, date et résumé, et ignore les éléments sans date", () => {
    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({ lien: "https://www.insee.fr/fr/statistiques/1", date: "2026-09-29T06:45:00Z", resume: "La dette & le déficit" });
    expect(items[1].titre).toBe("Le climat des affaires s'éclaircit");
    expect(items[2].lien).toBe("https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp261029.en.html");
    expect(texteBrut("&lt;b&gt;A&lt;/b&gt; &#233;t&#233; &amp; <![CDATA[hiver]]>")).toBe("A été & hiver");
  });

  it("garde les thèmes du site, avec la page qui les explique", () => {
    const insee = trierFlux(SOURCES_FLUX.find((s) => s.id === "insee")!, items);
    expect(insee.map((e) => e.sujet)).toEqual(["Dette", "Croissance", "Taux"]);
    expect(insee[0]).toMatchObject({ page: "/modules/deficit-et-dette/", important: true });
    // La BCE : seulement les communiqués, pas les discours.
    const bce = trierFlux(SOURCES_FLUX.find((s) => s.id === "bce")!, items);
    expect(bce.map((e) => e.titre)).toEqual(["Monetary policy decisions"]);
    expect(bce[0]).toMatchObject({ important: true, langue: "en" });
    for (const s of SOURCES_FLUX) for (const e of trierFlux(s, items)) expect(pages, e.page).toContain(e.page);
  });

  it("rattache chaque publication au module le plus pertinent, d'après son titre", () => {
    const cas: [string, string | undefined][] = [
      ["Les salaires dans le secteur privé en 2025", "/modules/fiche-de-paie/"],
      ["En septembre 2026, les prix à la consommation augmentent de 3,1 % sur un an", "/modules/les-bases/inflation-taux-reels/"],
      ["Au deuxième trimestre 2026, les salaires horaires augmentent de 2,4 % sur un an, le coût horaire du travail de 2,5 %", "/modules/fiscalite/smic/"],
      ["Vigilance orange sur la croissance", "/modules/les-bases/pib/"],
      ["En octobre 2026, le climat des affaires repart légèrement à la hausse", "/modules/les-bases/pib/"],
      ["Avis n°2026 – 5 Lois de finances 2027", "/modules/deficit-et-dette/soldes/"],
      ["Précisions sur le programme de détention de la dette publique par la Banque de France", "/modules/emprunt-etat/detenteurs/"],
      ["Government debt at 88.8% of GDP in euro area", "/modules/comparaisons/dette-et-deficit/"],
      ["GDP up by 0.6% and employment up by 0.1% in the euro area", "/modules/comparaisons/emploi-croissance/"],
      ["Décisions de politique monétaire", "/modules/banque-centrale/bce-eurosysteme/"],
      // Hors thèmes, tableaux de données, résultats sectoriels ou régionaux, doublons d'un même événement.
      ["En octobre 2026, le climat des affaires dans le bâtiment diminue", undefined],
      ["Salaire minimum interprofessionnel de croissance (Smic)", undefined],
      ["Dette des administrations publiques au sens de Maastricht", undefined],
      ["Chômage – tableau de bord de l’économie française", undefined],
      ["Déclaration de politique monétaire", undefined],
      ["Seasonally adjusted government deficit at 3.3% of GDP in the euro area", undefined],
      ["Les décès en 2025", undefined],
      ["Emploi salarié par secteur", undefined],
    ];
    for (const [titre, page] of cas) expect(sujetDe(titre)?.page, titre).toBe(page);
    // Le résumé n'est pas lu : un article sur les salaires qui cite l'inflation reste un article sur les salaires.
    const [e] = trierFlux({ id: "insee" }, [{ titre: "Les salaires dans le secteur privé en 2025", lien: "https://x", date: "2026-10-22T00:00:00Z", resume: "L'inflation poursuit sa décrue" }]);
    expect(e.sujet).toBe("Emploi");
  });

  it("lit les listes de communiqués de la Banque de France et d'Eurostat", () => {
    const bdf = `<a class="card card-horizontal"
          href ="/fr/communiques-de-presse/decisions-de-politique-monetaire-27"
          title ="D&#233;cisions de politique mon&#233;taire">
        <small class="fs-8 category-btn-grid ">Communiqué de presse BCE</small>
        <h3>Décisions de politique monétaire des 9 et 10 septembre 2026</h3>
        <p class="d-flex"><small> 10 Septembre 2026</small></p></a>`;
    expect(lireListeBanqueDeFrance(bdf)).toEqual([
      { titre: "Décisions de politique monétaire", lien: "https://www.banque-france.fr/fr/communiques-de-presse/decisions-de-politique-monetaire-27", date: "2026-09-10T00:00:00Z", resume: "", categorie: "Communiqué de presse BCE" },
    ]);
    // Communiqué de la BCE relayé en français : il reste attribué à la BCE.
    expect(trierFlux(SOURCES_FLUX.find((s) => s.id === "banque-de-france")!, lireListeBanqueDeFrance(bdf))[0].source).toBe("bce");
    const eurostat = `<a href="https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-16102026-ap" class="ecl-link">
      <span class="estat-title">  Annual inflation up to 3.8% in the euro area </span>
      <span class="ecl-content-block__secondary-meta-label">	16&nbsp;October&nbsp;2026
</span></a>`;
    expect(lireListeEurostat(eurostat)).toEqual([
      { titre: "Annual inflation up to 3.8% in the euro area", lien: "https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-16102026-ap", date: "2026-10-16T00:00:00Z", resume: "" },
    ]);
    expect(dateEnLettres("1er décembre 2026")).toBe("2026-12-01T00:00:00Z");
    expect(lienPropre("http://www.senat.fr/rap/x.html")).toBe("https://www.senat.fr/rap/x.html");
  });

  it("garde la version française d'un communiqué de la BCE publié dans les deux langues", () => {
    const e = (id: string, langue?: "en") => ({ id, date: "2026-09-10T00:00:00Z", source: "bce", sujet: "Taux", ...(langue ? { langue } : {}) }) as EntreeFlux;
    expect(sansDoublon([e("fr"), e("en", "en")]).map((x) => x.id)).toEqual(["fr"]);
    expect(sansDoublon([e("en", "en")]).map((x) => x.id)).toEqual(["en"]);
  });

  it("fusionne sans doublon, du plus récent au plus ancien, sans les éléments trop vieux", () => {
    const e = (id: string, date: string) => ({ id, date }) as EntreeFlux;
    const f = fusionnerFlux([e("a", "2026-10-01T00:00:00Z"), e("b", "2026-06-01T00:00:00Z")], [e("c", "2026-10-20T00:00:00Z"), e("a", "2026-10-01T00:00:00Z")]);
    expect(f.map((x) => x.id)).toEqual(["c", "a"]);
    expect(idFlux("insee", "https://x")).toBe(idFlux("insee", "https://x"));
    expect(idFlux("insee", "https://x")).not.toBe(idFlux("insee", "https://y"));
  });
});

describe("journal des indicateurs", () => {
  it("ne retient que l'arrivée d'une nouvelle période, pas une révision", () => {
    const avant = { id: "ind.inflation-fr", date: "2026-09", serie: [{ x: "2026-08", y: 2.6 }, { x: "2026-09", y: 3.4 }] };
    const revision = { ...avant, serie: [{ x: "2026-08", y: 2.6 }, { x: "2026-09", y: 3.3 }] };
    const nouveau = { ...avant, date: "2026-10", serie: [...avant.serie, { x: "2026-10", y: 3.6 }] };
    expect(nouvellePeriode(avant, revision, "2026-10-30")).toBeUndefined();
    expect(nouvellePeriode(avant, nouveau, "2026-10-30")).toEqual({
      id: "ind.inflation-fr-2026-10",
      date: "2026-10-30",
      donnee: "ind.inflation-fr",
      periode: "2026-10",
      valeur: 3.6,
      avant: { periode: "2026-09", valeur: 3.4 },
    });
    const v = { id: "dette.ratio-pib", date: "2026-06-30", valeur: 119 };
    expect(nouvellePeriode(v, { ...v, date: "2026-09-30", valeur: 120.2 }, "2026-12-18")?.periode).toBe("2026-09-30");
    const j = ajouterAuJournal({ description: "", entrees: [] }, [nouvellePeriode(avant, nouveau, "2026-10-30")!]);
    expect(ajouterAuJournal(j, [nouvellePeriode(avant, nouveau, "2026-10-31")!]).entrees).toHaveLength(1);
  });

  it("le journal publié est bien formé", () => {
    for (const e of journal.entrees as { date: string; donnee: string }[]) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.donnee).toBeTruthy();
    }
  });
});

describe("le fil « L'actu »", () => {
  const fil = construireFil("2026-10-22");

  it("assemble les publications, les alertes et les échéances, du plus récent au plus ancien", () => {
    expect(fil.length).toBeGreaterThan(0);
    const dates = fil.map((e) => e.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(new Set(fil.map((e) => e.id)).size).toBe(fil.length);
    expect(fil.some((e) => e.type === "alerte")).toBe(true);
  });

  it("chaque entrée renvoie vers une page du site qui explique le sujet, et vers l'original quand il existe", () => {
    for (const e of fil) {
      expect(pages, `${e.id} → ${e.page.href}`).toContain(e.page.href);
      expect(e.page.titre).not.toBe("La page du site");
      if (e.source) expect(e.source.url).toMatch(/^https:\/\//);
      expect(e.dateLibelle).toBeTruthy();
    }
  });

  it("propose un brouillon pour chaque événement important, de trois phrases au plus", () => {
    for (const e of fil.filter((x) => x.important)) {
      expect(e.brouillon, e.id).toBeTruthy();
      expect((e.brouillon!.match(/[.!?](\s|$)/g) ?? []).length, e.id).toBeLessThanOrEqual(4);
      expect(e.brouillon).not.toMatch(/undefined|NaN/);
    }
  });

  it("les encadrés validés existent et restent courts", () => {
    for (const [id, x] of Object.entries((explications as Explications).explications)) {
      expect(x.texte.trim(), id).not.toBe("");
      expect(x.texte.length, id).toBeLessThanOrEqual(600);
      expect(x.propose_le).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("le flux enregistré est bien formé", () => {
    for (const e of flux.entrees as EntreeFlux[]) {
      expect(e.lien).toMatch(/^https:\/\//);
      expect(pages, e.page).toContain(e.page);
      expect(Number.isNaN(Date.parse(e.date))).toBe(false);
    }
  });

  it("ne reprend que des sources officielles, chaque entrée rattachée à un thème et à un module", () => {
    const officielles = /^(Insee|Banque centrale européenne|Banque de France|Eurostat|Cour des comptes|Haut Conseil des finances publiques|Assemblée nationale|Sénat|Agence France Trésor)/;
    for (const e of fil) {
      if (e.type === "publication" || e.type === "echeance") expect(e.source?.nom, e.id).toMatch(officielles);
      expect(e.sujet, e.id).toBeTruthy();
    }
    const titres = fil.map((e) => `${e.date} ${e.titre}`);
    expect(new Set(titres).size, "doublon").toBe(titres.length);
  });

  it("couvre septembre et octobre 2026 avec les événements majeurs", () => {
    const fil23 = construireFil("2026-10-23");
    expect(fil23.every((e) => e.date >= DEBUT_FIL)).toBe(true);
    const septembre = fil23.filter((e) => e.date.startsWith("2026-09")).length;
    expect(septembre).toBeGreaterThanOrEqual(15);
    expect(septembre).toBeLessThanOrEqual(30);
    const titres = fil23.map((e) => e.titre).join("\n");
    expect(titres).toMatch(/En septembre 2026, les prix à la consommation augmentent/);
    expect(titres).toMatch(/budget de l'État et de la Sécurité sociale pour 2027 en Conseil des ministres/);
    expect(titres).toMatch(/Lois de finances 2027/);
    expect(titres).toMatch(/Revue de la note de la France par Moody's/);
  });

  it("une échéance passée n'affiche jamais « aujourd'hui », « demain » ni un compte à rebours", () => {
    const relatif = /aujourd'hui|demain|dans \d+ jours?|ce mois-ci/i;
    // Le titre ne porte jamais l'état de l'échéance : il est calculé à l'affichage.
    for (const jour of ["2026-10-23", "2026-10-24", "2026-11-30"]) {
      for (const e of construireFil(jour).filter((x) => x.type === "echeance")) {
        expect(e.titre, e.id).not.toMatch(relatif);
        expect(e.echeance, e.id).toBeDefined();
      }
    }
    // Pour chaque échéance de l'agenda et chaque jour après elle, en mode relatif (navigateur) comme absolu (construction).
    for (const ev of agenda.evenements) {
      for (const decalage of [1, 2, 7, 40]) {
        const jour = new Date(Date.parse(finEcheance(ev)) + decalage * 86_400_000).toISOString().slice(0, 10);
        for (const relatifActif of [true, false]) {
          const { texte, passee } = etatEcheance(ev, jour, relatifActif);
          expect(passee, `${ev.id} le ${jour}`).toBe(true);
          expect(texte, `${ev.id} le ${jour}`).not.toMatch(relatif);
          expect(texte).toMatch(ev.resultat ? new RegExp(ev.resultat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) : /^A eu lieu (le|en) /);
        }
      }
    }
    // Avant : mentions relatives seulement dans le navigateur.
    const ev = { date: "2026-10-23", precision: "jour" as const };
    expect(etatEcheance(ev, "2026-10-23", true).texte).toBe("Aujourd'hui");
    expect(etatEcheance(ev, "2026-10-22", true).texte).toBe("Demain");
    expect(etatEcheance(ev, "2026-10-20", true).texte).toBe("Dans 3 jours (23 octobre 2026)");
    expect(etatEcheance(ev, "2026-10-23", false).texte).toBe("Prévue le 23 octobre 2026");
    expect(etatEcheance(ev, "2026-10-24", true).texte).toBe("A eu lieu le 23 octobre 2026");
    expect(etatEcheance({ ...ev, resultat: "Note Aa3 maintenue, perspective négative" }, "2026-10-24", true).texte).toBe(
      "Note Aa3 maintenue, perspective négative (23 octobre 2026)",
    );
  });

  it("traduit fidèlement les titres d'Eurostat, en gardant l'original", () => {
    const cas: [string, string | undefined][] = [
      ["Euro area annual inflation up to 3.8%", "Inflation annuelle en hausse à 3,8 % dans la zone euro"],
      ["Annual inflation down to 2.8% in the euro area", "Inflation annuelle en baisse à 2,8 % dans la zone euro"],
      ["Euro area unemployment at 6.4%", "Chômage à 6,4 % dans la zone euro"],
      ["GDP up by 0.6% and employment up by 0.1% in the euro area", "PIB en hausse de 0,6 % et emploi en hausse de 0,1 % dans la zone euro"],
      ["GDP down by 0.2% and employment stable in the euro area", "PIB en baisse de 0,2 % et emploi stable dans la zone euro"],
      ["Annual increase in labour costs at 3.1% in euro area", "Hausse annuelle du coût de la main-d'œuvre à 3,1 % dans la zone euro"],
      ["Government debt at 88.8% of GDP in euro area", "Dette publique à 88,8 % du PIB dans la zone euro"],
      ["Euro area government deficit at 3.0% of GDP and government debt at 87.7%", "Déficit public à 3,0 % du PIB et dette publique à 87,7 % dans la zone euro"],
      // Forme inconnue : pas de traduction approximative, le titre reste en anglais.
      ["Euro area job vacancy rate at 2.1%", undefined],
    ];
    for (const [titre, fr] of cas) expect(traduireEurostat(titre), titre).toBe(fr);
    for (const e of fil.filter((x) => x.source?.nom === "Eurostat")) {
      expect(e.titreOriginal, e.id).toBeTruthy();
      expect(e.langue, e.id).toBeUndefined();
    }
  });

  it("précise l'indicateur, le mois et le statut de l'inflation de la zone euro (Eurostat)", () => {
    expect(versionEurostat("Euro area annual inflation up to 3.8%", "2026-10-02")).toBe("IPCH Eurostat, zone euro, septembre 2026, estimation rapide");
    expect(versionEurostat("Euro area annual inflation up to 2.9%", "2026-07-31")).toBe("IPCH Eurostat, zone euro, juillet 2026, estimation rapide");
    expect(versionEurostat("Annual inflation up to 3.8% in the euro area", "2026-10-16")).toBe("IPCH Eurostat, zone euro, septembre 2026, définitif");
    expect(versionEurostat("Euro area unemployment at 6.4%", "2026-10-01")).toBeUndefined();
  });

  it("met les dates en toutes lettres", () => {
    expect(jourEnLettres("2026-10-01")).toBe("1er octobre 2026");
    expect(finDePeriode("2026-09")).toBe("2026-09-30");
    expect(finDePeriode("2026-T2")).toBe("2026-06-30");
    expect(finDePeriode("2025")).toBe("2025-12-31");
    expect(titrePage("/modules/emprunt-etat/oat-btf/")).toBe("OAT et BTF");
  });
});

describe("encadrés « Ce que ça veut dire » soumis à validation", () => {
  const e = (id: string, date: string, important = true, brouillon: string | undefined = "Phrase un. Phrase deux. Phrase trois.") =>
    ({ id, date, titre: `Titre ${id}`, important, brouillon, page: { href: "/tableau-de-bord/", titre: "Le tableau de bord" } }) as EntreeFilPubliee;
  const vide: Explications = { description: "", explications: {} };

  it("une demande par événement important récent, sans encadré", () => {
    const fil = [e("a", "2026-10-20"), e("b", "2026-10-20", false), e("c", "2026-07-01"), e("d", "2026-10-21", true, ""), e("f", "2026-10-21")];
    const cs = constatsExplications(fil, { ...vide, explications: { f: { texte: "déjà là", propose_le: "2026-10-21" } } }, "2026-10-22");
    expect(cs.map((c) => c.id)).toEqual(["explication-a"]);
    expect(cs[0].fichier).toBe("data/actu-explications.json");
    const apres = cs[0].modifier(vide);
    expect(apres.explications.a).toEqual({ texte: "Phrase un. Phrase deux. Phrase trois.", propose_le: "2026-10-22" });
    expect(constatsExplications(fil, apres, "2026-10-22").map((c) => c.id)).not.toContain("explication-a");
    expect(corpsDemande(cs[0], "moi")).toContain("Rien n'est publié");
  });

  it("jamais plus de cinq demandes à la fois", () => {
    const fil = Array.from({ length: 9 }, (_, i) => e(`x${i}`, "2026-10-20"));
    expect(constatsExplications(fil, vide, "2026-10-22")).toHaveLength(5);
  });
});
