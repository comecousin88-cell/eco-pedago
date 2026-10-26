import { getDonnee } from "@/lib/data";
import { arrondiLecture, formatAvecUnite, formatSource } from "@/lib/format";
import { InfobulleSource } from "./InfobulleSource";
import { qualificatif } from "@/lib/versions";

/**
 * Un chiffre tiré de data/*.json, mis en forme à la française. La source et
 * la date s'affichent dans une infobulle (survol, clavier, toucher), jamais
 * entre parenthèses dans le texte ; un chiffre non vérifié est signalé.
 *
 * <Chiffre id="dette.stock" />                       une valeur
 * <Chiffre id="macro.inflation" x="2025" />          un point d'une série
 * <Chiffre id="bce.pspp-france" />                  le dernier point d'une série (suit les mises à jour)
 * <Chiffre id="dette.stock" unite={false} />         sans l'unité
 * <Chiffre id="actu.salaires.median-2025" exact />   sans arrondi en mode Simple (chiffre cité tel que publié)
 */
export function Chiffre({
  id,
  x,
  decimales,
  unite = true,
  exact = false,
}: {
  id: string;
  x?: string;
  decimales?: number;
  unite?: boolean;
  exact?: boolean;
}) {
  const d = getDonnee(id);
  let valeur: number;
  if ("valeur" in d) {
    valeur = d.valeur;
  } else {
    const point = x === undefined ? d.serie[d.serie.length - 1] : d.serie.find((p) => p.x === x);
    if (!point) throw new Error(`${id} : point « ${x} » absent de la série`);
    valeur = point.y;
  }
  const aVerifier = d.statut === "a_verifier";
  const hypothese = d.statut === "hypothese";
  // Une année s'écrit sans séparateur de milliers.
  const ecrire = (v: number, dec?: number) =>
    d.unite === "année" ? String(v) : unite ? formatAvecUnite(v, d.unite, dec) : formatAvecUnite(v, "", dec).trimEnd();
  const texte = ecrire(valeur, decimales);
  // Mode Simple : chiffre arrondi ; mode Approfondi : chiffre précis, suivi de sa source.
  const a = arrondiLecture(valeur);
  const arrondi = d.unite === "année" || exact ? texte : ecrire(a.valeur, Math.min(a.decimales, decimales ?? a.decimales));
  // Indicateur en plusieurs versions (inflation : IPC ou IPCH, provisoire ou définitif) : dit dans les deux modes.
  const version = qualificatif(d, x);

  return (
    <InfobulleSource
      source={`${d.label}${x ? ` (${x})` : "serie" in d ? ` (${d.serie[d.serie.length - 1].x})` : ""}. ${formatSource(d)}.${aVerifier ? " Chiffre à vérifier." : ""}${hypothese ? " Hypothèse, pas une donnée observée." : ""}`}
      className={`font-semibold whitespace-nowrap text-ink ${
        aVerifier ? "decoration-warn underline decoration-wavy decoration-1 underline-offset-4" : ""
      }`}
    >
      {arrondi === texte ? (
        texte
      ) : (
        <>
          <span data-selon-mode="simple">{arrondi}</span>
          <span data-selon-mode="approfondi">{texte}</span>
        </>
      )}
      {/* Indicateur en plusieurs versions : sa version (IPC ou IPCH, provisoire ou définitif) reste dite dans le texte. */}
      {version && <span className="chiffre-source"> ({version})</span>}
    </InfobulleSource>
  );
}
