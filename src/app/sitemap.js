import { getAllSlugs } from "@/lib/content";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!baseUrl) {
    console.error("NEXT_PUBLIC_BASE_URL is not defined");
    return [];
  }

  const staticRoutes = ["/"].map((route) => ({
    url: `${baseUrl}${route}`
  }));

  const allPosts = getAllSlugs();

  const posts = allPosts.map(({ slug }) => ({
    url: `${baseUrl}/${slug.join("/")}`
  }));

  const allUrls = [...staticRoutes, ...posts];

  return allUrls;
}
