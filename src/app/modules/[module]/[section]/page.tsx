import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageModule } from "@/components/modules/PageModule";
import { contenus } from "@/content/modules/contenus";
import { modules } from "@/content/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return modules
    .filter((m) => m.status === "available")
    .flatMap((m) => m.sections.map((s) => ({ module: m.slug, section: s.slug })));
}

export async function generateMetadata({ params }: PageProps<"/modules/[module]/[section]">): Promise<Metadata> {
  const { module, section } = await params;
  const m = modules.find((x) => x.slug === module);
  const s = m?.sections.find((x) => x.slug === section);
  return m && s ? { title: `${s.title} · ${m.title}`, description: m.summary } : {};
}

export default async function PageSection({ params }: PageProps<"/modules/[module]/[section]">) {
  const { module, section } = await params;
  const m = modules.find((x) => x.slug === module);
  const charger = contenus[module]?.sections[section];
  if (!m || !charger) notFound();
  const { default: Texte } = await charger();
  return (
    <PageModule module={m} section={section} quiz={contenus[module].quiz}>
      <Texte />
    </PageModule>
  );
}
