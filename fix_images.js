const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixImages() {
  const badUrl = 'https://images.unsplash.com/photo-1614064641913-a53b516ebc51?w=800&q=80';
  const goodUrl = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';

  console.log("Checking courses...");
  const { data: courses, error: err1 } = await supabase.from('courses').select('id, image_url');
  if (courses) {
    for (const c of courses) {
      if (c.image_url && c.image_url.includes('1614064641913')) {
        console.log(`Updating course ${c.id}`);
        await supabase.from('courses').update({ image_url: c.image_url.replace(/1614064641913-a53b516ebc51/g, '1517694712202-14dd9538aa97') }).eq('id', c.id);
      }
    }
  }

  console.log("Checking learning_paths...");
  const { data: paths, error: err2 } = await supabase.from('learning_paths').select('id, image_url');
  if (paths) {
    for (const p of paths) {
      if (p.image_url && p.image_url.includes('1614064641913')) {
        console.log(`Updating learning_path ${p.id}`);
        await supabase.from('learning_paths').update({ image_url: p.image_url.replace(/1614064641913-a53b516ebc51/g, '1517694712202-14dd9538aa97') }).eq('id', p.id);
      }
    }
  }
  
  console.log("Checking projects...");
  const { data: projects, error: err3 } = await supabase.from('projects').select('id, image_url');
  if (projects) {
    for (const p of projects) {
      if (p.image_url && p.image_url.includes('1614064641913')) {
        console.log(`Updating project ${p.id}`);
        await supabase.from('projects').update({ image_url: p.image_url.replace(/1614064641913-a53b516ebc51/g, '1517694712202-14dd9538aa97') }).eq('id', p.id);
      }
    }
  }
  
  console.log("Checking articles...");
  const { data: articles, error: err4 } = await supabase.from('articles').select('id, image_url');
  if (articles) {
    for (const a of articles) {
      if (a.image_url && a.image_url.includes('1614064641913')) {
        console.log(`Updating article ${a.id}`);
        await supabase.from('articles').update({ image_url: a.image_url.replace(/1614064641913-a53b516ebc51/g, '1517694712202-14dd9538aa97') }).eq('id', a.id);
      }
    }
  }

  console.log("Done checking common tables for broken image.");
}

fixImages();
