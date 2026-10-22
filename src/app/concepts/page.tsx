import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page déplacée",
  robots: { index: false },
};

// Ancienne adresse : les notions sont désormais dans les modules. L'export est
// statique (pas de redirection côté serveur) : une balise meta refresh suffit,
// avec un lien pour qui l'aurait désactivée.
export default function ConceptsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <meta httpEquiv="refresh" content="0; url=/comprendre/" />
      <p className="text-lg text-muted">
        Cette page a déménagé :{" "}
        <Link href="/comprendre/" className="font-medium text-accent underline underline-offset-4">
          les notions sont maintenant dans les modules
        </Link>
        .
      </p>
    </div>
  );
}
