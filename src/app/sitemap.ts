import type { MetadataRoute } from "next";
import { getArchive } from "@/features/descargas/services/archivo";
import { qualifiedSlugBase } from "@/features/descargas/utils/slug";
import { getProductosFiltrados } from "@/features/tienda/services/products";

const SITE_URL = "https://punkmedallo.com";

const staticRoutes: Array<{
  url: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { url: "", changeFrequency: "weekly", priority: 1 },
  { url: "/descargas", changeFrequency: "weekly", priority: 0.8 },
  { url: "/tienda", changeFrequency: "weekly", priority: 0.8 },
  { url: "/fotos", changeFrequency: "daily", priority: 0.8 },
  { url: "/eventos", changeFrequency: "daily", priority: 0.8 },
  { url: "/about", changeFrequency: "monthly", priority: 0.7 },
  { url: "/amigos", changeFrequency: "monthly", priority: 0.7 },
  { url: "/contacto", changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const archive = await getArchive();
    const albumEntries: MetadataRoute.Sitemap = archive.posts
      .filter((post) => post.id && post.url)
      .map((post) => {
        let pathname = "";
        try {
          pathname = new URL(post.url as string).pathname;
        } catch {
          pathname = "";
        }
        const slug = qualifiedSlugBase(pathname, archive.duplicatedBases);
        if (!slug) return null;
        return {
          url: `${SITE_URL}/descargas/${slug}`,
          lastModified: post.updated ? new Date(post.updated) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    let productEntries: MetadataRoute.Sitemap = [];
    try {
      const productos = await getProductosFiltrados();
      productEntries = productos.map((p) => ({
        url: `${SITE_URL}/tienda/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    } catch {
      productEntries = [];
    }

    return [...entries, ...albumEntries, ...productEntries];
  } catch {
    return entries;
  }
}
