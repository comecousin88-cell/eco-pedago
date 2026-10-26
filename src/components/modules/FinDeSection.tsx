"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type Ref } from "react";
import { ANCRE_TERMINER, EVENEMENT_TERMINER, MESSAGE_TERMINER } from "@/lib/etapes-module";
import { marquerLue, passerSection, useProgression } from "@/lib/progression";
import { useEtapes } from "./Etapes";

const BOUTON = "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:opacity-85";
const EN_EVIDENCE = "ring-4 ring-accent ring-offset-2 ring-offset-page";

/**
 * Fin d'une section de module : la section n'est notée comme lue que si le
 * lecteur arrive jusqu'ici (bas du texte visible à l'écran) ou clique sur
 * « J'ai compris → section suivante ». Ouvrir la page ne suffit pas.
 * Un clic sur une section verrouillée ramène à ce bouton, mis en évidence
 * quelques secondes ; « Passer cette section » déverrouille la suivante sans
 * noter celle-ci comme lue.
 */
export function FinDeSection({
  href,
  suivante,
  sections = [],
}: {
  href: string;
  suivante?: { href: string; titre: string };
  /** Pages des sections du module, dans l'ordre (pour le verrouillage). */
  sections?: string[];
}) {
  const repere = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLElement>(null);
  const lue = useProgression().lues.includes(href);
  const enCours = useEtapes(sections).etats[sections.indexOf(href)] === "en-cours";
  const [alerte, setAlerte] = useState(false);
  // Défilement provoqué par un clic sur une section verrouillée : arriver au repère ne vaut pas lecture.
  const defilementSignale = useRef(false);

  useEffect(() => {
    const el = repere.current;
    if (!el || lue) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && !defilementSignale.current && marquerLue(href), { threshold: 1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [href, lue]);

  // Clic sur une section verrouillée : défilement jusqu'au bouton, mis en évidence quelques secondes.
  useEffect(() => {
    let fin: number | undefined;
    const signaler = () => {
      const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      defilementSignale.current = true;
      bouton.current?.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "center" });
      bouton.current?.focus({ preventScroll: true });
      setAlerte(true);
      window.clearTimeout(fin);
      fin = window.setTimeout(() => {
        setAlerte(false);
        defilementSignale.current = false;
      }, 4000);
    };
    window.addEventListener(EVENEMENT_TERMINER, signaler);
    // Arrivée depuis une autre page (« …#terminer ») : même signal, une fois la page affichée.
    // Le composant reste monté d'une section à l'autre : d'où la dépendance à `href`.
    let arrivee: number | undefined;
    let correction: number | undefined;
    if (window.location.hash === `#${ANCRE_TERMINER}`) {
      arrivee = window.setTimeout(() => {
        window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
        signaler();
      }, 300);
      // Graphiques et images finissent de s'afficher : si le bouton a bougé hors de l'écran, on y revient.
      correction = window.setTimeout(() => {
        const r = bouton.current?.getBoundingClientRect();
        if (r && (r.top < 0 || r.bottom > window.innerHeight)) bouton.current?.scrollIntoView({ block: "center" });
      }, 1500);
    }
    return () => {
      window.removeEventListener(EVENEMENT_TERMINER, signaler);
      window.clearTimeout(fin);
      window.clearTimeout(arrivee);
      window.clearTimeout(correction);
    };
  }, [href]);

  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-6">
      <div ref={repere} aria-hidden="true" data-fin-de-section="" className="h-px w-px" />
      {suivante ? (
        <Link
          ref={bouton as Ref<HTMLAnchorElement>}
          href={suivante.href}
          onClick={() => marquerLue(href)}
          className={`${BOUTON} ${alerte ? EN_EVIDENCE : ""}`}
        >
          J&apos;ai compris <span aria-hidden="true">→</span> section suivante
          <span className="sr-only"> : {suivante.titre}</span>
        </Link>
      ) : (
        <button
          ref={bouton as Ref<HTMLButtonElement>}
          type="button"
          onClick={() => marquerLue(href)}
          className={`${BOUTON} ${alerte ? EN_EVIDENCE : ""}`}
        >
          J&apos;ai compris
        </button>
      )}
      {suivante && enCours && !lue && (
        <Link
          href={suivante.href}
          onClick={() => passerSection(href)}
          className="text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          Passer cette section
        </Link>
      )}
      {lue && <span className="text-sm text-muted">✓ Section lue</span>}
      <p role="status" className="basis-full text-sm font-medium text-ink empty:hidden">
        {alerte ? MESSAGE_TERMINER : ""}
      </p>
    </div>
  );
}
