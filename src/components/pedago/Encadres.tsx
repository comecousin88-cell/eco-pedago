import type { ReactNode } from "react";
import { Depliable } from "./Depliable";

/** Encadré « Exemple » : chaque notion a au moins un exemple chiffré. */
export function Exemple({ titre = "Exemple", children }: { titre?: string; children: ReactNode }) {
  return (
    <aside className="my-6 rounded-2xl border-l-4 border-accent bg-accent-soft px-5 py-4">
      <p className="text-xs font-semibold tracking-wide text-accent uppercase">{titre}</p>
      <div className="prose-eco mt-2 max-w-none">{children}</div>
    </aside>
  );
}

/** Encadré « À retenir », en fin de section. */
export function ARetenir({ children }: { children: ReactNode }) {
  return (
    <aside className="my-8 rounded-2xl border border-line bg-surface px-5 py-4">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">À retenir</p>
      <div className="prose-eco mt-2 max-w-none">{children}</div>
    </aside>
  );
}

/**
 * « Ce que disent les uns / ce que disent les autres ». Chaque côté présente
 * ses meilleurs arguments et les chiffres sur lesquels il s'appuie.
 * Comme « Pour aller plus loin », il n'apparaît qu'en mode de lecture
 * Approfondi : en mode Simple, il est entièrement masqué.
 */
export function Debat({
  question,
  pour,
  contre,
  titrePour = "Ce que disent les uns",
  titreContre = "Ce que disent les autres",
  children,
}: {
  question: string;
  pour: ReactNode;
  contre: ReactNode;
  titrePour?: string;
  titreContre?: string;
  /** Conclusion facultative : ce qui fait consensus, ce qui reste ouvert. */
  children?: ReactNode;
}) {
  return (
    <div data-selon-mode="approfondi" data-bloc="Débat">
      <Depliable
        className="my-8 rounded-2xl border border-line bg-surface"
        classeEntete="rounded-2xl p-5 hover:bg-subtle sm:px-6"
        classeContenu="px-5 pb-5 sm:px-6 sm:pb-6"
        entete={
          <>
            <span className="block text-xs font-semibold tracking-wide text-muted uppercase">Débat</span>
            <span className="mt-1 block font-serif text-xl font-semibold text-ink">{question}</span>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-subtle p-4">
            <p className="font-semibold text-ink">{titrePour}</p>
            <div className="prose-eco mt-2 max-w-none text-base">{pour}</div>
          </div>
          <div className="rounded-xl bg-subtle p-4">
            <p className="font-semibold text-ink">{titreContre}</p>
            <div className="prose-eco mt-2 max-w-none text-base">{contre}</div>
          </div>
        </div>
        {children && <div className="prose-eco mt-5 max-w-none text-base">{children}</div>}
      </Depliable>
    </div>
  );
}

export type NiveauVerdict = "solide" | "debattu" | "ne-tient-pas";

const VERDICTS: Record<NiveauVerdict, { libelle: string; classes: string; icone: string }> = {
  solide: { libelle: "Mécanisme solide", classes: "bg-ok-soft text-ok border-ok", icone: "✓" },
  debattu: { libelle: "Débattu", classes: "bg-warn-soft text-warn border-warn", icone: "≈" },
  "ne-tient-pas": {
    libelle: "Ne tient pas en l'état",
    classes: "bg-bad-soft text-bad border-bad",
    icone: "✕",
  },
};

export function BadgeVerdict({ niveau }: { niveau: NiveauVerdict }) {
  const v = VERDICTS[niveau];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${v.classes}`}>
      <span aria-hidden="true">{v.icone}</span>
      {v.libelle}
    </span>
  );
}

/** Verdict argumenté : il porte sur un mécanisme et ses chiffres, jamais sur des personnes. */
export function Verdict({ niveau, children }: { niveau: NiveauVerdict; children: ReactNode }) {
  return (
    <section className="my-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Verdict</p>
        <BadgeVerdict niveau={niveau} />
      </div>
      <div className="prose-eco mt-3 max-w-none">{children}</div>
    </section>
  );
}
