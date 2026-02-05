import type { BatchesDataset } from "../types/batch.types"

export const batchesDataset: BatchesDataset = {
  products: [
    {
      product_id: "GIN-MM",
      sku: "Merchant Mae Gin",
      display_name: "Merchant Mae Gin",
      category: "Gin",
      abv_targets: { hearts_run_abv_target_percent: 81.0, bottling_abv_target_percent: 37.5 },
      default_still: "Carrie",
      status: "active"
    },
    {
      product_id: "GIN-RF",
      sku: "Rainforest Gin",
      display_name: "Rainforest Gin",
      category: "Gin",
      status: "active"
    },
    {
      product_id: "GIN-SD",
      sku: "Signature Dry Gin",
      display_name: "Signature Dry Gin (Traditional)",
      category: "Gin",
      status: "active"
    },
    {
      product_id: "GIN-NS",
      sku: "Navy Strength Gin",
      display_name: "Navy Strength Gin",
      category: "Gin",
      status: "active"
    },
    {
      product_id: "GIN-DS",
      sku: "Dry Season Gin",
      display_name: "Dry Season Gin",
      category: "Gin",
      status: "active"
    },
    {
      product_id: "GIN-WS",
      sku: "Wet Season Gin",
      display_name: "Wet Season Gin",
      category: "Gin",
      status: "active"
    },
    {
      product_id: "GIN-OAKS-WS",
      sku: "Oaks Kitchen Gin Wet Season",
      display_name: "Wet Season Gin (Oaks Kitchen)",
      category: "Gin",
      status: "active"
    },
    {
      product_id: "GIN-SD-TRIAL",
      sku: "Signature Dry Gin New Recipe Trial",
      display_name: "Signature Dry Gin Trial",
      category: "Gin",
      status: "active"
    },
    {
      product_id: "GIN-NS",
      sku: "Navy Strength Gin",
      display_name: "Navy Strength Gin",
      category: "Gin",
      status: "active"
    },
    {
      product_id: "ETH-LIQ",
      sku: "Ethanol for Liquors",
      display_name: "Ethanol for Liquors",
      category: "Neutral Spirit",
      status: "active"
    },
    {
      product_id: "ETHANOL",
      sku: "Ethanol for liquors",
      display_name: "Ethanol for Liquors",
      category: "Neutral Spirit",
      status: "active"
    },
    {
      product_id: "VODKA-TD",
      sku: "Vodka Triple Distilled",
      display_name: "Vodka Triple Distilled",
      category: "Vodka",
      status: "active"
    }
  ],

  batches_by_month: {
    "2024-09": [
      {
        batch_id: "SPIRIT-LIQ-001",
        product_id: "ETH-LIQ",
        sku: "Ethanol for Liquors",
        display_name: "Ethanol for Liquors 001",
        date: "2024-09-09",
        timezone: "Australia/Brisbane",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Feints (mixed gin late tails)", volume_l: 830, abv_percent: 70.0, lal: 581.0 },
            { source: "Filtered Water", volume_l: 200, abv_percent: 0.0, lal: 0.0 },
            { source: "Saltwater (wash modifier)", volume_l: null, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 57.0, lal: 570.0 },
          notes: "Feints rectification run"
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: ["Defleg active"],
          observations: [
            "3-day intermittent run",
            "Preheat 70°C previous day / 50°C at 06:00"
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Waste (20L)",
            volume_l: 2.0,
            abv_percent: 89.0,
            density: null,
            lal: 1.8,
            time_start: "08:00",
            notes: "Discarded"
          },
          heads: {
            receiving_vessel: "Waste (20L)",
            volume_l: 10.0,
            abv_percent: 87.8,
            density: 0.822,
            lal: 8.8,
            time_start: "08:25",
            notes: undefined
          },
          hearts: {
            receiving_vessel: "VC-600",
            volume_l: 522.0,
            abv_percent: 84.2,
            density: null,
            lal: null,
            notes: "Hearts segmented; estimated LAL 439–447"
          },
          tails: {
            receiving_vessel: "FEINTS (not collected)",
            volume_l: 0.0,
            abv_percent: null,
            lal: 0.0,
            notes: "No tails collected"
          },
          hearts_segments: [
            { time_start: "17:00", volume_l: 282, abv_percent: 85.1, density: null, lal: null, notes: "Run day 1" },
            { time_start: "07:00 (+1d)", volume_l: 172, abv_percent: 84.9, density: 0.834, lal: 57.7, notes: "" },
            { time_start: "07:30 (+2d)", volume_l: 68, abv_percent: 83.0, density: null, lal: null, notes: "Sheet did not compute LAL" }
          ]
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Waste (20L)", volume_l: 2.0, abv_percent: 89.0, lal: 1.8 },
          { phase: "Heads", receiving_vessel: "Waste (20L)", volume_l: 10.0, abv_percent: 87.8, lal: 8.8 },
          { phase: "Hearts", receiving_vessel: "VC-600", volume_l: 522.0, abv_percent: 84.2, lal: null },
          { phase: "Tails", receiving_vessel: "FEINTS (not collected)", volume_l: 0.0, abv_percent: null, lal: 0.0 }
        ],

        data_integrity: {
          source_sheet_cells_with_errors: ["#REF!", "#VALUE!"],
          fields_with_nulls_due_to_missing_values: [
            "cuts.hearts.lal",
            "cuts.hearts_segments[0].lal",
            "cuts.hearts_segments[2].lal",
            "cuts.hearts.density"
          ],
          error_cells: ["#REF!", "#VALUE!"]
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      },
      {
        batch_id: "SPIRIT-GIN-DRY-2024",
        product_id: "GIN-DS",
        sku: "Oaks Kitchen Gin Dry Season",
        display_name: "Dry Season Gin 2024",
        date: "2024-12-02",
        boiler_on_time: "08:00",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Ethanol Manildra NC96", volume_l: 1000, abv_percent: 50.0, lal: 500.0 },
            { source: "Filtered Water", volume_l: 0.0, abv_percent: 0.0, lal: 0.0 },
            { source: "Saltwater", volume_l: 0.0, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 50.0, lal: 500.0 }
        },

        botanicals: {
          per_lal_g: 29.9,
          items: [
            { name: "Juniper berries", weight_g: 6250, ratio_percent: 41.9 },
            { name: "Coriander seed", weight_g: 625, ratio_percent: 4.2 },
            { name: "Angelica", weight_g: 167, ratio_percent: 1.1 },
            { name: "Cardamon", weight_g: 83, ratio_percent: 0.6 },
            { name: "Lemongrass", weight_g: 1167, ratio_percent: 7.8 },
            { name: "Mandarin", weight_g: 1667, ratio_percent: 11.2 },
            { name: "Mandarin skin", weight_g: 1200, ratio_percent: 8.0 },
            { name: "Turmeric", weight_g: 500, ratio_percent: 3.3 },
            { name: "Rosella flower", weight_g: 1667, ratio_percent: 11.2 },
            { name: "Holy basil", weight_g: 167, ratio_percent: 1.1 },
            { name: "Thai Basil", weight_g: 1000, ratio_percent: 6.7 },
            { name: "Kaffir lime leaf", weight_g: 333, ratio_percent: 2.2 }
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Discarded Waste 20L",
            volume_l: 2.0,
            volume_percent: 0.0,
            abv_percent: 87.0,
            lal: 1.7,
            time_start: "10:55"
          },
          heads: {
            receiving_vessel: "FEINTS-GIN-000x IBC-0x",
            volume_l: 12.0,
            volume_percent: 0.0,
            abv_percent: 81.6,
            lal: 9.8,
            time_start: "11:15"
          },
          hearts: {
            receiving_vessel: "GIN-oaks-ws-000x VC-400",
            volume_l: 199.0,
            abv_percent: 81.4,
            lal: 162.0,
            time_start: "16:00"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-000x IBC-0x",
            volume_l: 100.0,
            abv_percent: 78.0,
            lal: 0.0,
            notes: "Late tails — keep for future distillations",
            time_start: "07:00"
          },
          totals_line_from_sheet: {
            declared_total_run_volume_l: 313.0,
            declared_total_run_percent: 168.0,
            notes: "Sheet listed Total Run LAL as 0.0"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded Waste 20L", volume_l: 2.0, abv_percent: 576.6, lal: 11.5 },
          { phase: "Heads", receiving_vessel: "FEINTS-GIN-000x IBC-0x", volume_l: 12.0, lal: null },
          { phase: "Hearts", receiving_vessel: "GIN-oaks-ws-000x VC-400", volume_l: 199.0, lal: null },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-000x IBC-0x", volume_l: 100.0, abv_percent: 80.0, lal: 0.0 }
        ],

        dilution: {
          instructions_note: "Copied exactly",
          steps: [
            { step_id: "D1", source_volume_l: 199.0, water_added_l: 20.0, new_volume_l: 219.0, target_abv_percent: 41.3, lal: null, calculation_note: "x litres required overall" },
            { step_id: "D2", source_volume_l: 219.0, water_added_l: 5.0, new_volume_l: 224.0, target_abv_percent: 40.0, lal: null },
            { step_id: "D3", source_volume_l: 224.0 },
            { step_id: "D4", source_volume_l: 224.0 }
          ],
          combined: {
            final_output_run: { new_make_l: 224.0, total_volume_l: 224.0 }
          }
        },

        data_integrity: {
          source_sheet_cells_with_errors: [],
          fields_with_nulls_due_to_missing_values: [
            "phase_outputs.heads.lal",
            "phase_outputs.hearts.lal",
            "dilution.steps[0].lal",
            "dilution.steps[1].lal"
          ]
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      }
    ],
    "2025-10": [
      {
        batch_id: "VODKA-003",
        product_id: "VODKA",
        sku: "Ethanol for liquors and vodka TRIPLE DISTILLED",
        display_name: "Vodka Triple Distilled 003",
        date: "2025-10-09",
        boiler_on_time: "35A",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Early tails already distilled (ethanol)", volume_l: 925, abv_percent: 52.5, lal: 485.6 },
            { source: "Filtered Water", volume_l: 0, abv_percent: 0.0, lal: 0.0 },
            { source: "Saltwater", volume_l: null, abv_percent: 0.0, lal: null }
          ],
          total: { volume_l: 925, abv_percent: 52.5, lal: 485.6 }
        },

        still_setup: {
          heating_elements: ["35A"],
          steeped_items: [],
          steeping_duration_hours: null,
          condenser_temp_c: null
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: ["Defleg on"],
          observations: [
            "Warmed up to 70C a day before, it was on 50C at 6AM, turned it on at 35A",
            "Plates noted as 'Water running on it'",
            "Foreshots additional entry: time=null, volume_l=null, abv_percent=null, density=0.821, lal=0.0, amps=33A",
            "Phase output total: 416.0 L, 172.5% volume, ABV 0.0%, LAL 0.0",
            "Final output bottled 1176 units"
          ]
        },

        botanicals: {
          per_lal_g: 0.0,
          steeping_notes: "Botanicals not used on this run (sheet lists 0.0 g/LAL)",
          items: []
        },

        cuts: {
          foreshots: {
            time_start: "08:45",
            receiving_vessel: "Discarded 20L Waste",
            volume_l: 2.0,
            volume_percent: null,
            abv_percent: 90.0,
            density: 0.814,
            lal: 1.8,
            notes: "amps 35A"
          },
          heads: {
            notes: "No discrete heads line in sheet"
          },
          hearts: {
            volume_l: 539.0,
            lal: 0.0,
            notes: "Hearts total from sheet"
          },
          tails: {
            volume_l: 0.0,
            abv_percent: 0.0,
            lal: 0.0
          },
          hearts_segments: [
            { time_start: "15:00", volume_l: 125.0, abv_percent: 87.2, lal: null, notes: "Segment Part 1 (amps 33A)" },
            { time_start: "16:30 (back on at 6AM)", volume_l: 288.0, abv_percent: 86.0, lal: 108.4, notes: "Segment Part 2 — VC tank 1, amps 26A" },
            { time_start: "14:00 (back on at 07AM)", volume_l: 126.0, abv_percent: 86.2, lal: 0.0, notes: "Segment Part 3 — VC tank 2, amps 25A" }
          ],
          totals_line_from_sheet: {
            declared_total_run_volume_l: 541.0,
            declared_total_run_percent: 100.0,
            notes: "Total Run ABV recorded as 0.0"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded 20L Waste", volume_l: 2.0, volume_percent: 0.5, abv_percent: 90.0, lal: 1.8 },
          { phase: "Hearts", receiving_vessel: "VC-1000 (blend for vodkas)", volume_l: 288.0, volume_percent: 86.0, abv_percent: 86.0, lal: null },
          { phase: "Hearts", receiving_vessel: "VC-315 (blend for vodkas)", volume_l: 126.0, volume_percent: 86.0, abv_percent: 86.0, lal: null },
          { phase: "Tails", volume_l: 0.0, volume_percent: null, abv_percent: 0.0, lal: 0.0 }
        ],

        dilution: {
          steps: [
            { step_id: "D1", source_volume_l: 288.0, water_added_l: 363.0, new_volume_l: 651.0, target_abv_percent: 38.0, lal: null, calculation_note: "x litres required overall" },
            { step_id: "D2", source_volume_l: 651.0, water_added_l: null, new_volume_l: null, target_abv_percent: 58.6, lal: null, calculation_note: "filtered_water_l original entry: 110 L ethanol 96%" },
            { step_id: "D3", source_volume_l: 761.0, water_added_l: 168.0, new_volume_l: null, target_abv_percent: 38.0, lal: null },
            { step_id: "D4", source_volume_l: null, water_added_l: null, new_volume_l: null, target_abv_percent: null, lal: null }
          ],
          combined: {
            final_output_run: { new_make_l: 1700.0, total_volume_l: 1700.0, lal: 531.0 },
            notes: "LAL check — total_lal_in 384; estimated_perfect_out_percent 84.0; estimated_out_lal 397.534; total_lal_out null; bottled 1176 units"
          }
        },

        data_integrity: {
          source_sheet_cells_with_errors: [],
          fields_with_nulls_due_to_missing_values: [
            "charge.components[2].volume_l",
            "charge.components[2].lal",
            "still_setup.steeping_duration_hours",
            "cuts.heads.volume_l",
            "cuts.heads.abv_percent",
            "cuts.heads.lal",
            "cuts.foreshots.volume_percent",
            "cuts.hearts_segments[0].lal",
            "phase_outputs.hearts[0].lal",
            "phase_outputs.hearts[1].lal",
            "phase_outputs.tails.volume_percent",
            "dilution.steps[1].water_added_l",
            "dilution.steps[1].new_volume_l",
            "dilution.steps[1].lal",
            "dilution.steps[3].source_volume_l",
            "dilution.steps[3].water_added_l",
            "dilution.steps[3].new_volume_l",
            "dilution.steps[3].target_abv_percent",
            "dilution.steps[3].lal",
            "dilution.combined.final_output_run.abv_percent"
          ],
          error_cells: []
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      },
      {
        batch_id: "SPIRIT-LIQ-003",
        product_id: "ETHANOL",
        sku: "Ethanol for liquors",
        display_name: "Ethanol for Liquors 003",
        date: "2025-10-24",
        boiler_on_time: "35A",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Early tails from previous distillations", volume_l: 614, abv_percent: 79.4, lal: 487.5 },
            { source: "Filtered Water", volume_l: 360, abv_percent: 0.0, lal: null },
            { source: "Saltwater", volume_l: null, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 974, abv_percent: 50.0, lal: 487.0 }
        },

        still_setup: {
          heating_elements: ["35A"],
          steeped_items: [],
          steeping_duration_hours: null,
          condenser_temp_c: null
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: ["Defleg on"],
          observations: [
            "Warmed up to 70C a day before, was 50C at 6AM, turned on at 35A",
            "Plates note: Water running on it",
            "Feedstock details: LT-RF 242 L @ 79.4% | LT-MMG 246 L @ 75.8% | VODKA 4TH 126 L @ 81.6%",
            "Phase output total from sheet: volume 493.0 L, volume percent 168.0, ABV 0.0%, LAL 0.0"
          ]
        },

        botanicals: {
          per_lal_g: 0.0,
          steeping_notes: "Botanicals not used on this run (0.0 g/LAL recorded)",
          items: []
        },

        cuts: {
          foreshots: {
            time_start: "09:00",
            receiving_vessel: "Discarded 20L Waste",
            volume_l: 2.0,
            volume_percent: null,
            abv_percent: 88.0,
            density: null,
            lal: 1.8,
            notes: "amps 35A"
          },
          heads: {
            time_start: "09:20",
            receiving_vessel: "Discarded 20L Waste",
            volume_l: 10.0,
            volume_percent: null,
            abv_percent: 87.0,
            lal: 8.7,
            notes: "amps 33A"
          },
          hearts: {
            volume_l: 483.0,
            lal: 0.0,
            notes: "Hearts total from sheet"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-000x",
            volume_l: 0.0,
            abv_percent: null,
            lal: 0.0
          },
          hearts_segments: [
            { time_start: "16:30", volume_l: 132.0, abv_percent: 88.0, lal: null, notes: "Segment Part 1 (amps 33A)" },
            { time_start: "09:00 - 16:00 (back on at 07:30AM)", volume_l: 250.0, abv_percent: 86.0, lal: 200.4, notes: "Segment Part 2 (amps 26A)" },
            { time_start: "09:00 - 12:30 (back on at 07:30AM)", volume_l: 233.0, abv_percent: 80.0, lal: 0.0, notes: "Segment Part 3 (amps 25A)" }
          ],
          totals_line_from_sheet: {
            declared_total_run_volume_l: 627.0,
            declared_total_run_percent: 100.0,
            notes: "Total Run ABV recorded as 0.0"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded 20L Waste", volume_l: 10.0, volume_percent: 2.0, abv_percent: 88.0, lal: 10.5 },
          { phase: "Hearts", receiving_vessel: "VC-330", volume_l: 250.0, abv_percent: 86.0, lal: null },
          { phase: "Hearts", receiving_vessel: "VC-330", volume_l: 233.0, abv_percent: 80.0, lal: null },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-000x", volume_l: 0.0, abv_percent: null, lal: 0.0 }
        ],

        dilution: {
          steps: [
            { step_id: "D1", source_volume_l: 0.0, water_added_l: null, new_volume_l: null, target_abv_percent: 59.6, lal: null, calculation_note: "x litres required overall" },
            { step_id: "D2", source_volume_l: 0.0, water_added_l: null, new_volume_l: null, target_abv_percent: 58.6, lal: null },
            { step_id: "D3", source_volume_l: 0.0, water_added_l: null, new_volume_l: null, target_abv_percent: null, lal: null },
            { step_id: "D4", source_volume_l: 0.0, water_added_l: null, new_volume_l: null, target_abv_percent: null, lal: 0.0 }
          ],
          combined: {
            final_output_run: { new_make_l: 0.0, total_volume_l: 0.0, lal: 0.0 }
          }
        },

        data_integrity: {
          source_sheet_cells_with_errors: [],
          fields_with_nulls_due_to_missing_values: [
            "charge.components[1].lal",
            "charge.components[2].volume_l",
            "cuts.foreshots.density",
            "cuts.foreshots.volume_percent",
            "cuts.hearts.lal",
            "cuts.hearts_segments[0].lal",
            "phase_outputs.hearts[0].lal",
            "phase_outputs.hearts[1].lal",
            "phase_outputs.tails.abv_percent",
            "dilution.steps[0].water_added_l",
            "dilution.steps[0].new_volume_l",
            "dilution.steps[0].lal",
            "dilution.steps[1].water_added_l",
            "dilution.steps[1].new_volume_l",
            "dilution.steps[1].lal",
            "dilution.steps[2].water_added_l",
            "dilution.steps[2].new_volume_l",
            "dilution.steps[2].target_abv_percent",
            "dilution.steps[2].lal",
            "dilution.steps[3].water_added_l",
            "dilution.steps[3].new_volume_l",
            "dilution.steps[3].target_abv_percent"
          ],
          error_cells: []
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      },
      {
        batch_id: "SPIRIT-GIN-MM-003",
        product_id: "GIN-MM",
        sku: "Merchant Mae Gin",
        display_name: "Merchant Mae Gin 003",
        date: "2025-10-14",
        boiler_on_time: "06:30 AM",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Ethanol Manildra NC96", volume_l: 400, abv_percent: 96.0, lal: 384.0 },
            { source: "Left vodka", volume_l: 500, abv_percent: 19.0, lal: null },
            { source: "Water", volume_l: 100, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 47.9, lal: 479.0 }
        },

        still_setup: {
          heating_elements: ["35A On 06:30"],
          steeped_items: ["Juniper", "Coriander"],
          steeping_duration_hours: 14
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: [],
          observations: ["Still setup options noted: Whisky helmet, 1 long + 3 short tubes"]
        },

        botanicals: {
          per_lal_g: 19.8,
          steeping_notes: "Total botanicals weight recorded as 9490 g",
          items: [
            { name: "Juniper", prep: "Crushed / steeped", weight_g: 6400, ratio_percent: 67.4 },
            { name: "Coriander", prep: "Steeped", weight_g: 1800, ratio_percent: 19.0 },
            { name: "Angelica", weight_g: 180, ratio_percent: 1.9 },
            { name: "Orris Root", weight_g: 50, ratio_percent: 0.5 },
            { name: "Orange", weight_g: 380, ratio_percent: 4.0, prep: "8 fresh naval orange rind" },
            { name: "Lemon", weight_g: 380, ratio_percent: 4.0, prep: "12 fresh lemon rind" },
            { name: "Liquorice", weight_g: 100, ratio_percent: 1.1, prep: "Liquorice root" },
            { name: "Cardamom", weight_g: 150, ratio_percent: 1.6 },
            { name: "Chamomile", weight_g: 50, ratio_percent: 0.5 }
          ]
        },

        cuts: {
          foreshots: {
            time_start: "09:35",
            volume_l: 2.0,
            abv_percent: 86.5,
            density: 0.825,
            lal: 1.7,
            notes: "33A"
          },
          heads: {
            time_start: "09:50",
            volume_l: 10.0,
            abv_percent: 86.0,
            density: 0.828,
            lal: 8.6,
            notes: "30A"
          },
          hearts: {
            volume_l: 246.0,
            lal: 200.7
          },
          tails: {},
          hearts_segments: [
            { time_start: "17:00", volume_l: 246.0, abv_percent: 81.6, lal: 200.7 }
          ],
          tails_segments: [
            {
              volume_l: 246.0,
              abv_percent: 75.8,
              lal: 186.5,
              notes: "optimum amount of LAL of tails to be distilled"
            }
          ],
          totals_line_from_sheet: {
            declared_total_run_volume_l: 504.0,
            declared_total_run_percent: 100.0,
            notes: "Total Run ABV listed as 0.0"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded 20L Waste", volume_l: 2.0, volume_percent: 2.0, abv_percent: 86.5, lal: null },
          { phase: "Heads", receiving_vessel: "IBC-01", volume_l: 10.0, volume_percent: 10.0, abv_percent: 86.0, lal: null },
          { phase: "Hearts", receiving_vessel: "GIN-MM-003 VC-615", volume_l: 246.0, volume_percent: 246.0, abv_percent: 81.6, lal: null },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-001 VC-400", volume_l: 246.0, volume_percent: 246.0, abv_percent: 75.8, lal: null }
        ],

        dilution: {
          steps: [
            { step_id: "D1", source_volume_l: 332.0, water_added_l: 390.0, new_volume_l: 722.0, target_abv_percent: 39.0, lal: null, calculation_note: "x litres required overall" },
            { step_id: "D2", source_volume_l: 722.0, water_added_l: 7.0, new_volume_l: 729.0, target_abv_percent: 37.5, lal: null },
            { step_id: "D3", source_volume_l: 729.0, water_added_l: null, new_volume_l: 729.0, target_abv_percent: null, lal: null },
            { step_id: "D4", source_volume_l: 729.0, water_added_l: null, new_volume_l: 729.0, target_abv_percent: null, lal: null }
          ],
          combined: {
            final_output_run: { new_make_l: 1054.0, total_volume_l: 729.0, lal: 397.0 },
            notes: "LAL check — total_lal_in 384; estimated_perfect_out_percent 84.0; estimated_out_lal 397.534; total_lal_out null"
          }
        },

        data_integrity: {
          source_sheet_cells_with_errors: [],
          fields_with_nulls_due_to_missing_values: [
            "charge.components[1].lal",
            "phase_outputs.foreshots.lal",
            "phase_outputs.heads.lal",
            "phase_outputs.hearts.lal",
            "phase_outputs.tails.lal",
            "dilution.steps[0].lal",
            "dilution.steps[1].lal",
            "dilution.steps[2].water_added_l",
            "dilution.steps[2].target_abv_percent",
            "dilution.steps[2].lal",
            "dilution.steps[3].water_added_l",
            "dilution.steps[3].target_abv_percent",
            "dilution.steps[3].lal"
          ]
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      }
    ],
    "2025-03": [
      {
        batch_id: "SPIRIT-GIN-MM-002",
        product_id: "GIN-MM",
        sku: "Merchant Mae Gin",
        display_name: "Merchant Mae Gin 002",
        date: "2025-03-15",
        boiler_on_time: "09:20",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Ethanol (Manildra NC96)", volume_l: 500, abv_percent: 96.0, lal: 480.0 },
            { source: "Filtered Water", volume_l: 500, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 53.5, lal: 535.0 }
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: [],
          observations: ["Hearts collected over 2 days", "Tails collected across 2025-03-17 and 2025-03-18"]
        },

        botanicals: {
          per_lal_g: 20.5,
          items: [
            { name: "Juniper", weight_g: 6400, ratio_percent: 63.0 },
            { name: "Coriander", weight_g: 1800, ratio_percent: 17.7 },
            { name: "Angelica", weight_g: 180, ratio_percent: 1.8 },
            { name: "Orris Root", weight_g: 90, ratio_percent: 0.9 },
            { name: "Orange (navel rind)", weight_g: 380, ratio_percent: 3.7 },
            { name: "Lemon (fresh rind)", weight_g: 380, ratio_percent: 3.7 },
            { name: "Finger Lime", weight_g: 380, ratio_percent: 3.7 },
            { name: "Macadamia", weight_g: 180, ratio_percent: 1.8 },
            { name: "Liquorice Root", weight_g: 100, ratio_percent: 1.0 },
            { name: "Cardamom", weight_g: 180, ratio_percent: 1.8 },
            { name: "Chamomile", weight_g: 90, ratio_percent: 0.9 }
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Discarded 20L Waste",
            volume_l: 2.0,
            abv_percent: 89.0,
            density: 0.820,
            time_start: "09:20"
          },
          heads: {
            receiving_vessel: "FEINTS-GIN-MIX IBC-01",
            volume_l: 12.0,
            abv_percent: 86.7,
            density: 0.830,
            time_start: "09:45"
          },
          hearts: {
            receiving_vessel: "GIN-NS-0017 VC-230",
            volume_l: 332.0,
            abv_percent: 82.4,
            lal: 273.6,
            notes: "Collected over 2 days. Suggested add 397 L H₂O"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-MIX IBC-01",
            volume_l: 298.0,
            abv_percent: null,
            lal: 0.0,
            notes: "Collected over 2 days; see tails_segments"
          },
          tails_segments: [
            { date: "2025-03-17", volume_l: 135.0, abv_percent: 89.0, notes: "Day 1 collection" },
            { date: "2025-03-18", volume_l: 149.0, abv_percent: 88.2, notes: "Started to smell funky and ABV dropping fast" },
            { date: "2025-03-18", volume_l: 14.0, abv_percent: null, notes: "Final collection" }
          ]
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded 20L Waste", volume_l: 2.0, abv_percent: 89.0 },
          { phase: "Heads", receiving_vessel: "FEINTS-GIN-MIX IBC-01", volume_l: 12.0, abv_percent: 86.7 },
          { phase: "Hearts", receiving_vessel: "GIN-NS-0017 VC-230", volume_l: 332.0, abv_percent: 82.4, lal: 273.6 },
          { phase: "Tails (Day 1)", receiving_vessel: "FEINTS-GIN-MIX IBC-01", volume_l: 135.0, abv_percent: 89.0 },
          { phase: "Tails (Day 2)", receiving_vessel: "FEINTS-GIN-MIX IBC-01", volume_l: 149.0, abv_percent: 88.2 },
          { phase: "Tails (Day 2 final)", receiving_vessel: "FEINTS-GIN-MIX IBC-01", volume_l: 14.0 }
        ],

        dilution: {
          instructions_note: "Suggested add 397 L H₂O",
          steps: [],
          combined: {
            final_output_run: {
              new_make_l: null,
              total_volume_l: null,
              lal: null
            },
            notes: "Pending dilution calculations"
          }
        },

        audit: {
          created_at: "2025-03-15T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-11-03T00:00:00+10:00",
          editable: true
        }
      },
      {
        batch_id: "SPIRIT-GIN-NS-018",
        product_id: "GIN-NS",
        sku: "Navy Strength Gin",
        display_name: "Navy Strength Gin 018",
        date: "2025-03-04",
        boiler_on_time: "",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Ethanol Manildra NC96", volume_l: 500, abv_percent: 96.0, lal: 480.0 },
            { source: "Filtered Water", volume_l: 500, abv_percent: 0.0, lal: null },
            { source: "Saltwater", volume_l: 0.0, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 50.3, lal: 503.0 }
        },

        botanicals: {
          per_lal_g: 20.2,
          items: [
            { name: "Juniper Crushed / steeped", weight_g: 6400, ratio_percent: 63.0 },
            { name: "Coriander Steeped", weight_g: 1800, ratio_percent: 17.7 },
            { name: "Angelica", weight_g: 180, ratio_percent: 1.8 },
            { name: "Orris Root", weight_g: 90, ratio_percent: 0.9 },
            { name: "Orange fresh naval orange rind", weight_g: 380, ratio_percent: 3.7 },
            { name: "Lemon fresh lemon rind", weight_g: 380, ratio_percent: 3.7 },
            { name: "Finger Lime caviar", weight_g: 380, ratio_percent: 3.7 },
            { name: "Macadamia Sliced fresh", weight_g: 180, ratio_percent: 1.8 },
            { name: "Liquorice root", weight_g: 100, ratio_percent: 1.0 },
            { name: "Cardamom", weight_g: 180, ratio_percent: 1.8 },
            { name: "Chamomile", weight_g: 90, ratio_percent: 0.9 }
          ]
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: [],
          observations: ["35 A on at 08:15 AM, zero plates"]
        },

        cuts: {
          foreshots: {
            time_start: "11:15",
            receiving_vessel: "Discarded 20L Waste",
            volume_l: 2.0,
            volume_percent: 0.4,
            abv_percent: 85.0,
            lal: 1.7,
            notes: "35A"
          },
          heads: {
            time_start: "11:30",
            receiving_vessel: "FEINTS-GIN-MIX IBC-01",
            volume_l: 10.0,
            volume_percent: 2.0,
            abv_percent: 84.8,
            lal: 8.5,
            notes: "35A"
          },
          hearts: {
            volume_l: 306.0,
            lal: null
          },
          tails: {},
          hearts_segments: [
            {
              time_start: "17:30",
              volume_l: 185.0,
              abv_percent: 83.0,
              lal: null,
              notes: "Distilling at 30A"
            },
            {
              time_start: "06:30 (05/03/25)",
              volume_l: 306.0,
              abv_percent: 82.0,
              lal: null,
              notes: "Stopped at 79.9%"
            }
          ],
          tails_segments: [
            {
              volume_l: 220.0,
              abv_percent: 81.0,
              lal: 0.0,
              notes: "Keep aside, vodka redistillation"
            }
          ],
          totals_line_from_sheet: {
            declared_total_run_volume_l: 503.0,
            declared_total_run_percent: null,
            notes: "Total run LAL listed as null"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded 20L Waste", volume_l: 2.0, volume_percent: 0.6, abv_percent: 83.0, lal: 10.2 },
          { phase: "Heads", receiving_vessel: "FEINTS-GIN-MIX IBC-01", volume_l: 10.0, abv_percent: 83.0, lal: null },
          { phase: "Hearts", receiving_vessel: "GIN-NS-0018 VC-230", volume_l: 306.0, abv_percent: 82.0, lal: null },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-MIX IBC-01", volume_l: 220.0, abv_percent: 81.0, lal: 0.0 }
        ],

        dilution: {
          instructions_note: "x litres required overall",
          steps: [
            { step_id: "D1", source_volume_l: 306.0, water_added_l: 119.0, new_volume_l: 425.0, target_abv_percent: 59.1, lal: null, calculation_note: "2025-03-07" },
            { step_id: "D2", source_volume_l: 425.0, water_added_l: null, new_volume_l: null, target_abv_percent: null, lal: null },
            { step_id: "D3", source_volume_l: 425.0, water_added_l: null, new_volume_l: null, target_abv_percent: null, lal: null },
            { step_id: "D4", source_volume_l: 425.0, water_added_l: null, new_volume_l: null, target_abv_percent: null, lal: null }
          ],
          combined: {
            final_output_run: { new_make_l: 425.0, total_volume_l: 425.0, lal: null }
          }
        },

        still_setup: {
          steeping_duration_hours: 14,
          heating_elements: [],
          condenser_temp_c: null
        },

        data_integrity: {
          source_sheet_cells_with_errors: ["#VALUE!"],
          fields_with_nulls_due_to_missing_values: [
            "charge.components[1].lal",
            "cuts.hearts.hearts_segments[0].lal",
            "cuts.hearts.hearts_segments[1].lal",
            "cuts.hearts.lal",
            "cuts.tails.tails_segments[0].volume_percent",
            "cuts.tails.tails_segments[0].lal",
            "cuts.tails.tails_segments[0].note",
            "phase_outputs.heads.lal",
            "phase_outputs.hearts.lal",
            "dilution.steps[1].water_added_l",
            "dilution.steps[1].new_volume_l",
            "dilution.steps[1].target_abv_percent",
            "dilution.steps[1].lal",
            "dilution.steps[2].water_added_l",
            "dilution.steps[2].new_volume_l",
            "dilution.steps[2].target_abv_percent",
            "dilution.steps[2].lal",
            "dilution.steps[3].water_added_l",
            "dilution.steps[3].new_volume_l",
            "dilution.steps[3].target_abv_percent",
            "dilution.steps[3].lal",
            "dilution.combined.final_output_run.lal"
          ]
        },

        audit: {
          created_at: "2025-03-08T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-03-08T00:00:00+10:00",
          editable: true
        }
      }
    ],
    "2024-05": [
      {
        batch_id: "SPIRIT-GIN-OAKS-005-WS",
        product_id: "GIN-OAKS-WS",
        sku: "Wet Season",
        display_name: "Wet Season Gin Oaks Kitchen 005",
        date: "2024-05-13",
        boiler_on_time: "06:10",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Ethanol Manildra NC96", volume_l: 500, abv_percent: 50.0, lal: 250.0 },
            { source: "Filtered Water", volume_l: 500, abv_percent: 0.0, lal: null },
            { source: "Saltwater", volume_l: 0, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 25.0, lal: 250.0 }
        },

        botanicals: {
          per_lal_g: 39.9,
          items: [
            { name: "Juniper Crushed / steeped", weight_g: 6250, ratio_percent: 62.6, prep: "ok" },
            { name: "Sawtooth Coriander Leaves - Steeped", weight_g: 625, ratio_percent: 6.3 },
            { name: "Angelica", weight_g: 168, ratio_percent: 1.7, prep: "ok" },
            { name: "Cassia", weight_g: null, ratio_percent: null },
            { name: "Orris Root", weight_g: null, ratio_percent: null, prep: "sug. Add 218 L H2O" },
            { name: "Holy Basil Leaves & Flowers", weight_g: 252, ratio_percent: 2.5 },
            { name: "Thai Sweet Basil Leaves only", weight_g: 168, ratio_percent: 1.7 },
            { name: "Kaffir Fruit Rind", weight_g: 832, ratio_percent: 8.3 },
            { name: "Kaffir Leaves", weight_g: 500, ratio_percent: 5.0 },
            { name: "Thai Marigolds", weight_g: 332, ratio_percent: 3.3 },
            { name: "Galangal Smashed", weight_g: 332, ratio_percent: 3.3 },
            { name: "Lemon Grass Bashed", weight_g: 252, ratio_percent: 2.5 },
            { name: "Macadamia", weight_g: null, ratio_percent: null },
            { name: "Coconut", weight_g: null, ratio_percent: null },
            { name: "Liquorice Root", weight_g: 84, ratio_percent: 0.8, prep: "ok" },
            { name: "Cardamom", weight_g: 84, ratio_percent: 0.8, prep: "ok" },
            { name: "Lavender", weight_g: null, ratio_percent: null },
            { name: "Chamomile", weight_g: null, ratio_percent: null },
            { name: "Elderflower", weight_g: null, ratio_percent: null },
            { name: "Pepperberry", weight_g: null, ratio_percent: null },
            { name: "Mint", weight_g: null, ratio_percent: null },
            { name: "Pandanas (Thai Vanilla)", weight_g: 108, ratio_percent: 1.1 }
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Discarded 20L Waste",
            volume_l: 2.5,
            volume_percent: 0.0,
            abv_percent: 86.0,
            lal: 2.2,
            time_start: "09:20",
            notes: "35A"
          },
          heads: {
            receiving_vessel: "FEINTS-GIN-MIX IBC-01",
            volume_l: 10.0,
            volume_percent: 0.0,
            abv_percent: 82.0,
            lal: 8.2,
            time_start: "09:40",
            notes: "33A"
          },
          hearts: {
            receiving_vessel: "GIN-NS-0018 VC-400",
            volume_l: 236.0,
            volume_percent: null,
            abv_percent: 80.9,
            lal: 190.9,
            time_start: "16:00",
            notes: "30A"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-MIX IBC-01",
            volume_l: 226.0,
            abv_percent: 81.0,
            lal: 0.0,
            time_start: "07:00",
            notes: "Late tails — keep aside for future vodka"
          },
          totals_line_from_sheet: {
            declared_total_run_volume_l: 474.0,
            declared_total_run_percent: 96.0,
            notes: "Sheet listed Total Run LAL as 0.0"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded 20L Waste", volume_l: 2.0, volume_percent: 0.8, abv_percent: 83.0, lal: null },
          { phase: "Heads", receiving_vessel: "FEINTS-GIN-MIX IBC-01", volume_l: 10.0, abv_percent: 83.0, lal: null },
          { phase: "Hearts", receiving_vessel: "GIN-NS-0018 VC-400", volume_l: 236.0, abv_percent: 80.9, lal: null },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-MIX IBC-01", volume_l: 226.0, abv_percent: 81.0, lal: 0.0 }
        ],

        dilution: {
          instructions_note: "Copied exactly",
          steps: [
            { step_id: "D1", source_volume_l: 236.0, water_added_l: 218.0, new_volume_l: 454.0, target_abv_percent: 42.8, lal: null, calculation_note: "2025-03-17" },
            { step_id: "D2", source_volume_l: 454.0, water_added_l: 2.0, new_volume_l: 456.0, target_abv_percent: 42.0, lal: null, calculation_note: "2025-03-17" },
            { step_id: "D3", source_volume_l: 456.0, water_added_l: null, new_volume_l: null, target_abv_percent: null, lal: null },
            { step_id: "D4", source_volume_l: 456.0, water_added_l: null, new_volume_l: null, target_abv_percent: null, lal: null }
          ],
          combined: {
            final_output_run: { new_make_l: 456.0, total_volume_l: 456.0, lal: null }
          }
        },

        data_integrity: {
          source_sheet_cells_with_errors: [],
          fields_with_nulls_due_to_missing_values: [
            "charge.components[1].lal",
            "botanicals[3].weight_g",
            "botanicals[3].ratio_percent",
            "botanicals[4].weight_g",
            "botanicals[4].ratio_percent",
            "botanicals[12].weight_g",
            "botanicals[12].ratio_percent",
            "botanicals[13].weight_g",
            "botanicals[13].ratio_percent",
            "botanicals[16].weight_g",
            "botanicals[16].ratio_percent",
            "botanicals[17].weight_g",
            "botanicals[17].ratio_percent",
            "botanicals[18].weight_g",
            "botanicals[18].ratio_percent",
            "botanicals[19].weight_g",
            "botanicals[19].ratio_percent",
            "botanicals[20].weight_g",
            "botanicals[20].ratio_percent",
            "cuts.hearts.volume_percent",
            "phase_outputs.foreshots.lal",
            "phase_outputs.heads.lal",
            "phase_outputs.hearts.lal",
            "dilution.steps[0].lal",
            "dilution.steps[1].lal",
            "dilution.steps[2].water_added_l",
            "dilution.steps[2].new_volume_l",
            "dilution.steps[2].target_abv_percent",
            "dilution.steps[2].lal",
            "dilution.steps[3].water_added_l",
            "dilution.steps[3].new_volume_l",
            "dilution.steps[3].target_abv_percent",
            "dilution.steps[3].lal",
            "dilution.combined.final_output_run.lal"
          ]
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      }
    ],
    "2024-10": [
      {
        batch_id: "VODKA-001",
        product_id: "VODKA-TD",
        sku: "Ethanol for liquors and vodka TRIPLE DISTILLED",
        display_name: "Vodka Triple Distilled 001",
        date: "2024-10-02",
        boiler_on_time: "08:45",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Early tails already distilled (ethanol)", volume_l: 522, abv_percent: 84.2, lal: 439.5 },
            { source: "Filtered Water", volume_l: 478, abv_percent: 0.0, lal: 0.0 },
            { source: "Saltwater", volume_l: 0, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 57.0, lal: 570.0 }
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: ["35A", "33A", "26A"],
          observations: [
            "Warmed up to 70C a day before",
            "50C at 6AM, turned it on at 35A",
            "Hearts collected in parts over multiple days"
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "20L Waste",
            volume_l: 2.0,
            abv_percent: 89.2,
            lal: 1.8,
            time_start: "08:45",
            notes: "35A - Discarded"
          },
          heads: {
            receiving_vessel: "20L Waste",
            volume_l: 11.0,
            abv_percent: 88.0,
            lal: 9.7,
            time_start: "09:00",
            notes: "33A - Discarded"
          },
          hearts: {
            receiving_vessel: "VC-600",
            volume_l: 513.0,
            abv_percent: 84.5,
            lal: 433.5,
            notes: "Blend for vodkas"
          },
          tails: {
            volume_l: 0.0,
            abv_percent: 0.0,
            lal: 0.0,
            notes: "Not collected"
          },
          hearts_segments: [
            { time_start: "16:15", volume_l: 298, abv_percent: 85.2, lal: 253.9, notes: "Part 1 - 33A" },
            { time_start: "08:00–16:00 (back on at 06:00)", volume_l: 215, abv_percent: 84.8, lal: 182.3, notes: "Part 2 - 26A" }
          ]
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "20L Waste", volume_l: 2.0, abv_percent: 89.2, lal: 1.8 },
          { phase: "Heads", receiving_vessel: "20L Waste", volume_l: 11.0, abv_percent: 88.0, lal: 9.7 },
          { phase: "Hearts", receiving_vessel: "VC-600", volume_l: 513.0, abv_percent: 84.5, lal: 433.5 },
          { phase: "Tails", volume_l: 0.0, abv_percent: 0.0, lal: 0.0 }
        ],

        dilution: {
          instructions_note: "Dilution steps planned but not yet completed",
          steps: [
            { step_id: "D1", source_volume_l: null, water_added_l: null, new_volume_l: null, target_abv_percent: 59.6, lal: null, calculation_note: "x litres required overall" },
            { step_id: "D2", source_volume_l: null, water_added_l: null, new_volume_l: null, target_abv_percent: 58.6, lal: null }
          ],
          combined: {
            final_output_run: { new_make_l: null, lal: null, total_volume_l: null }
          }
        },

        still_setup: {
          steeping_duration_hours: null,
          steeped_items: [],
          heating_elements: ["35A"],
          condenser_temp_c: null
        },

        audit: {
          created_at: "2025-11-03T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-11-03T00:00:00+10:00",
          editable: true
        }
      },
      {
        batch_id: "SPIRIT-GIN-SD-0019",
        product_id: "GIN-SD-TRIAL",
        sku: "Signature Dry Gin New Recipe Trial",
        display_name: "Signature Dry Gin Trial 019",
        date: "2024-10-29",
        boiler_on_time: "06:00",
        still_used: "Carry",

        charge: {
          components: [
            { source: "Ethanol Manildra NC96", volume_l: 700, abv_percent: 42.5, lal: 297.5 },
            { source: "Filtered Water", volume_l: 0, abv_percent: 0.0, lal: 0.0 },
            { source: "Old batches of signature", volume_l: null, abv_percent: null, lal: 0.0 }
          ],
          total: { volume_l: 700, abv_percent: 42.5, lal: 297.5 }
        },

        botanicals: {
          per_lal_g: 23.7,
          items: [
            { name: "Juniper", weight_g: 4480, ratio_percent: 63.4, time: "08:40" },
            { name: "Coriander", weight_g: 1260, ratio_percent: 17.8, time: "08:50" },
            { name: "Angelica", weight_g: 126, ratio_percent: 1.8, prep: "#VALUE! na planilha" },
            { name: "Orris Root", weight_g: 63, ratio_percent: 0.9, time: "12:15" },
            { name: "Orange peel", weight_g: 392, ratio_percent: 5.6 },
            { name: "Lemon peel", weight_g: 392, ratio_percent: 5.6, prep: "ADD 116 L H2O" },
            { name: "Macadamia", weight_g: 126, ratio_percent: 1.8 },
            { name: "Liquorice", weight_g: 70, ratio_percent: 1.0 },
            { name: "Cardamon", weight_g: 126, ratio_percent: 1.8 },
            { name: "Lavender", weight_g: 28, ratio_percent: 0.4, prep: "Put in basket last" }
          ]
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: [
            "6 × 5750W",
            "3 × 5750W + 1 × 2200W",
            "2 × 5750W + 1 × 2200W"
          ],
          observations: [
            "Sheet final observation: 0",
            "Linha em branco pós-hearts",
            "Linhas 'TAILS?' duplicadas sem volume"
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Discarded 20L Waste",
            volume_l: 1.4,
            abv_percent: 88.0,
            lal: 0.0,
            time_start: "08:40",
            notes: "6 × 5750 W"
          },
          heads: {
            receiving_vessel: "FEINTS-GIN-000x IBC-01",
            volume_l: 7.0,
            abv_percent: 84.5,
            lal: null,
            time_start: "08:50",
            notes: "3 × 5750 W + 1 × 2200W"
          },
          hearts: {
            receiving_vessel: "GIN-SD-019 IBC-ENA-7",
            volume_l: 128.0,
            abv_percent: 81.1,
            lal: null,
            time_start: "12:15",
            notes: "2 × 5750W + 1 × 2200W"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-000x IBC-0x",
            volume_l: 0.0,
            abv_percent: 0.0,
            lal: 0.0,
            notes: "Planilha tem linhas TAILS? duplicadas"
          },
          totals_line_from_sheet: {
            declared_total_run_volume_l: 251.4,
            declared_total_run_percent: null,
            notes: "Total Run (Heads/Hearts) mostra #REF!"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded 20L Waste", volume_l: 1.4, abv_percent: 0.0, lal: 0.0 },
          { phase: "Heads", receiving_vessel: "FEINTS-GIN-000x IBC-01", volume_l: 7.0, abv_percent: 0.0, lal: 0.0 },
          { phase: "Hearts", receiving_vessel: "GIN-SD-019 IBC-ENA-7", volume_l: 128.0, abv_percent: 81.1, lal: null },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-000x IBC-0x", volume_l: 0.0, abv_percent: 0.0, lal: 0.0 },
          { phase: "Total Run", volume_l: 136.4, abv_percent: null, lal: null }
        ],

        dilution: {
          steps: [
            { step_id: "D1", source_volume_l: 128.0, water_added_l: 115.0, new_volume_l: 243.0, target_abv_percent: 42.8, lal: 104.0, calculation_note: "x litres required overall 685" },
            { step_id: "D2", source_volume_l: 243.0, water_added_l: 1.0, new_volume_l: 244.0, target_abv_percent: 42.3, lal: 103.2 },
            { step_id: "D3", source_volume_l: 244.0, water_added_l: 0.0, new_volume_l: null, target_abv_percent: null, lal: null, calculation_note: "—" },
            { step_id: "D4", source_volume_l: 244.0, water_added_l: 0.0, new_volume_l: null, target_abv_percent: null, lal: null, calculation_note: "—" }
          ],
          combined: {
            final_output_run: { new_make_l: 244.0, lal: null, total_volume_l: null }
          }
        },

        still_setup: {
          steeping_duration_hours: 18,
          steeped_items: ["Juniper", "Coriander"],
          heating_elements: [
            "6 × 5750W",
            "3 × 5750W + 1 × 2200W",
            "2 × 5750W + 1 × 2200W"
          ],
          condenser_temp_c: null
        },

        data_integrity: {
          source_sheet_cells_with_errors: ["#VALUE!", "#REF!"],
          fields_with_nulls_due_to_missing_values: [
            "cuts.heads.lal",
            "cuts.hearts.lal",
            "phase_outputs.hearts.lal",
            "phase_outputs.total_run.abv_percent",
            "phase_outputs.total_run.lal",
            "dilution.steps[2].new_volume_l",
            "dilution.steps[2].target_abv_percent",
            "dilution.steps[2].lal",
            "dilution.steps[3].new_volume_l",
            "dilution.steps[3].target_abv_percent",
            "dilution.steps[3].lal",
            "dilution.combined.final_output_run.lal",
            "dilution.combined.final_output_run.total_volume_l"
          ]
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      },
      {
        batch_id: "SPIRIT-GIN-RF-28",
        product_id: "GIN-RF",
        sku: "Rainforest Gin",
        display_name: "Rainforest Gin 028",
        date: "2024-10-09",
        boiler_on_time: "07:30",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Ethanol Manildra NC96", volume_l: 0.0, abv_percent: 47.0, lal: null },
            { source: "Filtered Water", volume_l: 0.0, abv_percent: 53.0, lal: null },
            { source: "Saltwater", volume_l: 0.0, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 51.0, lal: 510.0 },
          notes: "options cell = 5.2173E+15"
        },

        botanicals: {
          per_lal_g: 18.3,
          items: [
            { name: "Juniper", weight_g: 6360, ratio_percent: 68.1 },
            { name: "Coriander", weight_g: 1410, ratio_percent: 15.1 },
            { name: "Angelica", weight_g: 175, ratio_percent: 1.9 },
            { name: "Cassia", weight_g: 25, ratio_percent: 0.3 },
            { name: "Orris Root", weight_g: null, ratio_percent: null },
            { name: "Orange", weight_g: null, ratio_percent: null, prep: "on 15/10 50.0 ok" },
            { name: "Lemon", weight_g: null, ratio_percent: null, prep: "3.0" },
            { name: "Finger Lime", weight_g: null, ratio_percent: null },
            { name: "Lemon Myrtle", weight_g: 141, ratio_percent: 1.5 },
            { name: "Lemon Aspen", weight_g: 71, ratio_percent: 0.8, prep: "TAILS" },
            { name: "Grapefruit", weight_g: 567, ratio_percent: 6.1 },
            { name: "Local Fruit", weight_g: null, ratio_percent: null },
            { name: "Macadamia", weight_g: 102, ratio_percent: 1.1 },
            { name: "Coconut", weight_g: null, ratio_percent: null },
            { name: "Liquorice", weight_g: 51, ratio_percent: 0.5 },
            { name: "Cardamom", weight_g: 141, ratio_percent: 1.5 },
            { name: "Lavender", weight_g: null, ratio_percent: null },
            { name: "Chamomile", weight_g: null, ratio_percent: null },
            { name: "Elderflower", weight_g: null, ratio_percent: null },
            { name: "Pepperberry", weight_g: 102, ratio_percent: 1.1 },
            { name: "Mint", weight_g: null, ratio_percent: null },
            { name: "Vanilla", weight_g: 25, ratio_percent: 0.3 },
            { name: "Mango", weight_g: 176, ratio_percent: 1.9 }
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Discarded Bucket",
            volume_l: 2.0,
            volume_percent: 0.7,
            abv_percent: 86.0,
            lal: null,
            time_start: "09:15",
            notes: "45A to warm up"
          },
          heads: {
            receiving_vessel: "FEINTS-GIN-01 IBC-02",
            volume_l: 13.0,
            volume_percent: 4.5,
            abv_percent: 83.5,
            lal: null,
            time_start: "09:40",
            notes: "33A"
          },
          hearts: {
            receiving_vessel: "GIN-RF-0028 VC-400",
            volume_l: 346.0,
            volume_percent: 118.9,
            abv_percent: 82.3,
            lal: 21.0,
            time_start: "18:45"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-01 IBC-02",
            volume_l: 169.7,
            volume_percent: 58.3,
            abv_percent: 75.5,
            lal: null,
            notes: "to be used for something else"
          },
          hearts_segments: [
            { time_start: "18:45", volume_l: 346.0, abv_percent: 82.3, lal: null, notes: "amps 33A; sheet volume % = 118.9" }
          ],
          tails_segments: [
            { volume_l: 169.7, abv_percent: 75.5, lal: null, notes: "to be used for something else" }
          ],
          totals_line_from_sheet: {
            declared_total_run_volume_l: 530.7,
            declared_total_run_percent: 2.5,
            notes: "Total Run LAL recorded as 21.0"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded Bucket", volume_l: 2.0, volume_percent: 0.6, abv_percent: 86.0, lal: 0.0 },
          { phase: "Heads", receiving_vessel: "FEINTS-GIN-01 IBC-02", volume_l: 13.0, volume_percent: 2.5, abv_percent: 83.5, lal: 0.0 },
          { phase: "Hearts", receiving_vessel: "GIN-RF-0028 VC-400", volume_l: 346.0, abv_percent: 82.3, lal: 21.0 },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-01 IBC-02", volume_l: 169.7, volume_percent: 58.3, abv_percent: 75.5, lal: 0.0 }
        ],

        dilution: {
          instructions_note: "Copied exactly – zeros kept",
          steps: [
            { step_id: "D1", source_volume_l: 346.0, water_added_l: 274.0, new_volume_l: 620.0, target_abv_percent: 0.0, lal: null, calculation_note: "x litres required overall" },
            { step_id: "D2", source_volume_l: 670.0, water_added_l: 50.0, new_volume_l: 720.0, target_abv_percent: 0.0, lal: null },
            { step_id: "D3", source_volume_l: 723.0, water_added_l: 3.0, new_volume_l: 726.0, target_abv_percent: 0.0, lal: null }
          ],
          combined: {
            final_output_run: { new_make_l: null, lal: null, total_volume_l: null }
          }
        },

        still_setup: {
          steeping_duration_hours: 18,
          heating_elements: [],
          condenser_temp_c: null
        },

        data_integrity: {
          source_sheet_cells_with_errors: ["still_used original: Roberta"],
          fields_with_nulls_due_to_missing_values: [
            "charge.components[0].lal",
            "charge.components[1].lal",
            "botanicals[4].weight_g",
            "botanicals[5].weight_g",
            "botanicals[6].weight_g",
            "botanicals[7].weight_g",
            "botanicals[11].weight_g",
            "botanicals[13].weight_g",
            "botanicals[15].weight_g",
            "botanicals[16].weight_g",
            "botanicals[17].weight_g",
            "botanicals[18].weight_g",
            "botanicals[21].weight_g",
            "cuts.foreshots.lal",
            "cuts.heads.lal",
            "cuts.hearts_segments[0].lal",
            "cuts.tails.lal",
            "dilution.steps[0].lal",
            "dilution.steps[1].lal",
            "dilution.steps[2].lal",
            "dilution.combined.final_output_run.new_make_l",
            "dilution.combined.final_output_run.lal",
            "dilution.combined.final_output_run.total_volume_l"
          ]
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      }
    ],
    "2024-12": [
      {
        batch_id: "SPIRIT-GIN-MM-001",
        product_id: "GIN-MM",
        sku: "Merchant Mae Gin",
        display_name: "Merchant Mae Gin 001",
        date: "2024-12-01",
        timezone: "Australia/Brisbane",
        boiler_on_time: "06:30",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Manildra NC96 (Ethanol)", volume_l: 500, abv_percent: 96.0, lal: 480.0 },
            { source: "Filtered Water", volume_l: 500, abv_percent: 0.0, lal: null },
            { source: "Saltwater", volume_l: null, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 55.0, lal: 550.0 }
        },

        botanicals: {
          per_lal_g: 17.3,
          items: [
            { name: "Juniper", prep: "Crushed / steeped", weight_g: 6400, ratio_percent: 67.4 },
            { name: "Coriander", prep: "Steeped", weight_g: 1800, ratio_percent: 19.0 },
            { name: "Angelica", weight_g: 180, ratio_percent: 1.9 },
            { name: "Cassia", weight_g: 0, ratio_percent: 0.0 },
            { name: "Orris Root", weight_g: 50, ratio_percent: 0.5 },
            { name: "Orange", prep: "8 fresh naval orange rind", weight_g: 380, ratio_percent: 4.0 },
            { name: "Lemon", prep: "12 fresh lemon rind", weight_g: 380, ratio_percent: 4.0 },
            { name: "Coconut", weight_g: 0, ratio_percent: 0.0 },
            { name: "Liquorice", prep: "Liquorice root", weight_g: 100, ratio_percent: 1.1 },
            { name: "Cardamon", weight_g: 150, ratio_percent: 1.6 },
            { name: "Lavender", weight_g: 0, ratio_percent: 0.0 },
            { name: "Chamomile", weight_g: 50, ratio_percent: 0.5 },
            { name: "Elderflower", weight_g: 0, ratio_percent: 0.0 },
            { name: "Pepperberry", weight_g: 0, ratio_percent: 0.0 },
            { name: "Mint", weight_g: 0, ratio_percent: 0.0 },
            { name: "Vanilla", weight_g: 0, ratio_percent: 0.0 }
          ],
          steeping_notes: "14 hours steeping with Juniper and Coriander"
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: [
            "Foreshots: 6 × 5750W",
            "Heads: 3 × 5750W + 1 × 2200W",
            "Hearts: 2 × 5750W + 1 × 2200W"
          ],
          observations: []
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Discarded (20L Waste)",
            volume_l: 2.0,
            volume_percent: 0.8,
            abv_percent: 85.2,
            density: 0.829,
            lal: 1.7,
            time_start: "09:30"
          },
          heads: {
            receiving_vessel: "FEINTS-GIN-001 (IBC-01)",
            volume_l: 10.0,
            volume_percent: 3.9,
            abv_percent: 83.0,
            density: 0.839,
            lal: 8.3,
            time_start: "09:50"
          },
          hearts: {
            receiving_vessel: "GIN-NS-0016 (VC-400)",
            volume_l: 242.0,
            abv_percent: 80.9,
            lal: 195.8,
            time_start: "17:00",
            notes: "To dilute add 280 L H₂O"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-001 (IBC-01)",
            volume_l: null,
            volume_percent: 13.0,
            abv_percent: null,
            lal: 0.0
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded (20L Waste)", volume_l: 2.0, volume_percent: 0.8, abv_percent: 85.2, lal: 1.7 },
          { phase: "Heads", receiving_vessel: "FEINTS-GIN-001 (IBC-01)", volume_l: 10.0, volume_percent: 3.9, abv_percent: 83.0, lal: 8.3 },
          { phase: "Hearts", receiving_vessel: "GIN-NS-0016 (VC-400)", volume_l: 242.0, abv_percent: 80.9, lal: 195.8 },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-001 (IBC-01)", volume_percent: 13.0, lal: 0.0 }
        ],

        dilution: {
          instructions_note: "To dilute add 280 L H2O for hearts.",
          steps: [
            {
              step_id: "D1",
              source_volume_l: 242.0,
              water_added_l: 280.0,
              new_volume_l: 522.0,
              target_abv_percent: 37.5,
              lal: null,
              calculation_note: "x litres required overall"
            },
            {
              step_id: "D2",
              source_volume_l: 522.0,
              water_added_l: 0.0,
              new_volume_l: 522.0,
              target_abv_percent: 37.5
            }
          ]
          ,
          combined: {
            final_output_run: {
              new_make_l: null,
              total_volume_l: 522.0,
              lal: null
            }
          }
        },

        

        still_setup: {
          steeping_duration_hours: 14,
          steeped_items: ["Juniper", "Coriander"],
          heating_elements: ["6 × 5750W", "3 × 5750W + 1 × 2200W", "2 × 5750W + 1 × 2200W"],
          condenser_temp_c: null
        },

        attachments: [
          { type: "pdf", label: "Merchant Mae Gin 001.pdf", path: "local:/batches/SPIRIT-GIN-MM-001.pdf" }
        ],

        audit: {
          created_at: "2024-12-01T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-11-03T00:00:00+10:00",
          editable: true
        }
      }
    ],

    "2025-01": [
      {
        batch_id: "SPIRIT-GIN-RF-29",
        product_id: "GIN-RF",
        sku: "Rainforest Gin",
        display_name: "Rainforest Gin 029",
        date: "2025-01-20",
        boiler_on_time: "07:05",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Ethanol Manildra NC96", volume_l: 0.0, abv_percent: null, lal: null },
            { source: "Filtered Water", volume_l: 0.0, abv_percent: 0.0, lal: null },
            { source: "Saltwater", volume_l: 0.0, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 51.0, lal: 510.0 },
          notes: "options cell = 5.2173E+15"
        },

        botanicals: {
          per_lal_g: 18.3,
          items: [
            { name: "Juniper", weight_g: 6360, ratio_percent: 68.1 },
            { name: "Coriander", weight_g: 1410, ratio_percent: 15.1 },
            { name: "Angelica", weight_g: 175, ratio_percent: 1.9 },
            { name: "Cassia", weight_g: 25, ratio_percent: 0.3 },
            { name: "Orris Root", weight_g: null, ratio_percent: null },
            { name: "Lemon Myrtle", weight_g: 141, ratio_percent: 1.5 },
            { name: "Lemon Aspen", weight_g: 71, ratio_percent: 0.8, prep: "TAILS" },
            { name: "Grapefruit", weight_g: 567, ratio_percent: 6.1 },
            { name: "Macadamia", weight_g: 102, ratio_percent: 1.1 },
            { name: "Liquorice", weight_g: 51, ratio_percent: 0.5 },
            { name: "Cardamom", weight_g: 141, ratio_percent: 1.5 },
            { name: "Pepperberry", weight_g: 102, ratio_percent: 1.1 },
            { name: "Vanilla", weight_g: 25, ratio_percent: 0.3 },
            { name: "Mango", weight_g: 176, ratio_percent: 1.9 },
            { name: "Local Fruit", weight_g: null, ratio_percent: null, prep: "multiple 169.7L references" },
            { name: "Coconut", weight_g: null, ratio_percent: null },
            { name: "Chamomile", weight_g: null, ratio_percent: null },
            { name: "Elderflower", weight_g: null, ratio_percent: null },
            { name: "Mint", weight_g: null, ratio_percent: null },
            { name: "Orange", weight_g: null, ratio_percent: null },
            { name: "Lemon", weight_g: null, ratio_percent: null }
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Discarded Bucket",
            volume_l: 2.0,
            abv_percent: 86.0,
            lal: null,
            time_start: "09:30"
          },
          heads: {
            receiving_vessel: "FEINTS-GIN-01 IBC-01",
            volume_l: 12.0,
            abv_percent: 83.0,
            lal: null,
            time_start: "09:45"
          },
          hearts: {
            receiving_vessel: "GIN-RF-0029 VC-400",
            volume_l: 280.0,
            volume_percent: 96.2,
            abv_percent: 82.0,
            lal: 18.0,
            time_start: "17:00"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-01 IBC-01",
            volume_l: 169.7,
            volume_percent: 58.3,
            abv_percent: 75.5,
            lal: null,
            notes: "to be used for something else"
          },
          hearts_segments: [
            { time_start: "17:00", volume_l: 280.0, abv_percent: 82.0, lal: null, notes: "sheet volume % 96.2" }
          ],
          totals_line_from_sheet: {
            declared_total_run_volume_l: 449.7,
            declared_total_run_percent: 0.0,
            notes: "Total Run LAL recorded as 21.0"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded Bucket", volume_l: 0.0, volume_percent: 0.0, abv_percent: 83.0, lal: 0.0 },
          { phase: "Heads", receiving_vessel: "FEINTS-GIN-01 IBC-01", volume_l: 0.0, volume_percent: 0.0, abv_percent: 83.0, lal: 0.0 },
          { phase: "Hearts", receiving_vessel: "GIN-RF-0029 VC-400", volume_l: 280.0, abv_percent: 82.0, lal: 21.0 },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-01 IBC-01", volume_l: 169.7, abv_percent: 75.5, lal: 0.0 }
        ],

        dilution: {
          instructions_note: "x litres required overall",
          steps: [
            { step_id: "D1", source_volume_l: 280.0, water_added_l: 248.0, new_volume_l: 528.0, target_abv_percent: 45.0, lal: 237.6, calculation_note: "x litres required overall" },
            { step_id: "D2", source_volume_l: 528.0, water_added_l: 18.0, new_volume_l: 546.0, target_abv_percent: 42.0, lal: 229.3 },
            { step_id: "D3", source_volume_l: 546.0, water_added_l: 0.0, new_volume_l: null, target_abv_percent: null, lal: null },
            { step_id: "D4", source_volume_l: 546.0, water_added_l: 0.0, new_volume_l: null, target_abv_percent: null, lal: null }
          ],
          combined: {
            final_output_run: { new_make_l: 291.0, total_volume_l: 291.0, lal: 70.1 },
            notes: "x litres required overall"
          }
        },

        still_setup: {
          steeping_duration_hours: 18,
          steeped_items: ["Juniper", "Coriander"],
          heating_elements: [],
          condenser_temp_c: null
        },

        data_integrity: {
          source_sheet_cells_with_errors: ["still_used original: Roberta"],
          fields_with_nulls_due_to_missing_values: [
            "charge.components[0].abv_percent",
            "charge.components[0].lal",
            "charge.components[1].lal",
            "botanicals[4].weight_g",
            "botanicals[13].weight_g",
            "botanicals[14].weight_g",
            "botanicals[15].weight_g",
            "botanicals[16].weight_g",
            "botanicals[17].weight_g",
            "botanicals[18].weight_g",
            "botanicals[19].weight_g",
            "botanicals[20].weight_g",
            "cuts.foreshots.lal",
            "cuts.heads.lal",
            "cuts.hearts_segments[0].lal",
            "cuts.tails.lal",
            "phase_outputs.foreshots.volume_l",
            "phase_outputs.foreshots.lal",
            "phase_outputs.heads.volume_l",
            "phase_outputs.heads.lal",
            "dilution.steps[2].new_volume_l",
            "dilution.steps[2].target_abv_percent",
            "dilution.steps[2].lal",
            "dilution.steps[3].new_volume_l",
            "dilution.steps[3].target_abv_percent",
            "dilution.steps[3].lal"
          ]
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      }
    ],
    "2025-02": [
      {
        batch_id: "SPIRIT-LIQ-002",
        product_id: "ETH-LIQ",
        sku: "Ethanol for Liquors",
        display_name: "Ethanol for Liquors 002",
        date: "2025-02-26",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Early tails from previous distillations", volume_l: 800, abv_percent: 70.0, lal: 560.0 },
            { source: "Filtered Water", volume_l: 200, abv_percent: 0.0, lal: 0.0 },
            { source: "Saltwater", volume_l: null, abv_percent: null, lal: 0.0 }
          ],
          total: { volume_l: 1000, abv_percent: 57.0, lal: 570.0 },
          notes: "Etanol reciclado de varias runs"
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: ["Defleg ligado", "Água circulando", "35A"],
          observations: [
            "Pré-aquecimento do dia anterior → 70°C",
            "Às 6AM → 50°C"
          ]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "20L Waste",
            volume_l: 2.0,
            abv_percent: 90.7,
            density: 0.815,
            lal: 1.8,
            time_start: "08:15",
            notes: "35A"
          },
          heads: {
            receiving_vessel: "20L Waste",
            volume_l: 11.0,
            abv_percent: 88.0,
            density: 0.820,
            lal: 9.7,
            time_start: "08:45",
            notes: "33A"
          },
          hearts: {
            receiving_vessel: "VC-600",
            volume_l: 533.0,
            abv_percent: 85.0,
            density: null,
            lal: null,
            notes: "Middle Run (Total Row) had #REF! in sheet; arrow indicated 533.0 at 85%"
          },
          tails: {
            receiving_vessel: "FEINTS-GIN-000x",
            volume_l: 0.0,
            abv_percent: null,
            lal: 0.0,
            notes: "No tails collected"
          },
          hearts_segments: [
            { time_start: "16:30", volume_l: 289, abv_percent: 84.4, density: null, lal: null, notes: "VC Tank 33A; Back on 07:30AM → 9 to 4PM" },
            { time_start: "07:30 (+1d)", volume_l: 168, abv_percent: 86.0, density: 0.834, lal: 65.4, notes: "VC Tank 26A; Back on 07:30AM → 9 to 3:30PM" },
            { time_start: undefined, volume_l: 76.0, abv_percent: 86.4, density: null, lal: 0.0, notes: "VC Tank 25A" }
          ],
          totals_line_from_sheet: {
            declared_total_run_volume_l: 546.0,
            declared_total_run_percent: 87.4,
            notes: "Total Run (Heads/Hearts) per sheet"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Discarded 20L Waste", volume_l: 2.0, abv_percent: null, lal: 11.5 },
          { phase: "Heads", receiving_vessel: "20L Waste", volume_l: 11.0, abv_percent: null, lal: null },
          { phase: "Hearts", receiving_vessel: "VC-600", volume_l: 533.0, abv_percent: null, lal: null },
          { phase: "Tails", receiving_vessel: "FEINTS-GIN-000x", volume_l: 0.0, abv_percent: null, lal: 0.0 },
          { phase: "Total Run", volume_l: 546.0, abv_percent: 87.4, lal: 0.0 }
        ],

        dilution: {
          instructions_note: "Blocos conforme planilha; manter zeros e #REF!",
          steps: [
            { step_id: "D1", source_volume_l: null, water_added_l: null, new_volume_l: null, target_abv_percent: 59.6, lal: null, calculation_note: "x litres required overall (literal)" },
            { step_id: "D2", source_volume_l: null, water_added_l: null, new_volume_l: null, target_abv_percent: 58.6, lal: null, calculation_note: "literal do PDF" }
          ],
          combined: {
            final_output_run: { new_make_l: 0.0, lal: null, total_volume_l: null },
            notes: "COMBINED 'New Volume' mostra #REF!; manter como nulo"
          }
        },

        still_setup: {
          condenser_temp_c: null
        },

        data_integrity: {
          source_sheet_cells_with_errors: ["#REF!", "#DIV/0!", "#VALUE!", "5747?%"],
          fields_with_nulls_due_to_missing_values: [
            "cuts.hearts.lal",
            "cuts.hearts_segments[0].lal",
            "cuts.tails.abv_percent",
            "phase_outputs.foreshots.abv_percent",
            "phase_outputs.heads.abv_percent",
            "phase_outputs.heads.lal",
            "phase_outputs.hearts.abv_percent",
            "phase_outputs.hearts.lal",
            "dilution.steps[0].water_added_l",
            "dilution.steps[0].new_volume_l",
            "dilution.steps[0].lal",
            "dilution.steps[1].water_added_l",
            "dilution.steps[1].new_volume_l",
            "dilution.steps[1].lal",
            "dilution.combined.final_output_run.total_volume_l",
            "dilution.combined.final_output_run.lal"
          ],
          error_cells: ["#REF!", "#DIV/0!", "5747?%"]
        },

        audit: {
          created_at: "2025-10-28T00:00:00+10:00",
          created_by: "Gabi",
          last_edited_at: "2025-10-28T00:00:00+10:00",
          editable: true
        }
      }
    ],
    "2026-01": [
      {
        batch_id: "VODKA-004",
        product_id: "VODKA-TD",
        sku: "Ethanol for liquors and vodka TRIPLE DISTILLED",
        display_name: "Vodka Triple Distilled 004",
        date: "2026-01-11",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Early tails already distilled (ethanol)", volume_l: 950, abv_percent: 40.0, lal: 380.0 },
            { source: "Filtered Water", volume_l: 0, abv_percent: 0.0, lal: 0.0 },
            { source: "Saltwater", volume_l: 0, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 925.0, abv_percent: 52.5, lal: 485.6 }
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: ["35A"],
          observations: [
            "Warmed up to 70C day before; still at 50C at 6AM",
            "Boiler on at 35A with plates water running and deflegmator on",
            "Foreshots discarded; hearts collected in three parts for vodka blend"
          ]
        },

        cuts: {
          foreshots: {
            volume_l: 2.0,
            abv_percent: 90.0,
            lal: 1.8,
            notes: "Discarded"
          },
          heads: {
            volume_l: null,
            abv_percent: null,
            lal: null,
            notes: "No heads data recorded"
          },
          hearts: {
            volume_l: 363.0,
            abv_percent: 86.0,
            lal: 312.2,
            notes: "Collected across three segments"
          },
          tails: {
            volume_l: 0.0,
            abv_percent: null,
            lal: 0.0,
            notes: "No tails collected"
          },
          hearts_segments: [
            { time_start: "15:00", volume_l: 110, abv_percent: 87.2, lal: 96.0, notes: "Part 1 – 33A" },
            { time_start: "16:30", volume_l: 262, abv_percent: 86.0, lal: 225.3, notes: "Part 2 – 26A (Tank 1)" },
            { time_start: "14:00", volume_l: 101, abv_percent: 85.0, lal: 85.9, notes: "Part 3 – 25A (Tank 2)" }
          ]
        },

        dilution: {
          instructions_note: "Dilution steps captured during blend adjustments",
          steps: [
            {
              step_id: "D1",
              source_volume_l: 288.0,
              water_added_l: 363.0,
              new_volume_l: 651.0,
              target_abv_percent: 38.0,
              lal: null,
              calculation_note: "Recorded on 2025-10-13"
            },
            {
              step_id: "D2",
              source_volume_l: 651.0,
              water_added_l: null,
              new_volume_l: null,
              target_abv_percent: 58.6,
              lal: null,
              calculation_note: "2025-10-14 — added 110 L ethanol @ 96%"
            },
            {
              step_id: "D3",
              source_volume_l: 651.0,
              water_added_l: 168.0,
              new_volume_l: null,
              target_abv_percent: 38.0,
              lal: null,
              calculation_note: "2025-10-14 adjustment"
            }
          ],
          combined: {
            final_output_run: {
              new_make_l: 1700.0,
              total_volume_l: 1700.0,
              lal: 646.0
            },
            notes: "Final blend intended for vodka production"
          }
        },

        data_integrity: {
          source_sheet_cells_with_errors: [],
          fields_with_nulls_due_to_missing_values: [
            "cuts.heads.volume_l",
            "cuts.heads.abv_percent",
            "cuts.heads.lal",
            "cuts.tails.abv_percent",
            "dilution.steps[1].water_added_l",
            "dilution.steps[1].new_volume_l",
            "dilution.steps[1].lal",
            "dilution.steps[2].new_volume_l",
            "dilution.steps[2].lal"
          ]
        },

        audit: {
          created_at: "2026-02-04T00:00:00+10:00",
          created_by: "Cascade",
          last_edited_at: "2026-02-04T00:00:00+10:00",
          editable: true
        }
      },
      {
        batch_id: "SPIRIT-GIN-RF-31",
        product_id: "GIN-RF",
        sku: "Rainforest Gin",
        display_name: "Rainforest Gin SPIRIT-GIN-RF-31",
        date: "2026-01-12",
        boiler_on_time: "06:30",
        still_used: "Carrie",

        charge: {
          components: [
            { source: "Manildra NC96", type: "Ethanol", volume_l: 0, abv_percent: 0.0, lal: 0.0 },
            { source: "Filtered Water", type: "Dilution", volume_l: 0, abv_percent: 0.0, lal: 0.0 },
            { source: "Saltwater", type: "Other", volume_l: 0, abv_percent: 0.0, lal: 0.0 }
          ],
          total: { volume_l: 1000.0, abv_percent: 51.0, lal: 510.0 }
        },

        botanicals: {
          per_lal_g: null,
          items: [
            { name: "Juniper", time: "10:00", notes: "ok", phase: "Heads", volume_l: 14.0, weight_g: 6360, ratio_percent: 36.7, abv_percent: 85.0 },
            { name: "Coriander", notes: "ok", phase: "Middle Run (Hearts)", weight_g: 1410, ratio_percent: 8.1 },
            { name: "Angelica", time: "16:30", notes: "ok", phase: "Middle Run (Hearts)", volume_l: 141.0, weight_g: 175, ratio_percent: 1.0, abv_percent: 79.7, receiving_vessel: "VC-400" },
            { name: "Cassia", notes: "ok", weight_g: 25, ratio_percent: 0.1 },
            { name: "Lemon Myrtle", notes: "ok", phase: "TAILS", volume_l: 220.0, weight_g: 141, ratio_percent: 0.8, abv_percent: 75.6, observations: "Another day distilling the left over; to be used for distilling vodka", receiving_vessel: "IBC-02" },
            { name: "Lemon Aspen", notes: "ok", weight_g: 71, ratio_percent: 0.4, observations: "Distilled until 60%" },
            { name: "Grapefruit", notes: "ok", weight_g: 567, ratio_percent: 3.3 },
            { name: "Macadamia", notes: "ok", weight_g: 102, ratio_percent: 0.6 },
            { name: "Liquorise", notes: "ok", weight_g: 51, ratio_percent: 0.3 },
            { name: "Cardamon", notes: "ok", weight_g: 141, ratio_percent: 0.8 },
            { name: "Pepperberry", weight_g: 102, ratio_percent: 0.6 },
            { name: "Vanilla", notes: "ok", phase: "Foreshots", volume_l: 2.0, weight_g: 25, ratio_percent: 0.1, receiving_vessel: "Buket" },
            { name: "Mango", notes: "ok", phase: "Heads", volume_l: 12.0, weight_g: 176, ratio_percent: 1.0, abv_percent: 83.0, receiving_vessel: "IBC-02" }
          ]
        },

        still_setup: {
          steeping_duration_hours: 18,
          steeped_items: ["Juniper", "Coriander"],
          heating_elements: ["2 new ones"],
          condenser_temp_c: null
        },

        run_summary: {
          condenser_temp_c: null,
          power_settings: [],
          observations: ["Deflegmator reading captured as 5.2173E+15"]
        },

        cuts: {
          foreshots: {
            receiving_vessel: "Buket",
            volume_l: 2.0,
            lal: 0.0
          },
          heads: {
            receiving_vessel: "IBC-02",
            volume_l: 12.0,
            abv_percent: 83.0,
            lal: 0.0
          },
          hearts: {
            receiving_vessel: "VC-400",
            volume_l: 141.0,
            abv_percent: 79.7,
            lal: 21.0
          },
          tails: {
            receiving_vessel: "IBC-02",
            volume_l: 242.0,
            abv_percent: 79.4,
            lal: 0.0,
            notes: "Recorded tails line"
          }
        },

        phase_outputs: [
          { phase: "Foreshots", receiving_vessel: "Buket", volume_l: 2.0, lal: 0.0 },
          { phase: "Heads", receiving_vessel: "IBC-02", volume_l: 12.0, abv_percent: 83.0, lal: 0.0 },
          { phase: "Hearts", receiving_vessel: "VC-400", volume_l: 141.0, abv_percent: 79.7, lal: 21.0 },
          { phase: "Tails", receiving_vessel: "IBC-02", volume_l: 242.0, abv_percent: 79.4, lal: 0.0 }
        ],

        dilution: {
          steps: [
            {
              step_id: "D1",
              step: 1,
              date_added: "2025-08-02",
              filtered_water_l: 259.0,
              new_volume_l: 550.0,
              new_make_l: 291.0,
              abv_percent: null,
              lal: null
            }
          ],
          combined: {
            final_output_run: {
              new_make_l: 291.0,
              total_volume_l: 550.0,
              lal: null
            }
          }
        },

        data_integrity: {
          source_sheet_cells_with_errors: ["still_used original: Roberta"],
          fields_with_nulls_due_to_missing_values: [
            "charge.components[0].volume_l",
            "charge.components[0].abv_percent",
            "charge.components[0].lal",
            "charge.components[1].volume_l",
            "charge.components[1].abv_percent",
            "charge.components[1].lal",
            "charge.components[2].volume_l",
            "charge.components[2].abv_percent",
            "charge.components[2].lal",
            "botanicals.per_lal_g",
            "botanicals.items[0].lal",
            "botanicals.items[0].head_temp_c",
            "botanicals.items[0].ambient_temp_c",
            "botanicals.items[0].condenser_temp_c",
            "botanicals.items[0].receiving_vessel",
            "botanicals.items[0].observations",
            "botanicals.items[1].time",
            "botanicals.items[1].volume_l",
            "botanicals.items[1].abv_percent",
            "botanicals.items[1].lal",
            "botanicals.items[1].head_temp_c",
            "botanicals.items[1].ambient_temp_c",
            "botanicals.items[1].condenser_temp_c",
            "botanicals.items[1].receiving_vessel",
            "botanicals.items[1].observations",
            "botanicals.items[2].lal",
            "botanicals.items[2].head_temp_c",
            "botanicals.items[2].ambient_temp_c",
            "botanicals.items[2].condenser_temp_c",
            "botanicals.items[2].observations",
            "botanicals.items[3].volume_l",
            "botanicals.items[3].abv_percent",
            "botanicals.items[3].lal",
            "botanicals.items[3].head_temp_c",
            "botanicals.items[3].ambient_temp_c",
            "botanicals.items[3].condenser_temp_c",
            "botanicals.items[3].receiving_vessel",
            "botanicals.items[3].observations",
            "botanicals.items[4].lal",
            "botanicals.items[4].head_temp_c",
            "botanicals.items[4].ambient_temp_c",
            "botanicals.items[4].condenser_temp_c",
            "botanicals.items[5].volume_l",
            "botanicals.items[5].abv_percent",
            "botanicals.items[5].lal",
            "botanicals.items[5].head_temp_c",
            "botanicals.items[5].ambient_temp_c",
            "botanicals.items[5].condenser_temp_c",
            "botanicals.items[5].receiving_vessel",
            "botanicals.items[6].volume_l",
            "botanicals.items[6].abv_percent",
            "botanicals.items[6].lal",
            "botanicals.items[6].head_temp_c",
            "botanicals.items[6].ambient_temp_c",
            "botanicals.items[6].condenser_temp_c",
            "botanicals.items[6].receiving_vessel",
            "botanicals.items[6].observations",
            "botanicals.items[7].volume_l",
            "botanicals.items[7].abv_percent",
            "botanicals.items[7].lal",
            "botanicals.items[7].head_temp_c",
            "botanicals.items[7].ambient_temp_c",
            "botanicals.items[7].condenser_temp_c",
            "botanicals.items[7].receiving_vessel",
            "botanicals.items[7].observations",
            "botanicals.items[8].volume_l",
            "botanicals.items[8].abv_percent",
            "botanicals.items[8].lal",
            "botanicals.items[8].head_temp_c",
            "botanicals.items[8].ambient_temp_c",
            "botanicals.items[8].condenser_temp_c",
            "botanicals.items[8].receiving_vessel",
            "botanicals.items[8].observations",
            "botanicals.items[9].volume_l",
            "botanicals.items[9].abv_percent",
            "botanicals.items[9].lal",
            "botanicals.items[9].head_temp_c",
            "botanicals.items[9].ambient_temp_c",
            "botanicals.items[9].condenser_temp_c",
            "botanicals.items[9].receiving_vessel",
            "botanicals.items[9].observations",
            "botanicals.items[10].notes",
            "botanicals.items[10].volume_l",
            "botanicals.items[10].abv_percent",
            "botanicals.items[10].lal",
            "botanicals.items[10].head_temp_c",
            "botanicals.items[10].ambient_temp_c",
            "botanicals.items[10].condenser_temp_c",
            "botanicals.items[10].receiving_vessel",
            "botanicals.items[10].observations",
            "botanicals.items[11].abv_percent",
            "botanicals.items[11].lal",
            "botanicals.items[11].head_temp_c",
            "botanicals.items[11].ambient_temp_c",
            "botanicals.items[11].condenser_temp_c",
            "botanicals.items[11].observations",
            "botanicals.items[12].time",
            "botanicals.items[12].lal",
            "botanicals.items[12].head_temp_c",
            "botanicals.items[12].ambient_temp_c",
            "botanicals.items[12].condenser_temp_c",
            "cuts.foreshots.abv_percent",
            "cuts.foreshots.notes",
            "cuts.heads.lal",
            "cuts.tails.lal",
            "phase_outputs.foreshots.abv_percent",
            "phase_outputs.foreshots.lal",
            "dilution.instructions_note",
            "dilution.steps[0].source_volume_l",
            "dilution.steps[0].abv_percent",
            "dilution.steps[0].lal",
            "dilution.steps[0].notes",
            "dilution.combined.final_output_run.lal"
          ]
        },

        audit: {
          created_at: "2026-02-04T00:00:00+10:00",
          created_by: "Cascade",
          last_edited_at: "2026-02-04T00:00:00+10:00",
          editable: true
        }
      }
    ]
  },

  ui_suggestions: {
    list_view: {
      group_by: "month",
      row_template: "YYYY-MM — {display_name} — {batch_id}",
      secondary_meta: [
        "still_used",
        "date",
        "total_charge.volume_l",
        "cuts.hearts.volume_l",
        "dilution.combined.final_output_run.total_volume_l"
      ],
      sorting: { primary: "date", direction: "desc" }
    },
    batch_card_layout: {
      sections: [
        "Header: product + batch + date + still",
        "Charge: components + total",
        "Botanicals: per LAL + items + prep/phase/time",
        "Run Summary: power + condenser + notes",
        "Cuts (4-column grid): Foreshots | Heads | Hearts | Tails (each shows vessel, L, ABV, LAL, density, notes)",
        "Phase Outputs: normalized table (phase, vessel, L, ABV, LAL)",
        "Dilution: step table + computed final output",
        "Attachments",
        "Audit & Data Integrity"
      ],
      badges: [
        { label: "Hearts", value: "{cuts.hearts.volume_l} L @ {cuts.hearts.abv_percent}%" },
        { label: "Final Output", value: "{dilution.combined.final_output_run.total_volume_l} L" }
      ],
      edit_controls: {
        mode: "mostly_readonly",
        editable_fields: [
          "cuts.*.volume_l",
          "cuts.*.abv_percent",
          "cuts.*.lal",
          "run_summary.condenser_temp_c",
          "dilution.steps.*"
        ],
        lock_after_days: 7
      }
    }
  }
}

export default batchesDataset
