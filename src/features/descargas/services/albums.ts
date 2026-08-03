import type {
  Album,
  AlbumFormat,
  AlbumsPage,
  BloggerRawPost,
  OrderBy,
} from "../types";
import { getArchive, resolveSlug } from "./archivo";
import { getPostById, listPosts } from "./blogger";
import { parsePostToAlbums } from "../utils/parse-content";
import {
  detectFormatFromTitle,
  resolveBandFromMeta,
} from "../utils/album";
import { normalizeBand, normalizeSearch } from "../utils/slug";

const DEFAULT_PAGE_SIZE = 12;
const FILTERED_PAGE_SIZE = 24;

function sortByPublishedDesc(posts: BloggerRawPost[]): BloggerRawPost[] {
  return [...posts].sort((a, b) => {
    const ta = a.published ? new Date(a.published).getTime() : 0;
    const tb = b.published ? new Date(b.published).getTime() : 0;
    return tb - ta;
  });
}

function sortByUpdatedDesc(posts: BloggerRawPost[]): BloggerRawPost[] {
  return [...posts].sort((a, b) => {
    const ta = a.updated ? new Date(a.updated).getTime() : 0;
    const tb = b.updated ? new Date(b.updated).getTime() : 0;
    return tb - ta;
  });
}

function matchesLocal(post: BloggerRawPost, needle: string): boolean {
  const haystack = normalizeSearch(
    [post.title, ...(post.labels ?? [])].join(" ")
  );
  return haystack.includes(needle);
}

export interface AlbumsParams {
  pageToken?: string | null;
  q?: string | null;
  orderBy?: OrderBy;
  limit?: number;
  letra?: string | null;
  formato?: string | null;
  banda?: string | null;
  year?: string | null;
}

export async function getAlbumsPage(
  params: AlbumsParams
): Promise<AlbumsPage> {
  const hasFilters =
    Boolean(params.q?.trim()) ||
    Boolean(params.letra) ||
    Boolean(params.formato) ||
    Boolean(params.banda) ||
    Boolean(params.year);

  if (hasFilters) return filterAlbums(params);

  const [page, archive] = await Promise.all([
    listPosts({
      pageToken: params.pageToken,
      orderBy: params.orderBy,
      maxResults: params.limit ?? DEFAULT_PAGE_SIZE,
    }),
    getArchive(),
  ]);
  const { items, nextPageToken } = page;
  const albums = items.flatMap((post) =>
    parsePostToAlbums(post, archive.duplicatedBases)
  );
  return {
    albums,
    nextPageToken,
    totalItems: null,
    query: null,
  };
}

async function filterAlbums(params: AlbumsParams): Promise<AlbumsPage> {
  const archive = await getArchive();
  const needle = params.q ? normalizeSearch(params.q) : null;
  const letter = params.letra?.trim().toLowerCase();
  const format = params.formato as AlbumFormat | undefined;
  const band = params.banda?.trim();

  const ids: string[] = [];
  for (const post of archive.posts) {
    if (!post.id) continue;
    if (needle && !matchesLocal(post, needle)) continue;
    if (letter) {
      const bandName = resolveBandFromMeta(post);
      if (!normalizeBand(bandName).startsWith(letter)) continue;
    }
    if (format && detectFormatFromTitle(post.title ?? "") !== format) {
      continue;
    }
    if (band && normalizeBand(resolveBandFromMeta(post)) !== normalizeBand(band)) {
      continue;
    }
    ids.push(post.id);
  }

  const candidates = params.year ? ids : ids.slice(0, FILTERED_PAGE_SIZE * 2);

  const posts = (
    await Promise.all(
      candidates.map((id) => getPostById(id).catch(() => null))
    )
  ).filter((post): post is BloggerRawPost => post !== null);

  const ordered =
    params.orderBy === "updated"
      ? sortByUpdatedDesc(posts)
      : sortByPublishedDesc(posts);

  let albums = ordered.flatMap((post) =>
    parsePostToAlbums(post, archive.duplicatedBases)
  );
  if (params.year) {
    albums = albums.filter((album) => album.year === params.year);
  }
  albums = albums.slice(0, FILTERED_PAGE_SIZE);

  return {
    albums,
    nextPageToken: null,
    totalItems: albums.length,
    query: params.q ?? null,
  };
}

const YEAR_IN_TITLE_RE = /\((19|20)\d{2}\)/;

export async function getArchiveYears(): Promise<string[]> {
  const archive = await getArchive();
  const years = new Set<string>();
  for (const post of archive.posts) {
    const match = (post.title ?? "").match(YEAR_IN_TITLE_RE);
    if (match) years.add(match[0].replace(/[()]/g, ""));
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const archive = await getArchive();
  const resolution = resolveSlug(slug, archive.slugMap);
  if (!resolution) return null;

  const post = await getPostById(resolution.postId);
  const albums = parsePostToAlbums(post, archive.duplicatedBases);
  return albums[resolution.index] ?? null;
}

export async function getRelatedAlbums(
  band: string,
  excludePostId: string,
  limit = 4
): Promise<Album[]> {
  const archive = await getArchive();
  const needle = normalizeSearch(band);
  const candidates = archive.posts.filter(
    (post) =>
      post.id !== excludePostId &&
      normalizeSearch(post.labels?.join(" ") ?? "").includes(needle)
  );

  const results: Album[] = [];
  for (const post of candidates.slice(0, limit)) {
    try {
      const postWithContent = await getPostById(post.id);
      const albums = parsePostToAlbums(
        postWithContent,
        archive.duplicatedBases
      );
      if (albums.length > 0) results.push(albums[0]);
    } catch {
      continue;
    }
  }
  return results;
}
