import { describe, expect, it } from "vitest";
import explications from "../../data/actu-explications.json";
import flux from "../../data/actu-flux.json";
import journal from "../../data/actu-journal.json";
import { fusionnerFlux, idFlux, lireRss, SOURCES_FLUX, texteBrut, trierFlux, type EntreeFlux } from "@/lib/actu/flux";
import { ajouterAuJournal, nouvellePeriode } from "@/lib/actu/journal";
import { constatsExplications, corpsDemande, type EntreeFilPubliee, type Explications } from "@/lib/veille";
import { construireFil, finDePeriode, jourEnLettres, titrePage } from "./actu";
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

  it("garde les sujets du site, avec la page qui les explique", () => {
    const insee = trierFlux(SOURCES_FLUX.find((s) => s.id === "insee")!, items);
    expect(insee.map((e) => e.sujet)).toEqual(["Dette et déficit", "Politique monétaire", "Politique monétaire"]);
    expect(insee[0]).toMatchObject({ page: "/modules/deficit-et-dette/", important: true });
    // La BCE : seulement les communiqués, pas les discours.
    const bce = trierFlux(SOURCES_FLUX.find((s) => s.id === "bce")!, items);
    expect(bce.map((e) => e.titre)).toEqual(["Monetary policy decisions"]);
    expect(bce[0].important).toBe(true);
    for (const s of SOURCES_FLUX) for (const e of trierFlux(s, items)) expect(pages, e.page).toContain(e.page);
  });

  it("fusionne sans doublon, du plus récent au plus ancien, sans les éléments trop vieux", () => {
    const e = (id: string, date: string) => ({ id, date }) as EntreeFlux;
    const f = fusionnerFlux([e("a", "2026-10-01T00:00:00Z"), e("b", "2026-06-01T00:00:00Z")], [e("c", "2026-10-20T00:00:00Z"), e("a", "2026-10-01T00:00:00Z")], "2026-10-22T00:00:00Z");
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
