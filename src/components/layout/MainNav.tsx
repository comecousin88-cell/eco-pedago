"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getModule } from "@/content/modules";
import { themes } from "@/content/rubriques";
import { entreeActive, navItems, type NavItem } from "@/content/navigation";
import { ouvrirRecherche } from "./Recherche";

function NavLink({
  item,
  active,
  onNavigate,
  className,
  compact = false,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  className: string;
  /** Barre des grands écrans : intitulé court sur les écrans moyens, nom complet au survol. */
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.description}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? "bg-ink text-page" : "text-body hover:bg-subtle hover:text-ink"}`}
    >
      {compact && item.court ? (
        <>
          <span aria-hidden="true" className="xl:hidden">
            {item.court}
          </span>
          <span className="sr-only xl:not-sr-only">{item.label}</span>
        </>
      ) : (
        item.label
      )}
    </Link>
  );
}

/** Les 12 modules, rangés par partie : le contenu du menu « Comprendre ». */
function ListeModules({ onNavigate, colonnes = false }: { onNavigate?: () => void; colonnes?: boolean }) {
  return (
    <div className={colonnes ? "grid gap-x-6 gap-y-4 sm:grid-cols-2" : "space-y-3"}>
      {themes.map((t, i) => (
        <div key={t.slug}>
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Partie {i + 1} · {t.titre}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {t.modules.map(getModule).map((m) => (
              <li key={m.slug}>
                <Link href={`/modules/${m.slug}/`} onClick={onNavigate} className="flex gap-2 rounded-lg px-2 py-1.5 text-sm text-body hover:bg-subtle hover:text-ink">
                  <span className="w-5 shrink-0 text-right font-semibold text-muted tabular-nums">{m.number}</span>
                  <span>{m.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Link href="/comprendre/" onClick={onNavigate} className="block px-2 text-sm font-medium text-accent underline underline-offset-4">
        Tous les modules, avec votre progression
      </Link>
    </div>
  );
}

/**
 * « Comprendre », sur grand écran : le lien vers la rubrique, et un menu qui
 * déplie les 12 modules par partie, au survol ou au clic sur la flèche.
 */
function MenuComprendre({ item, active }: { item: NavItem; active: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const zone = useRef<HTMLLIElement>(null);
  const pathname = usePathname();

  // Fermer en changeant de page, avec Échap ou par un clic en dehors.
  useEffect(() => {
    const id = window.setTimeout(() => setOuvert(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);
  useEffect(() => {
    if (!ouvert) return;
    const clavier = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    const clic = (e: PointerEvent) => !zone.current?.contains(e.target as Node) && setOuvert(false);
    document.addEventListener("keydown", clavier);
    document.addEventListener("pointerdown", clic);
    return () => {
      document.removeEventListener("keydown", clavier);
      document.removeEventListener("pointerdown", clic);
    };
  }, [ouvert]);

  return (
    <li ref={zone} className="relative" onMouseEnter={() => setOuvert(true)} onMouseLeave={() => setOuvert(false)}>
      <div className={`flex items-center rounded-full ${active ? "bg-ink text-page" : "text-body hover:bg-subtle hover:text-ink"}`}>
        <Link
          href={item.href}
          title={item.description}
          aria-current={active ? "page" : undefined}
          className="flex items-center py-1.5 pl-2.5 text-sm font-medium whitespace-nowrap xl:pl-3"
        >
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={ouvert}
          aria-controls="menu-comprendre"
          onClick={() => setOuvert((o) => !o)}
          className="flex items-center py-1.5 pr-2 pl-1 xl:pr-2.5"
        >
          <span className="sr-only">{ouvert ? "Fermer" : "Ouvrir"} la liste des 12 modules</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${ouvert ? "rotate-180" : ""}`} fill="currentColor">
            <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
      </div>
      {ouvert && (
        // pt-2 : le survol ne se perd pas entre le bouton et le menu.
        <div id="menu-comprendre" className="absolute top-full left-0 z-50 pt-2">
          <div className="w-[34rem] rounded-2xl border border-line bg-surface p-5 shadow-lg">
            <ListeModules colonnes onNavigate={() => setOuvert(false)} />
          </div>
        </div>
      )}
    </li>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // La rubrique reste repérée dans toutes ses pages (un module est dans « Comprendre »…).
  const active = entreeActive(pathname);

  return (
    <nav aria-label="Navigation principale">
      {/* Grands écrans : liens en ligne */}
      <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
        {navItems.map((item) =>
          item.id === "comprendre" ? (
            <MenuComprendre key={item.href} item={item} active={item.id === active} />
          ) : (
            <li key={item.href}>
              <NavLink
                item={item}
                active={item.id === active}
                compact
                className="flex items-center rounded-full px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors xl:px-3"
              />
            </li>
          ),
        )}
      </ul>

      {/* Mobile : bouton menu */}
      <button
        type="button"
        className="rounded-md p-2 text-body hover:bg-subtle lg:hidden"
        aria-expanded={open}
        aria-controls="menu-mobile"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <ul id="menu-mobile" className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto border-b border-line bg-surface px-4 py-3 shadow-sm lg:hidden">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={item.id === active}
                onNavigate={() => setOpen(false)}
                className="flex flex-col rounded-lg px-3 py-2.5 text-base font-medium"
              />
              {item.id === "comprendre" && (
                <details className="mx-3 mb-1 rounded-lg border border-line px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium text-ink">Les 12 modules</summary>
                  <div className="mt-3">
                    <ListeModules onNavigate={() => setOpen(false)} />
                  </div>
                </details>
              )}
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                ouvrirRecherche();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium text-body hover:bg-subtle hover:text-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              Rechercher dans le site
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
