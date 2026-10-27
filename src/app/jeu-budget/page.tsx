import type { Metadata } from "next";
import Link from "next/link";
import { Redirection } from "@/components/ui/Redirection";

export const metadata: Metadata = {
  title: "Redresser les comptes",
  robots: { index: false },
};

/** Ancienne adresse du jeu : renvoie vers /jeux/redresser-les-comptes/. */
export default function AncienneAdresseJeu() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Redirection vers="/jeux/redresser-les-comptes/" />
      <p className="text-lg text-body">
        Le jeu a changé d&apos;adresse :{" "}
        <Link href="/jeux/redresser-les-comptes/" className="font-medium text-accent underline underline-offset-4">
          Redresser les comptes
        </Link>
        .
      </p>
    </div>
  );
}
