import type { ReactNode } from "react";
import { getTerme } from "@/content/glossaire";
import { TermeInfobulle } from "./TermeInfobulle";

/**
 * Terme technique souligné, qui ouvre la définition du glossaire.
 * <Terme id="spread">spread</Terme> ; sans enfant, affiche le nom du terme.
 */
export function Terme({ id, children }: { id: string; children?: ReactNode }) {
  const entree = getTerme(id);
  return (
    <TermeInfobulle id={entree.id} terme={entree.terme} definition={entree.court}>
      {children ?? entree.terme}
    </TermeInfobulle>
  );
}
