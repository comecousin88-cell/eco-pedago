import Link from "next/link";
import type { Suggestion } from "@/content/suite";

/** Bloc « Et ensuite ? » : deux ou trois pages à lire après celle-ci. */
export function EtEnsuite({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) return null;
  return (
    <aside aria-labelledby="et-ensuite" className="mt-14 border-t border-line pt-8">
      <h2 id="et-ensuite" className="font-serif text-xl font-semibold text-ink">
        Et ensuite ?
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {suggestions.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:border-line-strong hover:shadow-sm">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">{s.raison}</span>
              <span className="mt-1 font-medium text-ink">
                {s.titre} <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
