import Link from "next/link";
import { ConceptCard } from "@/components/concepts/ConceptCard";
import { SoonBadge } from "@/components/ui/SoonBadge";
import { concepts } from "@/content/concepts";
import { navItems } from "@/content/navigation";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="py-14 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          L&apos;économie, sans le jargon
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl">
          Comprendre ce qui se joue derrière les gros titres
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
          Taux d&apos;intérêt, inflation, dette publique, retraites : ces mots
          reviennent tous les jours dans l&apos;actualité. Ici, on les explique
          simplement, et vous pouvez tester par vous-même grâce à des
          simulateurs.
        </p>
        <Link
          href="/concepts"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-stone-700"
        >
          Commencer
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section aria-labelledby="parties" className="border-t border-stone-200 py-12">
        <h2 id="parties" className="font-serif text-2xl font-semibold text-stone-900">
          Trois façons d&apos;apprendre
        </h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {navItems.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl font-semibold text-stone-300">
                    {index + 1}
                  </span>
                  {item.status === "soon" && <SoonBadge />}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-stone-900">{item.label}</h3>
                <p className="mt-2 text-stone-600">{item.description}</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="notions" className="border-t border-stone-200 py-12">
        <h2 id="notions" className="font-serif text-2xl font-semibold text-stone-900">
          Les notions
        </h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {concepts.map((concept) => (
            <li key={concept.slug}>
              <ConceptCard concept={concept} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
