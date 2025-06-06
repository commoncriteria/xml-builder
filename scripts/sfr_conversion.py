from pathlib import Path
import json

base_path = Path(__file__).resolve().parent / "../public/data/sfr_components"

file_names = [
    "app_cc2022_raw.json",
    "gpcp_cc2022_raw.json",
    "gpos_cc2022_raw.json",
    "mdf_raw.json",
    "tls_cc2022_raw.json",
    "virtualization_cc2022_raw.json",
]

for name in file_names:
    input_path = base_path / "sfrSections_state_data" / name
    output_path = base_path / name.replace("_raw.json", ".json")

    with open(input_path, "r") as f:
        sfrSections = json.load(f)

        transformed_data = {}

        # Iterate through the top-level Family UUID and strip it out
        for family_value in sfrSections.values():
            for sfr_uuid, sfr_value in family_value.items():
                cc_id = sfr_value.get("cc_id")
                if cc_id:
                    transformed_data[cc_id] = sfr_value

        with open(output_path, "w") as f:
            json.dump(transformed_data, f, indent=2)