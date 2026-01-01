import { describe, expect, it } from "vitest";
import { enzymes } from "../src/index.js";

describe("enzymes snapshot", () => {
  it("should match the expected enzyme count", () => {
    expect(enzymes.length).toMatchInlineSnapshot(`754`);
  });

  it("should have consistent enzyme names", () => {
    const names = enzymes.map((e) => e.name).slice(0, 20);
    expect(names).toMatchInlineSnapshot(`
      [
        "AanI",
        "AarI",
        "AasI",
        "AatII",
        "AbaSI",
        "AbsI",
        "Acc16I",
        "Acc36I",
        "Acc65I",
        "AccB1I",
        "AccB7I",
        "AccBSI",
        "AccI",
        "AccII",
        "AccIII",
        "AceIII",
        "AciI",
        "AclI",
        "AclWI",
        "AcoI",
      ]
    `);
  });

  it("should have EcoRI data matching expected values", () => {
    const ecoRI = enzymes.find((e) => e.name === "EcoRI");
    expect(ecoRI).toMatchInlineSnapshot(`
      {
        "forwardCut": 1,
        "name": "EcoRI",
        "overhangLength": 4,
        "overhangType": "5'",
        "reverseCut": -1,
        "site": "GAATTC",
        "suppliers": [
          "B",
          "C",
          "I",
          "J",
          "K",
          "M",
          "N",
          "O",
          "Q",
          "R",
          "S",
          "V",
          "X",
          "Y",
        ],
      }
    `);
  });
});
