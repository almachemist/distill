import { z } from "zod";

// Simple UUID generator (fallback if uuid package not available)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Coerce strings like "81.8" or "81.8%" → 81.8
const num = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[%\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}, z.number().nullable());

export const RunDataSchema = z.object({
  id: z.string().optional(), // add on client
  time: z.string().nullable().default(null),
  phase: z.string(),
  volume_L: num,
  volume_percent: num,
  vcTankVolume_L: num,
  abv_percent: num,
  density: num,
  ambientTemp_C: num,
  headTemp_C: num,
  condenserTemp_C: num,
  lal: num,
  observations: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
});

export const OutputSchema = z.object({
  id: z.string().optional(),
  phase: z.string(),
  output: z.string(),
  receivingVessel: z.string().nullable().default(null),
  volume_L: num,
  volume_percent: num,
  abv_percent: num,
  lal: num,
});

export const DilutionSchema = z.object({
  id: z.string().optional(),
  number: z.union([z.string(), z.number()]).nullable().default(null),
  date: z.string().nullable().default(null),
  newMake_L: num,
  filteredWater_L: num,
  ethanolAdded: z.string().nullable().default(null),
  newVolume_L: num,
  abv_percent: num,
  lal: num,
  finalAbv_percent: num,
  notes: z.string().nullable().default(null),
});

export const BotanicalSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  notes: z.string().nullable().default(null),
  weight_g: num,
  ratio_percent: num,
  status: z.string().nullable().default(null),
});

export const ComponentSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  type: z.enum(["ethanol","dilution","water","other"]).or(z.string()),
  volume_L: num,
  abv_percent: num,
  lal: num,
  expected_percent: num,
});

export const ChargeSchema = z.object({
  components: z.array(ComponentSchema),
  total: z.object({
    volume_L: num,
    abv_percent: num,
    lal: num,
  })
});

export const StillSetupSchema = z.object({
  elements: z.string().nullable().default(null),
  steeping: z.string().nullable().default(null),
  plates: z.string().nullable().default(null),
  options: z.string().nullable().default(null),
});

export const BatchSchema = z.object({
  spiritRunId: z.string(),
  sku: z.string(),
  description: z.string().nullable().default(null),
  date: z.string(),
  boilerStartTime: z.string().nullable().default(null),
  boilerOn: z.string().nullable().default(null),
  stillUsed: z.string(),

  chargeAdjustment: ChargeSchema,
  stillSetup: StillSetupSchema,

  botanicals: z.array(BotanicalSchema).default([]),
  totalBotanicals_g: num,
  totalBotanicals_percent: num,
  botanicalsPerLAL: num,

  runData: z.array(RunDataSchema).default([]),
  totalRun: z.object({
    volume_L: num,
    volume_percent: num,
    abv_percent: num,
    lal: num,
    notes: z.string().nullable().default(null),
  }).partial(),

  output: z.array(OutputSchema).default([]),

  dilutions: z.array(DilutionSchema).default([]),

  finalOutput: z.object({
    totalVolume_L: num,
    abv_percent: num,
    lal: num,
    notes: z.string().nullable().default(null),
  }).partial(),

  notes: z.string().nullable().default(null),
});

export type Batch = z.infer<typeof BatchSchema>;

// Export UUID generator
export { generateUUID };

