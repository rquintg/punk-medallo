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
  // Normalize items to ensure UI has required fields (title, content)
  const rawItems = res.data.items || [];

  type RawItem = {
    id?: string;
    title?: string;
    published?: string;
    content?: string;
    url?: string;
  };

  const posts = rawItems
    .map((item: RawItem) => ({
      id: item.id || "",
      title: item.title || "Sin título",
      published: item.published,
      content: item.content || "",
      url: item.url,
    }))
    .sort((a: { published?: string }, b: { published?: string }) => {
      const ta = a.published ? new Date(a.published).getTime() : 0;
      const tb = b.published ? new Date(b.published).getTime() : 0;
      return tb - ta;
    });

  return {
    items: posts,
    nextPageToken: res.data.nextPageToken || null,
  };
};
