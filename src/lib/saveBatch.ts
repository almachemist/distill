import { BatchSchema, type Batch } from "@/types/schema";
import { deepMerge, sanitizeData } from "@/lib/deepMerge";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (you may need to adjust this based on your setup)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function upsertBatch(batchId: string, incoming: any): Promise<Batch> {
  try {
    // 1) validate + coerce all fields
    const parsed = BatchSchema.parse(incoming) as Batch;

    // 2) pull existing (so we don't lose any detail)
    const { data: existingData, error: fetchError } = await supabase
      .from('distillation_runs')
      .select('*')
      .eq('id', batchId)
      .single();

    const existing = existingData || {};

    // 3) deep merge (arrays reconciled by id)
    const merged = deepMerge(existing, parsed);

    // 4) remove undefined keys (keep nulls!)
    const sanitized = sanitizeData(merged);

    // 5) upsert with Supabase
    const { data, error } = await supabase
      .from('distillation_runs')
      .upsert({
        id: batchId,
        ...sanitized
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save batch: ${error.message}`);
    }

    return data as Batch;
  } catch (error) {
    console.error('Error in upsertBatch:', error);
    throw error;
  }
}

// Alternative function for local storage (for development/testing)
export async function upsertBatchLocal(batchId: string, incoming: any): Promise<Batch> {
  try {
    // 1) validate + coerce all fields
    const parsed = BatchSchema.parse(incoming) as Batch;

    // 2) pull existing from localStorage
    const existingData = localStorage.getItem(`batch_${batchId}`);
    const existing = existingData ? JSON.parse(existingData) : {};

    // 3) deep merge (arrays reconciled by id)
    const merged = deepMerge(existing, parsed);

    // 4) remove undefined keys (keep nulls!)
    const sanitized = sanitizeData(merged);

    // 5) save to localStorage
    localStorage.setItem(`batch_${batchId}`, JSON.stringify(sanitized));

    return sanitized as Batch;
  } catch (error) {
    console.error('Error in upsertBatchLocal:', error);
    throw error;
  }
}

// Function to get a batch by ID
export async function getBatch(batchId: string): Promise<Batch | null> {
  try {
    const { data, error } = await supabase
      .from('distillation_runs')
      .select('*')
      .eq('id', batchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get batch: ${error.message}`);
    }

    return data as Batch;
  } catch (error) {
    console.error('Error in getBatch:', error);
    throw error;
  }
}

// Function to get all batches
export async function getAllBatches(): Promise<Batch[]> {
  try {
    const { data, error } = await supabase
      .from('distillation_runs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to get batches: ${error.message}`);
    }

    return data as Batch[];
  } catch (error) {
    console.error('Error in getAllBatches:', error);
    throw error;
  }
}

