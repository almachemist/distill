import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Load environment variables from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filePath: string) {
  console.log(`\n📄 Reading SQL file: ${filePath}\n`);
  
  const sqlContent = fs.readFileSync(filePath, 'utf-8');
  
  // Split by INSERT statements
  const insertStatements = sqlContent
    .split(/INSERT INTO production_batches/)
    .filter(stmt => stmt.trim().length > 0 && !stmt.startsWith('--'));
  
  console.log(`Found ${insertStatements.length} INSERT statements\n`);
  
  for (let i = 0; i < insertStatements.length; i++) {
    const stmt = 'INSERT INTO production_batches' + insertStatements[i];
    
    // Extract the ID from the statement for logging
    const idMatch = stmt.match(/VALUES \(\s*'([^']+)'/);
    const batchId = idMatch ? idMatch[1] : `Statement ${i + 1}`;
    
    console.log(`⏳ Executing: ${batchId}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
      
      if (error) {
        console.error(`❌ Error inserting ${batchId}:`, error.message);
        
        // Try alternative method: parse and insert via REST API
        console.log(`   Trying alternative method...`);
        
        // Extract values from SQL.
        // Avoid the /s (dotAll) flag so this stays compatible with TS targets < ES2018.
        // Use [\s\S]+ instead of . with /s to match across newlines.
        const valuesMatch = stmt.match(/VALUES \(\s*'([^']+)',\s*'([\s\S]+)',\s*'([^']+)',\s*'([^']+)'\s*\)/);
        
        if (valuesMatch) {
          const [, id, dataJson, type, still] = valuesMatch;
          
          // Parse the JSON (it's escaped in the SQL)
          const data = JSON.parse(dataJson);
          
          const { error: insertError } = await supabase
            .from('production_batches')
            .insert({
              id,
              data,
              type,
              still
            });
          
          if (insertError) {
            console.error(`   ❌ Alternative method also failed:`, insertError.message);
          } else {
            console.log(`   ✅ Success via alternative method!`);
          }
        }
      } else {
        console.log(`✅ Success: ${batchId}`);
      }
    } catch (err: any) {
      console.error(`❌ Exception for ${batchId}:`, err.message);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ Finished processing all statements!\n`);
}

// Execute
const sqlFile = process.argv[2] || 'temp/all_oaks_kitchen.sql';
executeSQLFile(sqlFile).catch(console.error);

