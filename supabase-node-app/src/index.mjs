const { createClient } = require('@supabase/supabase-js');
import { supabase } from './supabaseClient.mjs';

const main = async () => {
  // Example of fetching data from a Supabase table
  const { data, error } = await supabase
    .from('your_table_name')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error);
  } else {
    console.log('Data fetched:', data);
  }
};

main();