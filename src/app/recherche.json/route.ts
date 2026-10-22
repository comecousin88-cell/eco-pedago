import { indexRecherche } from "@/content/recherche";

// Fichier statique produit à la publication (export statique : GET seulement).
export const dynamic = "force-static";

export async function GET() {
  return Response.json(indexRecherche());
}
