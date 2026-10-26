"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // La rubrique reste repérée dans toutes ses pages (un module est dans « Comprendre »…).
  const active = entreeActive(pathname);

  return (
    <nav aria-label="Navigation principale">
      {/* Grands écrans : liens en ligne */}
      <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <NavLink
              item={item}
              active={item.id === active}
              compact
              className="flex items-center rounded-full px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors xl:px-3"
            />
          </li>
        ))}
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
        <ul id="menu-mobile" className="absolute inset-x-0 top-full space-y-1 border-b border-line bg-surface px-4 py-3 shadow-sm lg:hidden">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={item.id === active}
                onNavigate={() => setOpen(false)}
                className="flex flex-col rounded-lg px-3 py-2.5 text-base font-medium"
              />
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
