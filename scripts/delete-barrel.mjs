import { createClient } from '@supabase/supabase-js';

async function main() {
  const [idArg] = process.argv.slice(2);
  if (!idArg) {
    console.error('Usage: node scripts/delete-barrel.mjs <barrel-id>');
    process.exit(1);
  }
  const id = idArg;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(2);
  }
  const sb = createClient(url, key);
  const candidates = [
    process.env.NEXT_PUBLIC_BARRELS_TABLE,
    'tracking',
    'barrels',
    'barrel_tracking',
    'barrels_tracking',
  ].filter(Boolean);
  const keys = ['id', 'barrel_id', 'barrel_number'];
  for (const tbl of candidates) {
    for (const key of keys) {
      const { error } = await sb.from(tbl).delete().eq(key, id);
      if (!error) {
        console.log(`Deleted barrel ${id} from ${tbl} using key ${key}`);
        process.exit(0);
      }
    }
  }
  console.error(`Failed to delete barrel ${id}: not found in any table`);
  process.exit(3);
}

main().catch((e) => {
  console.error(e?.message || String(e));
  process.exit(1);
});

