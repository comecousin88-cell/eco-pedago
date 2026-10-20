import Link from "next/link";
import { SoonBadge } from "./SoonBadge";

export function ComingSoon({
  title,
  intro,
  features,
}: {
  title: string;
  intro: string;
  features: string[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <SoonBadge />
      <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-600">{intro}</p>

      <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Ce qui est prévu
        </h2>
        <ul className="mt-4 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex gap-3 text-stone-700">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-stone-600">
        En attendant, commencez par{" "}
        <Link href="/concepts" className="font-medium text-stone-900 underline underline-offset-4 hover:text-sky-700">
          comprendre les notions clés
        </Link>
        .
      </p>
    </div>
  );
}
