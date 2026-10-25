import type { ReactNode } from "react";

/**
 * « Pour bien comprendre » : l'explication la plus simple d'une notion
 * technique, placée avant la partie technique et visible dans les deux modes
 * de lecture. Usage en MDX :
 *
 * <PourBienComprendre titre="Annuler la dette détenue par la Banque de France">
 * <Analogie>Une image de la vie courante.</Analogie>
 * <PasAPas>
 * 1. Première étape, avec des chiffres ronds.
 * 2. …
 * 3. …
 * </PasAPas>
 * <Retenir>La phrase à retenir.</Retenir>
 * </PourBienComprendre>
 *
 * Les chiffres des étapes sont des exemples ronds (100 €, 1 %), pas des
 * données : comme dans <Exemple>, ils ne viennent pas de data/.
 */
export function PourBienComprendre({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section data-bloc="Pour bien comprendre" className="my-8 rounded-2xl border-2 border-accent-line bg-surface px-5 py-5 sm:px-6">
      <p className="text-xs font-semibold tracking-wide text-accent uppercase">Pour bien comprendre</p>
      <p className="mt-1 font-serif text-xl font-semibold text-ink">{titre}</p>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function Partie({ titre, children, className = "" }: { titre: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm font-semibold text-ink">{titre}</p>
      <div className="prose-eco mt-1 max-w-none">{children}</div>
    </div>
  );
}

/** Une image de la vie courante (famille, entreprise, prêt entre amis, compte en banque…). */
export function Analogie({ children }: { children: ReactNode }) {
  return <Partie titre="L'image">{children}</Partie>;
}

/** Le mécanisme en trois étapes au plus, avec des chiffres simples et ronds. */
export function PasAPas({ children }: { children: ReactNode }) {
  return <Partie titre="Pas à pas, avec des chiffres ronds">{children}</Partie>;
}

/** La phrase à retenir. */
export function Retenir({ children }: { children: ReactNode }) {
  return (
    <Partie titre="Ce qu'il faut retenir" className="rounded-xl bg-accent-soft px-4 py-3">
      {children}
    </Partie>
  );
}
