import { construireFil } from "@/content/actu";

// Fil d'actualité au format JSON, produit à la publication. La tâche « Veille
// de l'agenda » le lit pour proposer les encadrés « Ce que ça veut dire ».
export const dynamic = "force-static";

export async function GET() {
  return Response.json(construireFil());
}
