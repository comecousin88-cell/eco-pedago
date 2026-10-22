"use client";

import { useEffect, useState } from "react";
import { EVENEMENT_ANNONCE } from "@/lib/lecture";

/** Message bref après un changement de mode de lecture, lu aussi par les lecteurs d'écran. */
export function AnnonceLecture() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    let minuteur: number | undefined;
    const recevoir = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      window.clearTimeout(minuteur);
      minuteur = window.setTimeout(() => setMessage(""), 3500);
    };
    window.addEventListener(EVENEMENT_ANNONCE, recevoir);
    return () => {
      window.removeEventListener(EVENEMENT_ANNONCE, recevoir);
      window.clearTimeout(minuteur);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      {message && <p className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-page shadow-lg">{message}</p>}
    </div>
  );
}
