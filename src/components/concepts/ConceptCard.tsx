import Link from "next/link";
import { conceptHref, type Concept } from "@/content/concepts";

export function ConceptCard({ concept }: { concept: Concept }) {
  const { accent } = concept;
  return (
    <Link
      href={conceptHref(concept.slug)}
      className={`group flex h-full flex-col rounded-2xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md ${accent.border}`}
    >
      <p className={`text-sm font-semibold ${accent.text}`}>{concept.title}</p>
      <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-stone-900">
        {concept.question}
      </h3>
      <p className="mt-3 flex-1 text-stone-600">{concept.summary}</p>
      <span className={`mt-5 text-sm font-medium ${accent.text}`}>
        Comprendre et simuler{" "}
        <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
