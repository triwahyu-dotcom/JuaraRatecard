import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Credentials missing');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function check() {
  const { data, error } = await supabase.from('quotation').select('id').limit(1);
  if (error) {
    console.log('Error checking quotation table:', error.message);
  } else {
    console.log('Quotation table exists, found', data.length, 'rows');
  }
}
check();
