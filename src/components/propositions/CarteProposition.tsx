import Link from "next/link";
import { BadgeVerdict, type NiveauVerdict } from "@/components/pedago/Encadres";
import { SoonBadge } from "@/components/ui/SoonBadge";

/** Ce qu'une carte affiche d'une fiche (sérialisable, pour les composants client). */
export interface CarteFiche {
  slug: string;
  titre: string;
  resume: string;
  themes: string[];
  verdict?: NiveauVerdict;
  redigee: boolean;
}

/** Carte d'une fiche « Propositions passées au crible » : thèmes, titre, résumé, verdict. */
export function CarteProposition({ fiche, titreNiveau = "h3" }: { fiche: CarteFiche; titreNiveau?: "h2" | "h3" }) {
  const Titre = titreNiveau;
  const contenu = (
    <>
      <p className="text-xs font-semibold tracking-wide text-accent uppercase">{fiche.themes.join(" · ")}</p>
      <Titre className="mt-2 font-serif text-lg leading-snug font-semibold text-ink">{fiche.titre}</Titre>
      <p className="mt-2 text-sm leading-relaxed text-muted">{fiche.resume}</p>
      <div className="mt-auto pt-4">
        {fiche.verdict && fiche.redigee ? <BadgeVerdict niveau={fiche.verdict} /> : <SoonBadge />}
      </div>
    </>
  );
  const classes = "flex h-full flex-col rounded-2xl border border-line border-t-4 border-t-accent bg-surface p-5";
  return fiche.redigee ? (
    <Link href={`/propositions/${fiche.slug}/`} className={`${classes} transition hover:-translate-y-0.5 hover:shadow-md`}>
      {contenu}
    </Link>
  ) : (
    <div className={`${classes} opacity-80`}>{contenu}</div>
  );
}

/** Données d'une carte à partir d'une entrée du registre. */
export function versCarte(p: {
  slug: string;
  titre: string;
  resume: string;
  themes: readonly string[];
  verdict?: NiveauVerdict;
  contenu?: unknown;
}): CarteFiche {
  return { slug: p.slug, titre: p.titre, resume: p.resume, themes: [...p.themes], verdict: p.verdict, redigee: !!p.contenu };
}
