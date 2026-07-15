import type { MetadataRoute } from "next";

const SITE_URL = "https://punkmedallo.com";

const routes: Array<{
  url: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { url: "", changeFrequency: "weekly", priority: 1 },
  { url: "/descargas", changeFrequency: "weekly", priority: 0.8 },
  { url: "/fotos", changeFrequency: "daily", priority: 0.8 },
  { url: "/eventos", changeFrequency: "daily", priority: 0.8 },
  { url: "/about", changeFrequency: "monthly", priority: 0.7 },
  { url: "/amigos", changeFrequency: "monthly", priority: 0.7 },
  { url: "/contacto", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
