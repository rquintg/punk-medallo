import type { BandInfo, BloggerRawPost } from "../types";
import { getAllPostsLight } from "./blogger";
import {
  firstLetter,
  normalizeBand,
  postSlugFromPath,
  qualifiedSlugBase,
} from "../utils/slug";
import { resolveBandFromMeta } from "../utils/album";

export interface ArchiveMeta {
  posts: BloggerRawPost[];
  slugMap: Map<string, { postId: string; index: number }>;
  bands: BandInfo[];
  totalPosts: number;
  duplicatedBases: Set<string>;
}

export interface SlugResolution {
  postId: string;
  index: number;
}

export function resolveSlug(
  slug: string,
  slugMap: Map<string, SlugResolution>
): SlugResolution | null {
  const exact = slugMap.get(slug);
  if (exact) return exact;
  const suffix = slug.match(/^(.*)-(\d+)$/);
  if (suffix) {
    const base = slugMap.get(suffix[1]);
    if (base) return { postId: base.postId, index: Number(suffix[2]) - 1 };
  }
  return null;
}

function postUrlPathname(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

function buildDuplicatedBases(posts: BloggerRawPost[]): Set<string> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (!post.url) continue;
    const pathname = postUrlPathname(post.url);
    if (!pathname) continue;
    const base = postSlugFromPath(pathname);
    if (base) counts.set(base, (counts.get(base) ?? 0) + 1);
  }
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([base]) => base)
  );
}

function buildSlugMap(
  posts: BloggerRawPost[],
  duplicatedBases: Set<string>
): Map<string, SlugResolution> {
  const map = new Map<string, SlugResolution>();
  for (const post of posts) {
    if (!post.id || !post.url) continue;
    const pathname = postUrlPathname(post.url);
    if (!pathname) continue;
    const slug = qualifiedSlugBase(pathname, duplicatedBases);
    if (slug && !map.has(slug)) {
      map.set(slug, { postId: post.id, index: 0 });
    }
  }
  return map;
}

function buildBands(posts: BloggerRawPost[]): BandInfo[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const post of posts) {
    const name = resolveBandFromMeta(post).replace(/\s+/g, " ").trim();
    const key = normalizeBand(name);
    if (!key) continue;
    const entry = counts.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      counts.set(key, { name, count: 1 });
    }
  }
  return [...counts.values()]
    .map((entry) => ({
      name: entry.name,
      normalized: normalizeBand(entry.name),
      count: entry.count,
      letter: firstLetter(entry.name),
    }))
    .sort((a, b) => a.normalized.localeCompare(b.normalized));
}

let archiveCache: { fetchedAt: number; meta: ArchiveMeta } | null = null;
const ARCHIVE_TTL_MS = 60 * 60 * 1000;

export async function getArchive(force = false): Promise<ArchiveMeta> {
  if (!force && archiveCache && Date.now() - archiveCache.fetchedAt < ARCHIVE_TTL_MS) {
    return archiveCache.meta;
  }
  const posts = await getAllPostsLight(force);
  const duplicatedBases = buildDuplicatedBases(posts);
  const meta: ArchiveMeta = {
    posts,
    slugMap: buildSlugMap(posts, duplicatedBases),
    bands: buildBands(posts),
    totalPosts: posts.length,
    duplicatedBases,
  };
  archiveCache = { fetchedAt: Date.now(), meta };
  return meta;
}
