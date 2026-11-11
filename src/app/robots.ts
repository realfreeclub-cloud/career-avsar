import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://careeravsar.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/teacher/dashboard/", "/api/teacher/", "/school/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
