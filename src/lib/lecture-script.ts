/** Clé localStorage du mode de lecture : "simple" ou "approfondi". */
export const LECTURE_KEY = "lecture";

/**
 * Exécuté dans <head> avant le premier affichage : applique le mode de lecture
 * mémorisé. Sans choix mémorisé, <html data-lecture="simple"> reste en place.
 */
export const lectureScript = `(function(){try{var m=localStorage.getItem("${LECTURE_KEY}");if(m==="simple"||m==="approfondi")document.documentElement.setAttribute("data-lecture",m)}catch(e){}})()`;
