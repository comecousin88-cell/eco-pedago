import type { Metadata } from "next";
import { ConceptCard } from "@/components/concepts/ConceptCard";
import { concepts } from "@/content/concepts";

export const metadata: Metadata = {
  title: "Comprendre",
  description:
    "Taux d'intérêt, inflation, dette publique, retraites : une page par notion, avec un simulateur.",
};

export default function ConceptsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
        Comprendre les notions clés
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
        Quatre notions qui reviennent sans cesse dans l&apos;actualité. Pour
        chacune : une explication courte, sans jargon, et un simulateur pour
        voir par vous-même ce qui se passe quand on change les paramètres.
      </p>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {concepts.map((concept) => (
          <li key={concept.slug}>
            <ConceptCard concept={concept} />
          </li>
        ))}
      </ul>
    </div>
  );
}
