import axios from "axios";
import type { BlogInfo, BloggerRawPost } from "../types";

const API_KEY = process.env.BLOGGER_API_KEY;
const BLOG_ID = process.env.BLOG_ID;
const BASE_URL = "https://www.googleapis.com/blogger/v3";

function assertConfig(): void {
  if (!API_KEY || !BLOG_ID) {
    throw new Error("Blogger config missing (BLOG_ID or BLOGGER_API_KEY)");
  }
}

export interface ListPostsParams {
  pageToken?: string | null;
  q?: string | null;
  orderBy?: "published" | "updated";
  maxResults?: number;
  fetchBodies?: boolean;
  fields?: string;
}

export async function getBlogInfo(): Promise<BlogInfo> {
  assertConfig();
  const { data } = await axios.get(`${BASE_URL}/blogs/${BLOG_ID}`, {
    params: { key: API_KEY },
    timeout: 15_000,
  });
  return {
    id: data.id,
    name: data.name ?? "Punk Medallo",
    description: data.description ?? "",
    url: data.url,
    totalPosts: data.posts?.totalItems ?? 0,
  };
}

export async function listPosts(
  params: ListPostsParams = {}
): Promise<{ items: BloggerRawPost[]; nextPageToken: string | null }> {
  assertConfig();
  const query: Record<string, unknown> = { key: API_KEY };
  if (params.pageToken) query.pageToken = params.pageToken;
  if (params.q) query.q = params.q;
  if (params.orderBy) query.orderBy = params.orderBy;
  query.maxResults = params.maxResults ?? 25;
  if (params.fetchBodies === false) query.fetchBodies = "false";
  if (params.fields) query.fields = params.fields;
  const { data } = await axios.get(`${BASE_URL}/blogs/${BLOG_ID}/posts`, {
    params: query,
    timeout: 15_000,
  });
  return {
    items: (data.items ?? []) as BloggerRawPost[],
    nextPageToken: data.nextPageToken ?? null,
  };
}

export async function searchPosts(
  q: string,
  maxResults = 25
): Promise<BloggerRawPost[]> {
  assertConfig();
  const { data } = await axios.get(
    `${BASE_URL}/blogs/${BLOG_ID}/posts/search`,
    {
      params: { key: API_KEY, q, maxResults },
      timeout: 15_000,
    }
  );
  return (data.items ?? []) as BloggerRawPost[];
}

export async function getPostById(id: string): Promise<BloggerRawPost> {
  assertConfig();
  const { data } = await axios.get(
    `${BASE_URL}/blogs/${BLOG_ID}/posts/${id}`,
    { params: { key: API_KEY }, timeout: 15_000 }
  );
  return data as BloggerRawPost;
}

const ARCHIVE_FIELDS =
  "items(id,title,url,labels,published,updated,replies(totalItems)),nextPageToken";

let archiveCache: { fetchedAt: number; posts: BloggerRawPost[] } | null = null;
const ARCHIVE_TTL_MS = 60 * 60 * 1000;

export async function getAllPostsLight(
  force = false
): Promise<BloggerRawPost[]> {
  assertConfig();
  if (
    !force &&
    archiveCache &&
    Date.now() - archiveCache.fetchedAt < ARCHIVE_TTL_MS
  ) {
    return archiveCache.posts;
  }
  const posts: BloggerRawPost[] = [];
  let pageToken: string | null = null;
  do {
    const { items, nextPageToken } = await listPosts({
      pageToken,
      maxResults: 200,
      fetchBodies: false,
      fields: ARCHIVE_FIELDS,
    });
    posts.push(...items);
    pageToken = nextPageToken;
  } while (pageToken);
  archiveCache = { fetchedAt: Date.now(), posts };
  return posts;
}
