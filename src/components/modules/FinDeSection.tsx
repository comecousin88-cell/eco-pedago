"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { marquerLue, useProgression } from "@/lib/progression";

const BOUTON = "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:opacity-85";

/**
 * Fin d'une section de module : la section n'est notée comme lue que si le
 * lecteur arrive jusqu'ici (bas du texte visible à l'écran) ou clique sur
 * « J'ai compris → section suivante ». Ouvrir la page ne suffit pas.
 */
export function FinDeSection({ href, suivante }: { href: string; suivante?: { href: string; titre: string } }) {
  const repere = useRef<HTMLDivElement>(null);
  const lue = useProgression().lues.includes(href);

  useEffect(() => {
    const el = repere.current;
    if (!el || lue) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && marquerLue(href), { threshold: 1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [href, lue]);

  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-6">
      <div ref={repere} aria-hidden="true" data-fin-de-section="" className="h-px w-px" />
      {suivante ? (
        <Link href={suivante.href} onClick={() => marquerLue(href)} className={BOUTON}>
          J&apos;ai compris <span aria-hidden="true">→</span> section suivante
          <span className="sr-only"> : {suivante.titre}</span>
        </Link>
      ) : (
        <button type="button" onClick={() => marquerLue(href)} className={BOUTON}>
          J&apos;ai compris
        </button>
      )}
      {lue && <span className="text-sm text-muted">✓ Section lue</span>}
    </div>
  );
}
