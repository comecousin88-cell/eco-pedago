/** Clé localStorage du choix de thème : "light", "dark" ou absent (= système). */
export const THEME_KEY = "theme";

/**
 * Exécuté dans <head> avant le premier affichage : applique le thème choisi,
 * ou celui du système, pour éviter un flash de page claire en mode sombre.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
