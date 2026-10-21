import type { Metadata } from "next";
import Link from "next/link";
import { Redirection } from "@/components/ui/Redirection";

export const metadata: Metadata = {
  title: "Ministre des Finances",
  robots: { index: false },
};

/** Ancienne adresse du jeu : renvoie vers /jeux/ministre-des-finances/. */
export default function AncienneAdresseJeu() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Redirection vers="/jeux/ministre-des-finances/" />
      <p className="text-lg text-body">
        Le jeu a changé d&apos;adresse :{" "}
        <Link href="/jeux/ministre-des-finances/" className="font-medium text-accent underline underline-offset-4">
          Ministre des Finances
        </Link>
        .
      </p>
    </div>
  );
}
