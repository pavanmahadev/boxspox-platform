-- Fix category_name: Data Analytics courses belong to AI & Data Science
UPDATE public.courses
SET 
  category_name = '🤖 AI & Data Science',
  category_id = (SELECT id FROM public.categories WHERE slug = 'ai-and-data-science' LIMIT 1)
WHERE category = 'Data Analytics';

-- Also fix case-insensitive matches for Technology
UPDATE public.courses
SET 
  category_name = '💻 Technology',
  category_id = (SELECT id FROM public.categories WHERE slug = 'technology' LIMIT 1)
WHERE category ILIKE ANY(ARRAY['javascript','typescript','python','sql','node-js','backend','frameworks','web fundamentals','html and css','html','css','react','git']);
