"""Extract restriction enzyme data from BioPython and generate TypeScript."""

import json
from pathlib import Path

from Bio.Restriction import AllEnzymes


def get_overhang_info(enzyme) -> tuple[int, str]:
    """Get overhang length and type for an enzyme."""
    ovhg = enzyme.ovhg

    if ovhg == 0:
        return 0, "blunt"
    elif ovhg < 0:
        # Negative ovhg = 5' overhang (e.g., EcoRI)
        return abs(ovhg), "5'"
    else:
        # Positive ovhg = 3' overhang (e.g., PstI)
        return ovhg, "3'"


def extract_enzyme_data(enzyme) -> dict:
    """Extract relevant data from a BioPython enzyme object."""
    overhang_length, overhang_type = get_overhang_info(enzyme)

    return {
        "name": str(enzyme),
        "site": enzyme.site,
        "forwardCut": enzyme.fst5,
        "reverseCut": enzyme.fst3,
        "overhangLength": overhang_length,
        "overhangType": overhang_type,
        "suppliers": list(enzyme.suppl) if enzyme.suppl else [],
    }


def generate_typescript(enzymes: list[dict]) -> str:
    """Generate TypeScript source code for enzyme data."""
    lines = [
        "// Auto-generated from BioPython Bio.Restriction - DO NOT EDIT",
        "// Regenerate with: uv run generate-enzymes",
        "",
        'import type { RestrictionEnzyme } from "./types.js";',
        "",
        "export const enzymes: RestrictionEnzyme[] = ",
    ]

    json_str = json.dumps(enzymes, indent=2)
    lines.append(json_str + ";")

    return "\n".join(lines) + "\n"


def main():
    """Extract enzyme data and write to TypeScript file."""
    enzymes = []

    for enzyme in AllEnzymes:
        try:
            # Skip enzymes that don't have defined cut sites
            if enzyme.fst5 is None or enzyme.fst3 is None:
                continue

            data = extract_enzyme_data(enzyme)
            enzymes.append(data)
        except (AttributeError, TypeError):
            # Skip enzymes that don't have the expected attributes
            continue

    # Sort by enzyme name for consistent output
    enzymes.sort(key=lambda e: e["name"])

    # Generate TypeScript
    ts_content = generate_typescript(enzymes)

    # Write to src/enzymes.ts
    output_path = Path(__file__).parent.parent / "src" / "enzymes.ts"
    output_path.write_text(ts_content)

    print(f"Generated {output_path} with {len(enzymes)} enzymes")


if __name__ == "__main__":
    main()
