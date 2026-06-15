const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Using rpc or direct postgres isn't easy with supabase-js unless we use a function.
  // Wait, I can just use pg client!
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  try {
    await client.query("ALTER TABLE public.exams ADD COLUMN randomize_questions BOOLEAN DEFAULT false;");
    console.log("Added column successfully");
  } catch (e) {
    if (e.code === '42701') console.log("Column already exists");
    else console.error("Error:", e);
  } finally {
    await client.end();
  }
}
main();
