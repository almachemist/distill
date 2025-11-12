import { BatchSchema, type Batch, generateUUID } from '@/types/schema';
import { sanitizeData } from '@/lib/deepMerge';

// Migration utility to convert existing distillation sessions to the new schema
export function migrateDistillationSession(existingSession: any): Batch {
  try {
    // Ensure all arrays have IDs
    const migratedData = {
      spiritRunId: existingSession.id || existingSession.spiritRunId || '',
      sku: existingSession.sku || '',
      description: existingSession.description || null,
      date: existingSession.date || new Date().toISOString().split('T')[0],
      boilerStartTime: existingSession.boilerOn || existingSession.boilerStartTime || null,
      boilerOn: existingSession.boilerOn || null,
      stillUsed: existingSession.still || existingSession.stillUsed || '',
      
      chargeAdjustment: {
        components: (existingSession.charge?.components || []).map((comp: any) => ({
          id: comp.id || generateUUID(),
          source: comp.source || '',
          type: comp.type || 'ethanol',
          volume_L: comp.volume_L || null,
          abv_percent: comp.abv_percent || null,
          lal: comp.lal || null,
          expected_percent: comp.expected_percent || null
        })),
        total: {
          volume_L: existingSession.charge?.total?.volume_L || existingSession.chargeVolumeL || null,
          abv_percent: existingSession.charge?.total?.abv_percent || existingSession.chargeABV || null,
          lal: existingSession.charge?.total?.lal || existingSession.chargeLAL || null
        }
      },
      
      stillSetup: {
        elements: existingSession.stillSetup?.elements || null,
        steeping: existingSession.stillSetup?.steeping || null,
        plates: existingSession.stillSetup?.plates || null,
        options: existingSession.stillSetup?.options || null
      },
      
      botanicals: (existingSession.botanicals || []).map((bot: any) => ({
        id: bot.id || generateUUID(),
        name: bot.name || '',
        notes: bot.notes || null,
        weight_g: bot.weightG || bot.weight_g || null,
        ratio_percent: bot.ratio_percent || null,
        status: bot.status || null
      })),
      
      totalBotanicals_g: existingSession.totalBotanicals_g || null,
      totalBotanicals_percent: existingSession.totalBotanicals_percent || null,
      botanicalsPerLAL: existingSession.botanicalsPerLAL || null,
      
      runData: (existingSession.runData || []).map((run: any) => ({
        id: run.id || generateUUID(),
        time: run.time || null,
        phase: run.phase || '',
        volume_L: run.volume_L || null,
        volume_percent: run.volume_percent || null,
        vcTankVolume_L: run.vcTankVolume_L || null,
        abv_percent: run.abv_percent || null,
        density: run.density || null,
        ambientTemp_C: run.ambientTemp_C || null,
        headTemp_C: run.headTemp_C || null,
        condenserTemp_C: run.condenserTemp_C || null,
        lal: run.lal || null,
        observations: run.observations || null,
        notes: run.notes || null
      })),
      
      totalRun: {
        volume_L: existingSession.totalRun?.volume_L || null,
        volume_percent: existingSession.totalRun?.volume_percent || null,
        abv_percent: existingSession.totalRun?.abv_percent || null,
        lal: existingSession.totalRun?.lal || null,
        notes: existingSession.totalRun?.notes || null
      },
      
      output: (existingSession.outputs || existingSession.output || []).map((out: any) => ({
        id: out.id || generateUUID(),
        phase: out.name || out.phase || '',
        output: out.observations || out.output || '',
        receivingVessel: out.vessel || out.receivingVessel || null,
        volume_L: out.volumeL || out.volume_L || null,
        volume_percent: out.volume_percent || null,
        abv_percent: out.abv || out.abv_percent || null,
        lal: out.lal || null
      })),
      
      dilutions: (existingSession.dilutions || []).map((dil: any) => ({
        id: dil.id || generateUUID(),
        number: dil.number || null,
        date: dil.date || null,
        newMake_L: dil.newMake_L || null,
        filteredWater_L: dil.filteredWater_L || null,
        ethanolAdded: dil.ethanolAdded || null,
        newVolume_L: dil.newVolume_L || null,
        abv_percent: dil.abv_percent || null,
        lal: dil.lal || null,
        finalAbv_percent: dil.finalAbv_percent || null,
        notes: dil.notes || null
      })),
      
      finalOutput: {
        totalVolume_L: existingSession.finalOutput?.totalVolume_L || null,
        abv_percent: existingSession.finalOutput?.finalAbv_percent || existingSession.finalOutput?.abv_percent || null,
        lal: existingSession.finalOutput?.lal || null,
        notes: existingSession.finalOutput?.notes || null
      },
      
      notes: existingSession.notes || null
    };

    // Validate and sanitize the migrated data
    const validatedData = BatchSchema.parse(migratedData);
    const sanitizedData = sanitizeData(validatedData);
    
    return sanitizedData as Batch;
  } catch (error) {
    console.error('Migration error:', error);
    throw new Error(`Failed to migrate session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Batch migration function for multiple sessions
export function migrateAllSessions(sessions: any[]): Batch[] {
  return sessions.map(session => migrateDistillationSession(session));
}

// Test migration with existing sessions
export function testMigration() {
  const testSession = {
    id: 'TEST-SESSION-001',
    sku: 'Test Gin',
    date: '2025-01-01',
    still: 'Carrie',
    chargeVolumeL: 1000,
    chargeABV: 50,
    botanicals: [
      { name: 'Juniper', weightG: 1000, ratio_percent: 50 }
    ],
    runData: [
      { time: '08:00', phase: 'Foreshots', volume_L: 2, abv_percent: 90 }
    ],
    outputs: [
      { name: 'Foreshots', volumeL: 2, abv: 90, vessel: 'Waste' }
    ]
  };

  try {
    const migrated = migrateDistillationSession(testSession);
    console.log('Migration test successful:', migrated);
    return migrated;
  } catch (error) {
    console.error('Migration test failed:', error);
    throw error;
  }
}

