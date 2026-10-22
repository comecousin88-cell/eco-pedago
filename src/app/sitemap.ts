import type { MetadataRoute } from "next";
import { pagesDuSite } from "@/content/plan-du-site";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return pagesDuSite().map((chemin) => ({ url: `${site.url}${chemin}` }));
}
