import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-5xl space-y-2 px-4 py-8 text-sm text-stone-500 sm:px-6">
        <p>
          <span className="font-serif font-semibold text-stone-700">{site.name}</span>
          {" "}: un site pédagogique pour comprendre les grands enjeux économiques.
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
