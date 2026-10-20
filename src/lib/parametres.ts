import { getSerie, getValeur } from "./data";
import type { ParametresImpot, ParametresPaie } from "./economics";

/**
 * Assemble les paramètres de la fiche de paie et de l'impôt à partir de
 * data/cotisations.json : les simulateurs et les tests utilisent exactement
 * les mêmes valeurs sourcées.
 */
const val = (id: string) => getValeur(id).valeur;

export function parametresPaie(): ParametresPaie {
  return {
    pmss: val("paie.pmss"),
    smicAnnuelRgdu: val("paie.smic-annuel-rgdu"),
    sal: {
      vieillessePlafonnee: val("paie.sal.vieillesse-plafonnee"),
      vieillesseDeplafonnee: val("paie.sal.vieillesse-deplafonnee"),
      agircT1: val("paie.sal.agirc-t1"),
      agircT2: val("paie.sal.agirc-t2"),
      cegT1: val("paie.sal.ceg-t1"),
      cegT2: val("paie.sal.ceg-t2"),
      cet: val("paie.sal.cet"),
      csgDeductible: val("paie.sal.csg-deductible"),
      csgNonDeductible: val("paie.sal.csg-non-deductible"),
      crds: val("paie.sal.crds"),
      assietteCsg: val("paie.assiette-csg"),
    },
    emp: {
      maladie: val("paie.emp.maladie"),
      csa: val("paie.emp.csa"),
      vieillessePlafonnee: val("paie.emp.vieillesse-plafonnee"),
      vieillesseDeplafonnee: val("paie.emp.vieillesse-deplafonnee"),
      famille: val("paie.emp.famille"),
      dialogueSocial: val("paie.emp.dialogue-social"),
      chomage: val("paie.emp.chomage"),
      ags: val("paie.emp.ags"),
      fnalPetite: val("paie.emp.fnal-petite"),
      fnalGrande: val("paie.emp.fnal-grande"),
      formationPetite: val("paie.emp.formation-petite"),
      formationGrande: val("paie.emp.formation-grande"),
      apprentissage: val("paie.emp.apprentissage"),
      agircT1: val("paie.emp.agirc-t1"),
      agircT2: val("paie.emp.agirc-t2"),
      cegT1: val("paie.emp.ceg-t1"),
      cegT2: val("paie.emp.ceg-t2"),
      cet: val("paie.emp.cet"),
    },
    rgdu: {
      tmin: val("paie.rgdu.tmin"),
      tdeltaPetite: val("paie.rgdu.tdelta-petite"),
      tdeltaGrande: val("paie.rgdu.tdelta-grande"),
      exposant: val("paie.rgdu.exposant"),
    },
  };
}

export function parametresImpot(): ParametresImpot {
  return {
    bareme: getSerie("ir.bareme").serie.map((p) => ({ seuil: Number(p.x), taux: p.y })),
    decotePlafond: val("ir.decote-seul"),
    decoteTaux: val("ir.decote-taux"),
    abattementMin: val("ir.abattement-min"),
    abattementMax: val("ir.abattement-max"),
  };
}
