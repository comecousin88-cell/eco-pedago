"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems, type NavItem } from "@/content/navigation";
import { ModeLecture } from "@/components/lecture/ModeLecture";
import { SoonBadge } from "@/components/ui/SoonBadge";

// Les adresses finissent par « / » (trailingSlash) : on compare sans.
function isActive(pathname: string, href: string) {
  const p = pathname.replace(/\/$/, "");
  const h = href.replace(/\/$/, "");
  return p === h || p.startsWith(`${h}/`);
}

function NavLink({
  item,
  active,
  onNavigate,
  className,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  className: string;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${className} ${
        active
          ? "bg-ink text-page"
          : "text-body hover:bg-subtle hover:text-ink"
      }`}
    >
      {item.label}
      {item.status === "soon" && <SoonBadge inverted={active} />}
    </Link>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav aria-label="Navigation principale">
      {/* Grands écrans : liens en ligne */}
      <ul className="hidden items-center gap-1 xl:flex">
        {navItems.map((item) => (
          <li key={item.href}>
            <NavLink
              item={item}
              active={isActive(pathname, item.href)}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
            />
          </li>
        ))}
      </ul>

      {/* Mobile : bouton menu */}
      <button
        type="button"
        className="rounded-md p-2 text-body hover:bg-subtle xl:hidden"
        aria-expanded={open}
        aria-controls="menu-mobile"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <ul
          id="menu-mobile"
          className="absolute inset-x-0 top-full space-y-1 border-b border-line bg-surface px-4 py-3 shadow-sm xl:hidden"
        >
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                active={isActive(pathname, item.href)}
                onNavigate={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium"
              />
            </li>
          ))}
          <li className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 pt-3">
            <span className="text-sm text-muted">Niveau de lecture</span>
            <ModeLecture />
          </li>
        </ul>
      )}
    </nav>
  );
}
