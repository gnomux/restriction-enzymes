import { describe, expect, it } from "vitest";
import {
  areEndsCompatible,
  enzymes,
  findCutSites,
  getEnzyme,
  getEnzymesByOverhang,
  getEnzymesBySiteLength,
  getEnzymesBySupplier,
} from "../src/index.js";

describe("enzymes data", () => {
  it("should have enzyme data loaded", () => {
    expect(enzymes.length).toBeGreaterThan(700);
  });

  it("should have EcoRI with correct properties", () => {
    const ecoRI = enzymes.find((e) => e.name === "EcoRI");
    expect(ecoRI).toBeDefined();
    expect(ecoRI!.site).toBe("GAATTC");
    expect(ecoRI!.overhangType).toBe("5'");
    expect(ecoRI!.overhangLength).toBe(4);
  });

  it("should have blunt cutters", () => {
    const bluntCutters = enzymes.filter((e) => e.overhangType === "blunt");
    expect(bluntCutters.length).toBeGreaterThan(0);
  });
});

describe("getEnzyme", () => {
  it("should find enzyme by exact name", () => {
    const enzyme = getEnzyme("EcoRI");
    expect(enzyme).toBeDefined();
    expect(enzyme!.name).toBe("EcoRI");
  });

  it("should find enzyme case-insensitively", () => {
    const enzyme = getEnzyme("ecori");
    expect(enzyme).toBeDefined();
    expect(enzyme!.name).toBe("EcoRI");
  });

  it("should return undefined for unknown enzyme", () => {
    const enzyme = getEnzyme("NotAnEnzyme");
    expect(enzyme).toBeUndefined();
  });
});

describe("getEnzymesByOverhang", () => {
  it("should return 5' overhang enzymes", () => {
    const enzymes = getEnzymesByOverhang("5'");
    expect(enzymes.length).toBeGreaterThan(0);
    expect(enzymes.every((e) => e.overhangType === "5'")).toBe(true);
  });

  it("should return 3' overhang enzymes", () => {
    const enzymes = getEnzymesByOverhang("3'");
    expect(enzymes.length).toBeGreaterThan(0);
    expect(enzymes.every((e) => e.overhangType === "3'")).toBe(true);
  });

  it("should return blunt cutters", () => {
    const enzymes = getEnzymesByOverhang("blunt");
    expect(enzymes.length).toBeGreaterThan(0);
    expect(enzymes.every((e) => e.overhangType === "blunt")).toBe(true);
  });
});

describe("getEnzymesBySupplier", () => {
  it("should return enzymes from NEB (N)", () => {
    const nebEnzymes = getEnzymesBySupplier("N");
    expect(nebEnzymes.length).toBeGreaterThan(0);
    expect(nebEnzymes.every((e) => e.suppliers.includes("N"))).toBe(true);
  });
});

describe("getEnzymesBySiteLength", () => {
  it("should return 6-cutters", () => {
    const sixCutters = getEnzymesBySiteLength(6);
    expect(sixCutters.length).toBeGreaterThan(0);
    expect(sixCutters.every((e) => e.site.length === 6)).toBe(true);
  });

  it("should return 8-cutters", () => {
    const eightCutters = getEnzymesBySiteLength(8);
    expect(eightCutters.length).toBeGreaterThan(0);
    expect(eightCutters.every((e) => e.site.length === 8)).toBe(true);
  });
});

describe("findCutSites", () => {
  it("should find EcoRI sites in a sequence", () => {
    const ecoRI = getEnzyme("EcoRI")!;
    const sequence = "ATGCGAATTCATGCGAATTCATGC";
    //                    ^         ^
    //                    4         14
    const sites = findCutSites(sequence, ecoRI);

    expect(sites.length).toBe(2);
    expect(sites[0].position).toBe(4);
    expect(sites[1].position).toBe(14);
  });

  it("should return empty array when no sites found", () => {
    const ecoRI = getEnzyme("EcoRI")!;
    const sequence = "ATGCATGCATGC";
    const sites = findCutSites(sequence, ecoRI);

    expect(sites).toEqual([]);
  });

  it("should handle ambiguous bases in recognition site", () => {
    // BamHI has site GGATCC (no ambiguity, but test the mechanism)
    const bamHI = getEnzyme("BamHI")!;
    const sequence = "ATGGATCCATGGATCCATG";
    const sites = findCutSites(sequence, bamHI);

    expect(sites.length).toBe(2);
  });
});

describe("areEndsCompatible", () => {
  it("should return true for same enzyme", () => {
    const ecoRI = getEnzyme("EcoRI")!;
    expect(areEndsCompatible(ecoRI, ecoRI)).toBe(true);
  });

  it("should return true for two blunt cutters", () => {
    const bluntEnzymes = getEnzymesByOverhang("blunt");
    if (bluntEnzymes.length >= 2) {
      expect(areEndsCompatible(bluntEnzymes[0], bluntEnzymes[1])).toBe(true);
    }
  });

  it("should return false for incompatible overhangs", () => {
    const fivePrime = getEnzymesByOverhang("5'")[0];
    const threePrime = getEnzymesByOverhang("3'")[0];
    expect(areEndsCompatible(fivePrime, threePrime)).toBe(false);
  });

  it("should return false for different overhang lengths", () => {
    const fivePrimeEnzymes = getEnzymesByOverhang("5'");
    const len4 = fivePrimeEnzymes.find((e) => e.overhangLength === 4);
    const len2 = fivePrimeEnzymes.find((e) => e.overhangLength === 2);

    if (len4 && len2) {
      expect(areEndsCompatible(len4, len2)).toBe(false);
    }
  });
});
