import Link from "next/link";
import type { Indicateur } from "@/content/indicateurs";
import { chercherValeur, getSerie, LIBELLE_ETAT, type Donnee } from "@/lib/data";
import { formatDateDonnee, formatNombre } from "@/lib/format";
import { derniersPoints, dernierPoint, libellePeriode, periodeIndicateur, valeurUnAnAvant, type Point } from "@/lib/indicateurs";
import { TAUX_DU_JOUR_BDF } from "./BandeauAlertes";
import { CourbeIndicateur } from "./CourbeIndicateur";

/** Courbe miniature en SVG : la tendance des dernières années, sans axes. */
function Miniature({ points, paliers }: { points: Point[]; paliers: boolean }) {
  const L = 160;
  const H = 40;
  const ys = points.map((p) => p.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const etendue = max - min || 1;
  const coord = (i: number, y: number) => [(i / Math.max(1, points.length - 1)) * L, H - 3 - ((y - min) / etendue) * (H - 6)];
  let d = "";
  points.forEach((p, i) => {
    const [x, y] = coord(i, p.y);
    if (i === 0) d += `M${x.toFixed(1)},${y.toFixed(1)}`;
    else if (paliers) d += `H${x.toFixed(1)}V${y.toFixed(1)}`;
    else d += `L${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const [xf, yf] = coord(points.length - 1, points[points.length - 1].y);
  return (
    <svg viewBox={`0 0 ${L} ${H}`} className="h-10 w-full max-w-40" aria-hidden="true" preserveAspectRatio="none">
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={xf} cy={yf} r={3} fill="var(--accent)" />
    </svg>
  );
}

/** Écart avec la valeur de comparaison : « +0,3 point », « −12 points de base ». */
export function ecart(v: number, decimales: number, unite: string) {
  const signe = v > 0 ? "+" : v < 0 ? "−" : "";
  const n = formatNombre(Math.abs(v), decimales);
  if (unite === "points de base") return `${signe}${n} points de base`;
  return `${signe}${n} point${Math.abs(v) >= 2 ? "s" : ""}`;
}

/**
 * Valeur affichée d'un indicateur, sa période, et le point de comparaison
 * (un an plus tôt, ou le dernier point de la série quand la valeur affichée
 * est plus récente). Partagé par les cartes et le bandeau de l'accueil.
 */
export function lectureIndicateur(ind: Indicateur) {
  const donnee = getSerie(ind.serie);
  const dernier = dernierPoint(donnee.serie);
  // Une valeur « plus récente » n'est affichée que si elle l'est vraiment (postérieure au dernier point de la série).
  const candidate = ind.valeurRecente ? chercherValeur(ind.valeurRecente) : undefined;
  const recente = candidate && candidate.date > dernier.x && !candidate.date.startsWith(dernier.x) ? candidate : undefined;
  return {
    donnee,
    dernier,
    recente,
    valeur: recente ? recente.valeur : dernier.y,
    periode: recente ? `au ${formatDateDonnee(recente.date).replace(/^au /, "")}` : periodeIndicateur(dernier.x, ind.frequence, ind.nature),
    reference: recente ? dernier.y : valeurUnAnAvant(donnee.serie, ind.frequence),
    libelleReference: recente
      ? ind.frequence === "mensuelle"
        ? `moyenne de ${libellePeriode(dernier.x, ind.frequence)}`
        : `fin ${dernier.x}`
      : "un an plus tôt",
  };
}

/**
 * Carte d'un indicateur : dernière valeur, période, comparaison avec un an
 * plus tôt, tendance, explication, lien vers la page qui détaille le
 * mécanisme, source datée et historique à la demande.
 */
export function CarteIndicateur({ indicateur: ind }: { indicateur: Indicateur }) {
  const { donnee, dernier, recente, valeur, periode, reference, libelleReference } = lectureIndicateur(ind);
  const serie = donnee.serie;
  const paliers = ind.frequence === "paliers";

  const comparaison = ind.comparaison ? getSerie(ind.comparaison.serie) : undefined;
  const libelles = Object.fromEntries(
    [...serie, ...(comparaison?.serie ?? [])].map((p) => [p.x, libellePeriode(p.x, ind.frequence)]),
  );
  const textes = (ind.comparaisonTexte?.series ?? []).map((c) => ({ ...c, d: getSerie(c.serie) }));
  const sources = [donnee, ...(recente ? [recente] : []), ...(comparaison ? [comparaison] : []), ...textes.map((t) => t.d)];
  // Indicateur et statut de la valeur affichée : « IPC Insee · définitif ».
  const affichee: Donnee = recente ?? donnee;
  const qualificatif = [affichee.indicateur, affichee.etat ? LIBELLE_ETAT[affichee.etat] : ""].filter(Boolean).join(" · ");
  const nomsSources = [...new Set(sources.map((s) => s.source.nom))];

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-serif text-lg font-semibold text-ink">{ind.titre}</h2>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-serif text-4xl font-semibold text-ink tabular-nums">
            {formatNombre(valeur, ind.decimales)}
            <span className="ml-1 text-lg font-normal text-muted">{ind.unite === "points de base" ? "pb" : ind.unite}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {periode}
            {qualificatif && <span className="block text-xs">{qualificatif}</span>}
          </p>
        </div>
        <Miniature points={derniersPoints(serie, ind.frequence, paliers ? 5 : ind.frequence === "annuelle" ? 10 : 5)} paliers={paliers} />
      </div>
      {reference !== undefined && (
        <p className="mt-2 text-sm text-body">
          {libelleReference} : {formatNombre(reference, ind.decimales)} {ind.unite === "points de base" ? "pb" : ind.unite}
          <span className="text-muted"> ({ecart(valeur - reference, ind.decimales, ind.unite)})</span>
        </p>
      )}
      {comparaison && (
        <p className="mt-1 text-sm text-body">
          {ind.comparaison!.libelle} : {formatNombre(dernierPoint(comparaison.serie).y, ind.decimales)} {ind.unite} en{" "}
          {libellePeriode(dernierPoint(comparaison.serie).x, ind.frequence)}
        </p>
      )}
      {textes.length > 0 && (
        <p className="mt-1 text-sm text-body">
          {ind.comparaisonTexte!.titre} ({textes[0].d.indicateur}, {libellePeriode(dernierPoint(textes[0].d.serie).x, ind.frequence)}
          {textes[0].d.etat ? `, ${LIBELLE_ETAT[textes[0].d.etat]}` : ""}) :{" "}
          {textes.map((t, i) => (
            <span key={t.serie}>
              {i > 0 && ", "}
              {t.libelle} {formatNombre(dernierPoint(t.d.serie).y, ind.decimales)} {ind.unite}
            </span>
          ))}
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-muted">{ind.explication}</p>
      <p className="mt-3 text-sm">
        <Link href={ind.lien.href} className="font-medium text-accent underline underline-offset-4">
          Comprendre : {ind.lien.libelle}
        </Link>
        {/* Taux du jour pas encore disponible ici (branchement Webstat en attente d'autorisation) : lien vers la source. */}
        {ind.valeurRecente === "marches.taux10-france-jour" && !recente && (
          <a href={TAUX_DU_JOUR_BDF} target="_blank" rel="noopener" className="mt-1 block text-muted underline underline-offset-4 hover:text-ink">
            Voir le taux du jour sur le site de la Banque de France
            <span className="sr-only"> (nouvel onglet)</span> ↗
          </a>
        )}
      </p>
      <div className="mt-auto">
        <CourbeIndicateur
          titre={`${ind.titre} (${ind.unite})`}
          series={[
            { libelle: "France", couleur: "var(--series-1)", points: serie },
            ...(comparaison ? [{ libelle: ind.comparaison!.libelle, couleur: "var(--series-2)", points: comparaison.serie }] : []),
          ].map((s, i) => (i === 0 && !comparaison ? { ...s, libelle: ind.titre } : s))}
          unite={ind.unite}
          decimales={ind.decimales}
          paliers={paliers}
          libelles={libelles}
        />
        <p className="mt-3 border-t border-line pt-2 text-xs leading-relaxed text-muted">
          Source : {nomsSources.join(" ; ")}. Données consultées le{" "}
          {formatDateDonnee(sources[0].consulte_le ?? sources[0].date).replace(/^au /, "")}.
        </p>
      </div>
    </article>
  );
}
