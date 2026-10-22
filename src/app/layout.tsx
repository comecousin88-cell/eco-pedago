import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { AnnonceLecture } from "@/components/lecture/AnnonceLecture";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { themeScript } from "@/components/theme/theme-script";
import { lectureScript } from "@/lib/lecture-script";
import { jsonLdSite, metadataSite } from "@/content/metadonnees";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = metadataSite;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-theme="light"
      data-lecture="simple"
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <head>
        {/* Applique le thème et le mode de lecture avant le premier affichage. */}
        {/* type « text/plain » côté client : React ne réexécute pas ce script
            et ne signale plus de balise script dans un composant. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: `${themeScript};${lectureScript}` }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSite) }} />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-ink focus:shadow"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
        <AnnonceLecture />
      </body>
    </html>
  );
}
