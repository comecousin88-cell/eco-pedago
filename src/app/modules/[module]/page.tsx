import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageModule } from "@/components/modules/PageModule";
import { contenus } from "@/content/modules/contenus";
import { modules } from "@/content/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return modules.filter((m) => m.status === "available").map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/modules/[module]">): Promise<Metadata> {
  const { module } = await params;
  const m = modules.find((x) => x.slug === module);
  return m ? { title: m.title, description: m.summary } : {};
}

export default async function PageIntroModule({ params }: PageProps<"/modules/[module]">) {
  const { module } = await params;
  const m = modules.find((x) => x.slug === module);
  const contenu = contenus[module];
  if (!m || !contenu) notFound();
  const { default: Texte } = await contenu.intro();
  return (
    <PageModule module={m} quiz={contenu.quiz}>
      <Texte />
    </PageModule>
  );
}
