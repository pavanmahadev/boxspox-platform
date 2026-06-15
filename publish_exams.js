const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function publish() {
  const { data, error } = await supabase.from('exams').update({ is_published: true }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) console.error(error);
  else console.log('Exams published successfully!');
}

publish();
