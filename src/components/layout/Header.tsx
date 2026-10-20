import Link from "next/link";
import { site } from "@/content/site";
import { MainNav } from "./MainNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-stone-900"
        >
          {site.name}
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
