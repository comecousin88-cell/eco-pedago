import type { Metadata } from "next";
import Link from "next/link";
import { Redirection } from "@/components/ui/Redirection";

export const metadata: Metadata = {
  title: "Jeux",
  robots: { index: false },
};

/** Ancienne page de rubrique : renvoie vers /jouer/ (les sous-pages gardent leur adresse). */
export default function AncienneRubrique() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Redirection vers="/jouer/" />
      <p className="text-lg text-body">
        Les jeux et les simulateurs sont maintenant dans la rubrique{" "}
        <Link href="/jouer/" className="font-medium text-accent underline underline-offset-4">
          Jouer
        </Link>
        .
      </p>
    </div>
  );
}
