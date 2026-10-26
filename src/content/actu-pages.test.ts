import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PageActualite, { generateStaticParams } from "@/app/actu/[slug]/page";
import { getDonnee } from "@/lib/data";
import { construireFil, slugifier } from "./actu";
import { raisonNonReprise } from "@/lib/actu/resume-officiel";
import { absenceDeResume, chiffresCles, deLaSource, liensPlusLoin, morceaux, resumes, resumesOfficiels } from "./actu-pages";
import { chiffresEnDur } from "./chiffres-en-dur";
import { indicateurs } from "./indicateurs";
import { moduleHref, modules } from "./modules";

const fil = construireFil("2026-10-25");
const pagesModules = new Set(["/tableau-de-bord/", "/la-france-en-10-chiffres/", ...modules.flatMap((m) => [moduleHref(m.slug), ...m.sections.map((s) => moduleHref(m.slug, s.slug))])]);

async function rendre(slug: string): Promise<string> {
  const page = await PageActualite({ params: Promise.resolve({ slug }) } as Parameters<typeof PageActualite>[0]);
  return renderToStaticMarkup(page).replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ");
}

describe("pages « L'actu »", () => {
  it("chaque actualité de source officielle a sa page, avec une source et un module", () => {
    const avecPage = fil.filter((e) => e.slug);
    expect(avecPage.length).toBe(fil.filter((e) => e.source).length);
    for (const e of avecPage) {
      expect(e.slug, e.id).toMatch(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/);
      expect(e.source?.nom.trim(), e.id).toBeTruthy();
      expect(e.source?.url, e.id).toMatch(/^https:\/\//);
      expect(pagesModules, `${e.id} → ${e.page.href}`).toContain(e.page.href);
    }
    const slugs = avecPage.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(generateStaticParams().length).toBeGreaterThan(0);
  });

  it("l'adresse d'une page ne dépend pas de l'état du jour (échéance passée ou non, valeur d'une alerte)", () => {
    const moodys = (j: string) => construireFil(j).find((e) => e.id === "echeance-moodys-2026-10")?.slug;
    expect(moodys("2026-10-23")).toBe("2026-10-23-revue-de-la-note-de-la-france-par-moody-s");
    expect(moodys("2026-10-25")).toBe(moodys("2026-10-23"));
    expect(slugifier("Prélèvements obligatoires et entreprises : vers un cadre fiscal")).toBe("prelevements-obligatoires-et-entreprises-vers-un-cadre-fiscal");
    expect(slugifier("a ".repeat(60)).length).toBeLessThanOrEqual(80);
  });

  it("les liens « Pour aller plus loin » et les chiffres clés existent", () => {
    for (const e of fil) {
      for (const l of liensPlusLoin(e)) {
        if (l.type === "Module") expect(pagesModules, l.href).toContain(l.href);
        else expect(l.href).toMatch(/^\/(glossaire|idees-recues)\/#[a-z0-9-]+$/);
      }
      const { indicateurs: cartes, donnees } = chiffresCles(e);
      for (const id of cartes) expect(indicateurs.map((i) => i.id), id).toContain(id);
      for (const id of donnees) expect(() => getDonnee(id), id).not.toThrow();
    }
  });

  it("sans résumé, la page n'affiche aucun texte rédigé ni repris, mais sa source et son lien", async () => {
    const sans = fil.filter((e) => e.slug && !resumes[e.id] && !resumesOfficiels[e.id] && !e.explication);
    expect(sans.length).toBeGreaterThan(0);
    for (const e of sans.slice(0, 8)) {
      const html = await rendre(e.slug!);
      expect(html, e.id).toMatch(absenceDeResume(e) ? /Résumé à lire sur le site de la source/ : /Résumé à venir/);
      expect(html, e.id).not.toContain("En bref");
      expect(html, e.id).not.toContain("Ce que ça veut dire");
      expect(html, e.id).not.toContain("Texte repris tel quel");
      expect(html, e.id).not.toMatch(/Généré automatiquement|IA/);
      expect(html, e.id).toContain("Signaler une erreur");
      expect(html, e.id).toContain(e.source!.nom);
      expect(html, e.id).toContain("Lire l'original");
    }
  });

  it("Eurostat, Banque de France : pas de résumé repris (anglais, licence), seulement titre, chiffres, modules et source", async () => {
    const eurostat = fil.find((e) => e.source?.nom === "Eurostat" && !resumes[e.id])!;
    expect(resumesOfficiels[eurostat.id]).toBeUndefined();
    expect(absenceDeResume(eurostat)).toMatch(/anglais/);
    expect(await rendre(eurostat.slug!)).toContain("Eurostat publie son résumé en anglais");
    const bdf = fil.find((e) => e.source?.nom === "Banque de France")!;
    expect(resumesOfficiels[bdf.id]).toBeUndefined();
    expect(absenceDeResume(bdf)).toMatch(/^licence/);
  });

  it("avec un résumé officiel : « Résumé de [source] », texte repris tel quel et en entier, lien vers l'original", async () => {
    const avec = fil.filter((e) => e.slug && resumesOfficiels[e.id]);
    expect(avec.length).toBeGreaterThan(0);
    for (const e of avec) {
      const r = resumesOfficiels[e.id];
      // La licence de la source permet la reprise, et le texte vient bien de la page de la publication.
      expect(raisonNonReprise(r.lien), e.id).toBeUndefined();
      // Communiqué de la BCE relayé par la Banque de France : repris de sa version française sur le site de la BCE.
      if (r.organisme) expect(r.lien, e.id).toMatch(/^https:\/\/www\.ecb\.europa\.eu\/.*\.fr\.html$/);
      else expect(r.lien, e.id).toBe(e.source!.url);
      const html = await rendre(e.slug!);
      expect(html, e.id).toContain(`Résumé ${deLaSource(r.organisme ?? e.source!.nom)}`);
      for (const p of r.paragraphes) expect(html.replace(/\s+/g, " "), e.id).toContain(p.replace(/\s+/g, " ").replace(/&/g, "&amp;").slice(0, 60).replace(/&amp;/g, "&"));
      expect(html, e.id).toContain("Texte repris tel quel et en entier");
      expect(html, e.id).not.toContain("Résumé à venir");
      expect(html, e.id).not.toMatch(/Généré automatiquement/);
      expect(html, e.id).toContain("Lire l'original");
    }
  });

  it("avec un résumé rédigé par le site : En bref, Ce que ça veut dire et mention de rédaction", async () => {
    for (const e of fil.filter((x) => x.slug && resumes[x.id])) {
      const html = await rendre(e.slug!);
      expect(html, e.id).toContain("En bref");
      expect(html, e.id).toContain("Ce que ça veut dire");
      expect(html, e.id).toContain(`Résumé rédigé par EcoClair avec l'aide de l'IA, à partir de la publication ${deLaSource(e.source!.nom)}. En cas d'écart, la source fait foi.`);
      expect(html, e.id).not.toMatch(/Généré automatiquement|relu par/);
      expect(html, e.id).not.toMatch(/\{\{|undefined|NaN/);
    }
  });
});

describe("résumés (data/actu-resumes.json)", () => {
  const ids = new Set(fil.map((e) => e.id));
  const entrees = Object.entries(resumes);
  it("le fichier est bien formé", () => expect(typeof resumes).toBe("object"));
  if (entrees.length > 0) it.each(entrees)("%s", (id, r) => {
    expect(ids, "le résumé doit correspondre à une actualité du fil").toContain(id);
    expect(r.en_bref).toHaveLength(3);
    expect(r.propose_le).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.ce_que_ca_veut_dire.length).toBeLessThanOrEqual(600);
    for (const t of [...r.en_bref, r.ce_que_ca_veut_dire]) {
      expect(t.trim()).not.toBe("");
      // Chaque chiffre vient de data/*.json ; aucun n'est écrit en dur.
      for (const m of morceaux(t)) {
        if ("id" in m) {
          const d = getDonnee(m.id);
          if (m.x !== undefined) expect("serie" in d && d.serie.some((p) => p.x === m.x), `${m.id}@${m.x}`).toBe(true);
        }
      }
      const sansChiffres = t.replace(/\{\{[^}]+\}\}/g, "X");
      expect(chiffresEnDur(sansChiffres).map((c) => c.texte), t).toEqual([]);
    }
  });
});
