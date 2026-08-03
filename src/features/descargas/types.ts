export type AlbumFormat =
  | "album"
  | "ep"
  | "demo"
  | "discografia"
  | "compilado"
  | "split"
  | "en_vivo";

export type OrderBy = "published" | "updated";

export interface DownloadLink {
  label: string;
  url: string;
  host: string;
}

export interface Album {
  postId: string;
  index: number;
  slug: string;
  band: string;
  title: string;
  year: string | null;
  coverUrl: string | null;
  trackList: string[];
  downloadLinks: DownloadLink[];
  format: AlbumFormat;
  published: string;
  updated: string;
  postUrl: string;
  commentCount: number;
  isRecent: boolean;
}

export interface AlbumsPage {
  albums: Album[];
  nextPageToken: string | null;
  totalItems: number | null;
  query: string | null;
}

export interface BandInfo {
  name: string;
  normalized: string;
  count: number;
  letter: string;
}

export interface BlogInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  totalPosts: number;
}

export interface BloggerRawPost {
  id: string;
  title?: string;
  published?: string;
  updated?: string;
  content?: string;
  url?: string;
  labels?: string[];
  author?: {
    displayName?: string;
    image?: { url?: string };
  };
  replies?: {
    totalItems?: string;
  };
}
