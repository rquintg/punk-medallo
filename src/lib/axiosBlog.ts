import axios from "axios";

// Server-only helper for Blogger API. Use server env vars (do NOT expose API key).
const API_KEY = process.env.BLOGGER_API_KEY;
const BLOG_ID = process.env.BLOG_ID;
const MAX_RESULTS = 4;

export type BlogPost = {
  id: string;
  title?: string;
  published?: string;
  content?: string;
  url?: string;
};

export const fetchBlogPosts = async (pageToken: string | null = null) => {
  if (!API_KEY || !BLOG_ID) {
    throw new Error("Blogger configuration is missing (BLOG_ID or BLOGGER_API_KEY).");
  }

  let url = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}&maxResults=${MAX_RESULTS}`;
  if (pageToken) url += `&pageToken=${pageToken}`;
  const res = await axios.get(url);

  const items = (res.data.items || []).sort(
    (a: { published: string }, b: { published: string }) =>
      new Date(b.published).getTime() - new Date(a.published).getTime()
  );
  return {
    items,
    nextPageToken: res.data.nextPageToken || null,
  };
};

export const searchBlogPosts = async (query: string) => {
  if (!API_KEY || !BLOG_ID) {
    throw new Error("Blogger configuration is missing (BLOG_ID or BLOGGER_API_KEY).");
  }

  let url = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/search?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&maxResults=${MAX_RESULTS}`;
  const res = await axios.get(url);

  const items = (res.data.items || []).sort(
    (a: { published: string }, b: { published: string }) =>
      new Date(b.published).getTime() - new Date(a.published).getTime()
  );
  return {
    items,
    nextPageToken: res.data.nextPageToken || null,
  };
};
