import Link from "next/link";
import { site } from "@/content/site";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MainNav } from "./MainNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-ink"
        >
          {site.name}
        </Link>
        <div className="flex items-center gap-1">
          <MainNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
