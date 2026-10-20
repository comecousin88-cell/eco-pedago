"use client";

import { useEffect, useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

type Choix = "system" | "light" | "dark";

const ORDRE: Choix[] = ["system", "light", "dark"];
const LIBELLES: Record<Choix, string> = {
  system: "Thème : comme l'appareil",
  light: "Thème : clair",
  dark: "Thème : sombre",
};

const ecouteurs = new Set<() => void>();

function lireChoix(): Choix {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function abonner(e: () => void) {
  ecouteurs.add(e);
  return () => ecouteurs.delete(e);
}

function appliquer(choix: Choix) {
  const sombre =
    choix === "dark" ||
    (choix === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", sombre ? "dark" : "light");
}

export function ThemeToggle() {
  // Côté serveur, le choix est inconnu : on affiche l'icône « système ».
  const choix = useSyncExternalStore(abonner, lireChoix, () => "system" as Choix);

  // En mode « système », suivre les changements de réglage de l'appareil.
  useEffect(() => {
    if (choix !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const suivre = () => appliquer("system");
    mq.addEventListener("change", suivre);
    return () => mq.removeEventListener("change", suivre);
  }, [choix]);

  function suivant() {
    const prochain = ORDRE[(ORDRE.indexOf(choix) + 1) % ORDRE.length];
    try {
      if (prochain === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, prochain);
    } catch {
      // Stockage indisponible : le choix vaut pour cette page seulement.
    }
    appliquer(prochain);
    for (const e of ecouteurs) e();
  }

  return (
    <button
      type="button"
      onClick={suivant}
      title={LIBELLES[choix]}
      className="rounded-md p-2 text-muted transition-colors hover:bg-subtle hover:text-ink"
    >
      <span className="sr-only">{LIBELLES[choix]} (cliquer pour changer)</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {choix === "light" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : choix === "dark" ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
          </>
        )}
      </svg>
    </button>
  );
}
