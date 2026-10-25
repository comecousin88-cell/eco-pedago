import { Chiffre } from "@/components/pedago/Chiffre";
import { morceaux } from "@/content/actu-pages";

/**
 * Texte rédigé de « L'actu » dont les chiffres viennent de data/*.json :
 * {{id}} ou {{id@x}}. Les chiffres sont affichés tels que publiés par la
 * source officielle, sans l'arrondi du mode Simple.
 */
export function TexteAvecChiffres({ texte }: { texte: string }) {
  return (
    <>
      {morceaux(texte).map((m, i) => ("texte" in m ? <span key={i}>{m.texte}</span> : <Chiffre key={i} id={m.id} x={m.x} exact />))}
    </>
  );
}
