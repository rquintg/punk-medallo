import type { MetadataRoute } from "next";
import { getArchive } from "@/features/descargas/services/archivo";
import { getPostById } from "@/features/descargas/services/blogger";
import { parsePostToAlbums } from "@/features/descargas/utils/parse-content";
import { qualifiedSlugBase } from "@/features/descargas/utils/slug";
import { bandSlug } from "@/features/descargas/utils/album";
import { getProductosFiltrados } from "@/features/tienda/services/products";
import { getCategorias } from "@/features/tienda/services/categorias";

const SITE_URL = "https://punkmedallo.com";

const staticRoutes: Array<{
  url: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { url: "", changeFrequency: "weekly", priority: 1 },
  { url: "/descargas", changeFrequency: "weekly", priority: 0.8 },
  { url: "/tienda", changeFrequency: "weekly", priority: 0.8 },
  { url: "/tienda/ofertas", changeFrequency: "weekly", priority: 0.7 },
  { url: "/fotos", changeFrequency: "daily", priority: 0.8 },
  { url: "/eventos", changeFrequency: "daily", priority: 0.8 },
  { url: "/about", changeFrequency: "monthly", priority: 0.7 },
  { url: "/amigos", changeFrequency: "monthly", priority: 0.7 },
  { url: "/contacto", changeFrequency: "monthly", priority: 0.7 },
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let albumEntries: MetadataRoute.Sitemap = [];
  try {
    const archive = await getArchive();
    const seenSlugs = new Set<string>();
    const pushAlbum = (slug: string, post: { updated?: string | null }) => {
      if (seenSlugs.has(slug)) return;
      seenSlugs.add(slug);
      albumEntries.push({
        url: `${SITE_URL}/descargas/${slug}`,
        lastModified: post.updated ? new Date(post.updated) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      });
    };
    for (const post of archive.posts) {
      if (!post.id || !post.url) continue;
      let pathname = "";
      try {
        pathname = new URL(post.url as string).pathname;
      } catch {
        pathname = "";
      }
      const base = qualifiedSlugBase(pathname, archive.duplicatedBases);
      if (!base) continue;
      try {
        const full = await getPostById(post.id);
        const albums = parsePostToAlbums(full, archive.duplicatedBases);
        const slugs = albums.length > 0 ? albums.map((a) => a.slug) : [base];
        for (const slug of slugs) pushAlbum(slug, post);
      } catch {
        pushAlbum(base, post);
      }
    }
  } catch {
    albumEntries = [];
  }

  let bandEntries: MetadataRoute.Sitemap = [];
  try {
    const archive = await getArchive();
    const seenSlugs = new Set<string>();
    bandEntries = archive.bands
      .map((band) => bandSlug(band.name))
      .filter((slug) => {
        if (seenSlugs.has(slug)) return false;
        seenSlugs.add(slug);
        return true;
      })
      .map((slug) => ({
        url: `${SITE_URL}/descargas/banda/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.4,
      }));
  } catch {
    bandEntries = [];
  }

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const productos = await getProductosFiltrados();
    productEntries = productos.map((p) => {
      const t = new Date(p.fechaCreacion);
      return {
        url: `${SITE_URL}/tienda/${p.slug}`,
        lastModified: Number.isNaN(t.getTime()) ? new Date() : t,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      };
    });
  } catch {
    productEntries = [];
  }

  let categoriaEntries: MetadataRoute.Sitemap = [];
  try {
    const categorias = await getCategorias();
    categoriaEntries = categorias.map((c) => ({
      url: `${SITE_URL}/tienda/categoria/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    categoriaEntries = [];
  }

  return [...entries, ...albumEntries, ...bandEntries, ...productEntries, ...categoriaEntries];
}
