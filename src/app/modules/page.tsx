import type { Metadata } from "next";
import Link from "next/link";
import { Redirection } from "@/components/ui/Redirection";

export const metadata: Metadata = {
  title: "Les modules",
  robots: { index: false },
};

/** Ancienne page de rubrique : renvoie vers /comprendre/ (les sous-pages gardent leur adresse). */
export default function AncienneRubrique() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Redirection vers="/comprendre/" />
      <p className="text-lg text-body">
        Les modules sont maintenant regroupés dans la rubrique{" "}
        <Link href="/comprendre/" className="font-medium text-accent underline underline-offset-4">
          Comprendre
        </Link>
        .
      </p>
    </div>
  );
}
