import type { ReactNode } from "react";

/**
 * Réglages secondaires d'un simulateur : affichés en mode Approfondi
 * seulement. En mode Simple, une ligne indique combien il y en a ; s'ils ont
 * été modifiés en mode Approfondi, elle le signale (ils restent appliqués).
 */
export function ReglagesAvances({ nombre, children, className = "" }: { nombre: number; children: ReactNode; className?: string }) {
  return (
    <>
      <div data-selon-mode="approfondi" data-bloc="Réglages avancés" className={`reglages-avances ${className}`}>
        {children}
      </div>
      <p data-selon-mode="simple" className="text-sm text-muted">
        {nombre} réglage{nombre > 1 ? "s" : ""} de plus en mode Approfondi.
        <span className="reglages-modifies ml-1 font-medium text-warn">Certains ont été modifiés et restent appliqués.</span>
      </p>
    </>
  );
}
