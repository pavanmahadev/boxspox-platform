import { createClient } from "@/utils/supabase/server";
import { MetadataRoute } from "next";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://boxspox.com";

  // Fetch all published courses
  const { data: courses } = await supabase
    .from("courses")
    .select("slug, created_at")
    .eq("status", "published");

  // Fetch all published learning paths
  const { data: paths } = await supabase
    .from("learning_paths")
    .select("slug, created_at")
    .eq("status", "published");

  const courseUrls: MetadataRoute.Sitemap = (courses || []).map((c) => ({
    url: `${BASE_URL}/tutorials/${c.slug}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const pathUrls: MetadataRoute.Sitemap = (paths || []).map((p) => ({
    url: `${BASE_URL}/paths/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/tutorials`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/paths`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/careers`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.4 },
  ];

  return [...staticUrls, ...courseUrls, ...pathUrls];
}
