/**
 * Represents an overhang type produced by a restriction enzyme cut.
 * - "5'" means a 5' overhang (sticky end with 5' extension)
 * - "3'" means a 3' overhang (sticky end with 3' extension)
 * - "blunt" means a blunt end (no overhang)
 */
export type OverhangType = "5'" | "3'" | "blunt";

/**
 * Represents a restriction enzyme with its recognition site and cutting properties.
 */
export interface RestrictionEnzyme {
  /** The enzyme name (e.g., "EcoRI", "BamHI") */
  name: string;

  /** The recognition sequence (5' to 3', using IUPAC codes for ambiguous bases) */
  site: string;

  /** Cut position on the forward strand, relative to the start of the recognition site */
  forwardCut: number;

  /** Cut position on the reverse strand, relative to the start of the recognition site */
  reverseCut: number;

  /** Length of the overhang produced (0 for blunt ends) */
  overhangLength: number;

  /** Type of overhang produced by this enzyme */
  overhangType: OverhangType;

  /** List of commercial supplier codes (e.g., ["N", "K"] for NEB, Takara) */
  suppliers: string[];
}
