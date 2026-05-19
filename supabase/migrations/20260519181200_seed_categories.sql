-- Insert Domains
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('💻 Technology', 'technology', 'Explore 💻 Technology courses'),
  ('🤖 AI & Data Science', 'ai-and-data-science', 'Explore 🤖 AI & Data Science courses'),
  ('📊 MBA & Business', 'mba-and-business', 'Explore 📊 MBA & Business courses'),
  ('⚖️ Law & Legal', 'law-and-legal', 'Explore ⚖️ Law & Legal courses'),
  ('🌾 Agriculture', 'agriculture', 'Explore 🌾 Agriculture courses'),
  ('🏥 Healthcare', 'healthcare', 'Explore 🏥 Healthcare courses'),
  ('📐 Engineering', 'engineering', 'Explore 📐 Engineering courses'),
  ('🎨 Design & Creative', 'design-and-creative', 'Explore 🎨 Design & Creative courses')
ON CONFLICT (slug) DO NOTHING;

-- Update Courses
UPDATE public.courses
SET category_id = cat.id, category_name = cat.name
FROM public.categories cat
WHERE 
  (courses.category IN ('HTML and CSS', 'HTML', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'MongoDB') AND cat.slug = 'technology') OR
  (courses.category IN ('AI', 'Machine Learning', 'Data Science') AND cat.slug = 'ai-and-data-science') OR
  (courses.category IN ('Marketing', 'Finance') AND cat.slug = 'mba-and-business') OR
  (courses.category IN ('Law') AND cat.slug = 'law-and-legal') OR
  (courses.category IN ('Agriculture') AND cat.slug = 'agriculture') OR
  (courses.category IN ('Healthcare') AND cat.slug = 'healthcare') OR
  (courses.category IN ('Engineering') AND cat.slug = 'engineering') OR
  (courses.category IN ('Design', 'UI/UX Design') AND cat.slug = 'design-and-creative');
  
-- Fallback for any unmapped courses
UPDATE public.courses
SET category_id = cat.id, category_name = cat.name
FROM public.categories cat
WHERE courses.category_id IS NULL AND cat.slug = 'technology';
