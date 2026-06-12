import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://pandaschool.in'

  // 1. Fetch all courses
  const { data: courses } = await supabase
    .from('courses')
    .select('slug, created_at')

  // 2. Fetch all learning paths
  const { data: paths } = await supabase
    .from('learning_paths')
    .select('slug, created_at')

  // 3. Fetch all lessons with their course slug
  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      slug, 
      created_at,
      module:modules (
        course:courses (
          slug
        )
      )
    `)

  const courseUrls = (courses || []).map((course: any) => ({
    url: `${baseUrl}/tutorials/${course.slug}`,
    lastModified: new Date(course.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const pathUrls = (paths || []).map((path: any) => ({
    url: `${baseUrl}/paths/${path.slug}`,
    lastModified: new Date(path.created_at || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const lessonUrls = (lessons || []).map((lesson: any) => {
    const courseSlug = lesson.module?.course?.slug || 'unknown';
    return {
      url: `${baseUrl}/tutorials/${courseSlug}/${lesson.slug}`,
      lastModified: new Date(lesson.created_at || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  })

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tutorials`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/playground`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  return [...staticUrls, ...courseUrls, ...pathUrls, ...lessonUrls]
}
