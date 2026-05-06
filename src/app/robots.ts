import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://boxspox.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tutorials", "/paths", "/about", "/careers", "/privacy", "/terms"],
        disallow: ["/admin", "/dashboard", "/settings", "/instructor", "/api/", "/debug"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
