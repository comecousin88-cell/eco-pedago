import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl space-y-2 px-4 py-8 text-sm text-muted sm:px-6">
        <p>
          <span className="font-serif font-semibold text-body">{site.name}</span>
          {" "}: un site pédagogique pour comprendre les finances publiques françaises.
          Il explique des mécanismes et ne soutient aucun parti : quand un sujet fait
          débat, les arguments des deux côtés sont présentés.
        </p>
        <p>
          Chaque chiffre a une source et une date. Ceux qui n&apos;ont pas encore été
          vérifiés sont signalés.
        </p>
        <p>
          Les simulateurs reposent sur des modèles volontairement simplifiés. Ils
          servent à comprendre des mécanismes, pas à faire des prévisions ni à
          remplacer un conseil financier.
        </p>
      </div>
    </footer>
  );
}
