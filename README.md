# restriction-enzymes

Restriction enzyme data and utilities for TypeScript/JavaScript. Data is extracted from BioPython's `Bio.Restriction` module.

## Installation

```bash
npm install restriction-enzymes
```

## Usage

```typescript
import {
  enzymes,
  getEnzyme,
  getEnzymesByOverhang,
  findCutSites,
  areEndsCompatible,
} from "restriction-enzymes";

// Get a specific enzyme
const ecoRI = getEnzyme("EcoRI");
// { name: "EcoRI", site: "GAATTC", overhangType: "5'", ... }

// Get all enzymes with 5' overhangs
const fivePrimeEnzymes = getEnzymesByOverhang("5'");

// Find cut sites in a sequence
const sites = findCutSites("ATGCGAATTCATGC", ecoRI);
// [{ enzyme, position: 4, forwardCutPosition: 5, reverseCutPosition: 9 }]

// Check if two enzymes produce compatible ends
const compatible = areEndsCompatible(ecoRI, getEnzyme("MfeI"));
```

## Regenerating enzyme data

The enzyme data is generated from BioPython. To regenerate:

```bash
uv run python scripts/generate.py
```

## License

MIT
