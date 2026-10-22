import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// Image d'aperçu des liens partagés (Open Graph, et Twitter via twitter-image.tsx), produite à la construction du site.
export const alt = `${site.name} : l'économie expliquée simplement`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#fafaf9", color: "#1c1917" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 120, height: 120, borderRadius: 28, background: "#1c1917", color: "#fafaf9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 700 }}>
            EC
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 54, fontWeight: 600, lineHeight: 1.15 }}>L&apos;économie expliquée simplement</div>
          <div style={{ fontSize: 32, color: "#57534e" }}>Dette, déficit, retraites, impôts : des chiffres sourcés et des simulateurs.</div>
        </div>
        <div style={{ height: 10, width: 220, background: "#0369a1", borderRadius: 5 }} />
      </div>
    ),
    size,
  );
}
