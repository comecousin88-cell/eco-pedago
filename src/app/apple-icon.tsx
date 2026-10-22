import { ImageResponse } from "next/og";

// Monogramme « EC » pour l'écran d'accueil des téléphones et le logo des données structurées.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#1c1917", color: "#fafaf9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 84, fontWeight: 700 }}>
        EC
        <div style={{ width: 90, height: 8, borderRadius: 4, background: "#38bdf8", marginTop: 6 }} />
      </div>
    ),
    size,
  );
}
