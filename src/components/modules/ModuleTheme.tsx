import type { CSSProperties, ReactNode } from "react";

/** Applique la couleur d'un module (ou d'une rubrique) à tout ce qu'il contient. */
export function ModuleTheme({
  color,
  children,
  className = "",
}: {
  color: { light: string; dark: string };
  children: ReactNode;
  className?: string;
}) {
  const style = { "--accent-l": color.light, "--accent-d": color.dark } as CSSProperties;
  return (
    <div className={`module-theme ${className}`} style={style}>
      {children}
    </div>
  );
}
