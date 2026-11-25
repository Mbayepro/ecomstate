import type { MetadataRoute } from "next";
import { INITIAL_STORES } from "@/lib/seed-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "https://ecomstate.vercel.app";

  const staticRoutes = [
    "",
    "/tarifs",
    "/fonctionnalites",
    "/comment-ca-marche",
    "/a-propos",
    "/faq",
    "/contact",
    "/creer-une-boutique",
    "/connexion",
    "/confidentialite",
    "/cgu",
    "/conditions-commerciales",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const storeRoutes = INITIAL_STORES.map((s) => ({
    url: `${baseUrl}/s/${s.slug}`,
    lastModified: new Date(s.createdAt),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...storeRoutes];
}
