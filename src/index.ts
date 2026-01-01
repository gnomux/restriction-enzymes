export type { OverhangType, RestrictionEnzyme } from "./types.js";
export { enzymes } from "./enzymes.js";

import type { OverhangType, RestrictionEnzyme } from "./types.js";
import { enzymes } from "./enzymes.js";

/**
 * IUPAC ambiguous base codes and their matching nucleotides.
 */
const IUPAC_CODES: Record<string, string> = {
  A: "A",
  C: "C",
  G: "G",
  T: "T",
  R: "AG", // purine
  Y: "CT", // pyrimidine
  S: "GC", // strong
  W: "AT", // weak
  K: "GT", // keto
  M: "AC", // amino
  B: "CGT", // not A
  D: "AGT", // not C
  H: "ACT", // not G
  V: "ACG", // not T
  N: "ACGT", // any
};

/**
 * Convert a recognition site with IUPAC codes to a regex pattern.
 */
function siteToRegex(site: string): RegExp {
  const pattern = site
    .split("")
    .map((char) => {
      const bases = IUPAC_CODES[char.toUpperCase()];
      if (!bases) return char;
      return bases.length === 1 ? bases : `[${bases}]`;
    })
    .join("");

  return new RegExp(pattern, "gi");
}

/**
 * Get the reverse complement of a DNA sequence.
 */
function reverseComplement(seq: string): string {
  const complement: Record<string, string> = {
    A: "T",
    T: "A",
    G: "C",
    C: "G",
    R: "Y",
    Y: "R",
    S: "S",
    W: "W",
    K: "M",
    M: "K",
    B: "V",
    V: "B",
    D: "H",
    H: "D",
    N: "N",
  };

  return seq
    .split("")
    .reverse()
    .map((c) => complement[c.toUpperCase()] || c)
    .join("");
}

/**
 * Represents a cut site found in a sequence.
 */
export interface CutSite {
  /** The enzyme that makes this cut */
  enzyme: RestrictionEnzyme;
  /** Position in the sequence where the recognition site starts (0-indexed) */
  position: number;
  /** Position of the cut on the forward strand (0-indexed) */
  forwardCutPosition: number;
  /** Position of the cut on the reverse strand (0-indexed) */
  reverseCutPosition: number;
}

/**
 * Find all cut sites for a given enzyme in a DNA sequence.
 */
export function findCutSites(
  sequence: string,
  enzyme: RestrictionEnzyme,
): CutSite[] {
  const sites: CutSite[] = [];
  const regex = siteToRegex(enzyme.site);
  const upperSeq = sequence.toUpperCase();

  // Find forward strand matches
  let match;
  while ((match = regex.exec(upperSeq)) !== null) {
    sites.push({
      enzyme,
      position: match.index,
      forwardCutPosition: match.index + enzyme.forwardCut,
      reverseCutPosition: match.index + enzyme.site.length + enzyme.reverseCut,
    });
  }

  // For non-palindromic sites, also check reverse complement
  const revCompSite = reverseComplement(enzyme.site);
  if (revCompSite !== enzyme.site) {
    const revRegex = siteToRegex(revCompSite);
    while ((match = revRegex.exec(upperSeq)) !== null) {
      sites.push({
        enzyme,
        position: match.index,
        forwardCutPosition:
          match.index + enzyme.site.length - enzyme.reverseCut,
        reverseCutPosition: match.index - enzyme.forwardCut,
      });
    }
  }

  return sites.sort((a, b) => a.position - b.position);
}

/**
 * Find all cut sites for multiple enzymes in a DNA sequence.
 */
export function findAllCutSites(
  sequence: string,
  enzymeList: RestrictionEnzyme[] = enzymes,
): CutSite[] {
  const sites: CutSite[] = [];

  for (const enzyme of enzymeList) {
    sites.push(...findCutSites(sequence, enzyme));
  }

  return sites.sort((a, b) => a.position - b.position);
}

/**
 * Get an enzyme by name (case-insensitive).
 */
export function getEnzyme(name: string): RestrictionEnzyme | undefined {
  const lowerName = name.toLowerCase();
  return enzymes.find((e) => e.name.toLowerCase() === lowerName);
}

/**
 * Get all enzymes that produce a specific overhang type.
 */
export function getEnzymesByOverhang(
  overhangType: OverhangType,
): RestrictionEnzyme[] {
  return enzymes.filter((e) => e.overhangType === overhangType);
}

/**
 * Get all enzymes available from a specific supplier.
 */
export function getEnzymesBySupplier(
  supplierCode: string,
): RestrictionEnzyme[] {
  return enzymes.filter((e) => e.suppliers.includes(supplierCode));
}

/**
 * Get all enzymes that recognize a site of a specific length.
 */
export function getEnzymesBySiteLength(length: number): RestrictionEnzyme[] {
  return enzymes.filter((e) => e.site.length === length);
}

/**
 * Check if two enzymes produce compatible (ligatable) ends.
 */
export function areEndsCompatible(
  enzyme1: RestrictionEnzyme,
  enzyme2: RestrictionEnzyme,
): boolean {
  // Blunt ends are always compatible with other blunt ends
  if (enzyme1.overhangType === "blunt" && enzyme2.overhangType === "blunt") {
    return true;
  }

  // For sticky ends, they must have same type and length
  return (
    enzyme1.overhangType === enzyme2.overhangType &&
    enzyme1.overhangLength === enzyme2.overhangLength
  );
}
