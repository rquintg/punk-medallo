import type {
  Album,
  AlbumFormat,
  BloggerRawPost,
  DownloadLink,
} from "../types";
import {
  cleanBandLabel,
  detectFormatFromTitle,
  resolveBand,
  stripYear,
  upgradeCoverResolution,
  withoutBandPrefix,
} from "./album";
import { normalizeBand, qualifiedSlugBase } from "./slug";

const EMPTY_DUPLICATED_BASES: ReadonlySet<string> = new Set();

const ANCHOR_RE = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;  
const IMG_RE = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
const YEAR_RE = /\(?\b(19|20)\d{2}\b\)?/;
const TRACK_MARKER_RE = /track\s*list|lista\s*de\s*(?:canciones|temas)/i;
const DOWNLOAD_CTA_RE = /\bdescargar\b|download|(?:https?:\/\/)?\S*mega\.\S*/i;
const TRACK_NUMBER_START_RE = /^\d{1,2}(?:\s*[.)\-–—]|\s)/;
const TRACK_NUMBER_SPLIT_RE = /(?=\d{1,2}\s*[.)\-–—])/;
const SEPARATOR_ONLY_RE = /^[.·•\-–—_~=*]+$/;
const RECENT_DAYS = 30;

const DOWNLOAD_HOSTS = [
  "mediafire.com",
  "userscloud.com",
  "mega.nz",
  "mega.co",
  "mega.io",
  "ul.to",
  "zippyshare",
  "rapidshare",
  "4shared",
  "depositfiles",
  "hotfile",
  "yandex",
  "googledrive",
  "drive.google",
  "krakenfiles",
  "gofile.io",
  "adf.ly",
  "sh.st",
  "skydrive.live.com",
  "soundcloud.com",
  "megaupload.com",
  "msplinks.com",
];

const DOWNLOAD_LABEL_RE = /descargar|download|mega/i;

interface AnchorMatch {
  href: string;
  label: string;
  start: number;
  end: number;
  wrapsImage: boolean;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCodePoint(Number(num)));
}

function stripTags(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, "\n");
}

function isSelfHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes("blogger")) return true;
    if (hostname.endsWith(".blogspot.com")) return true;
    if (hostname === "google.com" || hostname.endsWith(".google.com")) return true;
    return false;
  } catch {
    return true;
  }
}

function isChromeAnchor(anchor: AnchorMatch): boolean {
  return isSelfHost(anchor.href) || anchor.wrapsImage;
}

function isDownloadAnchor(anchor: AnchorMatch): boolean {
  if (isChromeAnchor(anchor)) return false;
  if (DOWNLOAD_HOSTS.some((host) => anchor.href.includes(host))) return true;
  return DOWNLOAD_LABEL_RE.test(anchor.label);
}

function findAnchors(content: string): AnchorMatch[] {
  const anchors: AnchorMatch[] = [];
  let match: RegExpExecArray | null;
  ANCHOR_RE.lastIndex = 0;
  while ((match = ANCHOR_RE.exec(content)) !== null) {
    const href = decodeEntities(match[1]).trim();
    if (!href || href.startsWith("#")) continue;
    const label = decodeEntities(stripTags(match[2])).replace(/\s+/g, " ").trim();
    anchors.push({
      href,
      label,
      start: match.index,
      end: match.index + match[0].length,
      wrapsImage: /<img/i.test(match[2]),
    });
  }
  return anchors;
}

const BLOGGER_HOSTS = ["googleusercontent.com", "bp.blogspot.com"];

const EXTERNAL_ALLOWED_HOSTS = ["i.imgur.com", "f4.bcbits.com", "www.mediafire.com"];

function isBloggerHost(src: string): boolean {
  return BLOGGER_HOSTS.some((host) => src.includes(host));
}

function isAllowedExternalHost(src: string): boolean {
  return EXTERNAL_ALLOWED_HOSTS.some((host) => src.includes(host));
}

function extractCover(html: string): string | null {
  const sources: string[] = [];
  let match: RegExpExecArray | null;
  IMG_RE.lastIndex = 0;
  while ((match = IMG_RE.exec(html)) !== null) {
    const src = decodeEntities(match[1]).trim();
    if (src) sources.push(src);
  }
  const cover =
    sources.find((src) => isBloggerHost(src)) ??
    sources.find((src) => isAllowedExternalHost(src)) ??
    null;
  if (!cover) return null;
  return cover.replace(/^http:\/\//, "https://");
}

function cleanTrackLine(line: string): string | null {
  const cleaned = line
    .replace(/^\d{1,2}\s*[.)\-–—]?\s*/, "")
    .replace(/^[·•*>\s]+/, "")
    .trim();
  if (!cleaned) return null;
  if (/^(descargar|download)$/i.test(cleaned)) return null;
  if (SEPARATOR_ONLY_RE.test(cleaned)) return null;
  if (cleaned.length > 120) return null;
  return cleaned;
}

function splitNumberedLine(line: string): string[] {
  const trimmed = line.trim();
  if (!TRACK_NUMBER_START_RE.test(trimmed)) return [line];
  const pieces = trimmed.split(TRACK_NUMBER_SPLIT_RE).filter(Boolean);
  return pieces.length > 1 ? pieces : [line];
}

function extractTrackList(text: string): string[] {
  const marker = text.search(TRACK_MARKER_RE);
  const regionStart = marker === -1 ? 0 : marker;
  const region = text.slice(regionStart);
  const cut = region.search(DOWNLOAD_CTA_RE);
  const body = cut === -1 ? region : region.slice(0, cut);
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const tracks: string[] = [];
  let started = false;
  for (const line of lines) {
    if (TRACK_MARKER_RE.test(line)) continue;
    const isNumbered = TRACK_NUMBER_START_RE.test(line);
    if (marker !== -1) {
      if (!isNumbered && !started) continue;
      for (const piece of splitNumberedLine(line)) {
        const cleaned = cleanTrackLine(piece);
        if (cleaned) {
          tracks.push(cleaned);
          started = true;
        }
      }
    } else if (isNumbered) {
      for (const piece of splitNumberedLine(line)) {
        const cleaned = cleanTrackLine(piece);
        if (cleaned) tracks.push(cleaned);
      }
    }
  }
  return tracks;
}

function extractYear(text: string, postTitle: string): string | null {
  const match = `${postTitle} ${text}`.match(YEAR_RE);
  return match ? match[0].replace(/[()]/g, "") : null;
}

function detectFormat(segmentText: string, postTitle: string): AlbumFormat {
  const marker = segmentText.search(TRACK_MARKER_RE);
  const pre = marker === -1 ? segmentText : segmentText.slice(0, marker);
  return detectFormatFromTitle(`${pre} ${postTitle}`.trim());
}

function resolveTitle(
  segmentText: string,
  post: BloggerRawPost,
  band: string,
  isMulti: boolean
): string {
  const postTitle = (post.title ?? "").trim();
  if (!isMulti && normalizeBand(postTitle) === normalizeBand(band)) {
    return postTitle;
  }
  const marker = segmentText.search(TRACK_MARKER_RE);
  const pre = (marker === -1 ? segmentText : segmentText.slice(0, marker))
    .trim();
  const candidate = pre
    .split("\n")
    .map((line) => line.trim())
    .find(
      (line) =>
        line.length > 2 &&
        line.length <= 150 &&
        !/^(img|image|separator)$/i.test(line) &&
        !/^\d{1,2}\s*[.)\-–—]/.test(line) &&
        !/^track\s*list\s*:?/i.test(line) &&
        !/^(descargar|download|leer\s+más)(\s|$)/i.test(line)
    );

  const derived = stripYear(withoutBandPrefix(postTitle, band))
    .split(/\s+[-–—]\s+/)
    .pop() ?? "";
  if (derived.length >= 2 && normalizeBand(derived) !== normalizeBand(band)) {
    return derived;
  }
  if (candidate) {
    const withoutYear = stripYear(candidate);
    if (withoutYear.length >= 3) return withoutYear;
  }
  return postTitle;
}

function isRecentPublished(published: string): boolean {
  if (!published) return false;
  const timestamp = new Date(published).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp < RECENT_DAYS * 24 * 60 * 60 * 1000;
}

function parseSegment(
  segmentHtml: string,
  post: BloggerRawPost,
  index: number,
  isMulti: boolean,
  slugBase: string
): Album {
  const anchors = findAnchors(segmentHtml);
  const textWithLines = decodeEntities(stripTags(segmentHtml));
  const text = textWithLines.replace(/\s+/g, " ").trim();

  let format = detectFormat(text, post.title ?? "");
  if ((post.labels?.length ?? 0) > 1 && format !== "discografia") {
    format = "compilado";
  }
  const band = cleanBandLabel(resolveBand(post, format));
  const title = resolveTitle(textWithLines, post, band, isMulti);
  const year = extractYear(text, post.title ?? "");
  const coverUrl = upgradeCoverResolution(extractCover(segmentHtml));
  const trackList = extractTrackList(textWithLines);

  const downloadLinks: DownloadLink[] = anchors
    .filter((anchor) => !isChromeAnchor(anchor))
    .map((anchor) => {
      let hostname = "link";
      try {
        hostname = new URL(anchor.href).hostname.replace(/^www\./, "");
      } catch {
        hostname = "link";
      }
      return {
        label: anchor.label || "Descargar",
        url: anchor.href,
        host: hostname,
      };
    });

  const slug = index === 0 ? slugBase : `${slugBase}-${index + 1}`;

  return {
    postId: post.id,
    index,
    slug,
    band,
    title,
    year,
    coverUrl,
    trackList,
    downloadLinks,
    format,
    published: post.published ?? "",
    updated: post.updated ?? post.published ?? "",
    postUrl: post.url ?? "",
    commentCount: Number(post.replies?.totalItems ?? 0),
    isRecent: isRecentPublished(post.published ?? ""),
  };
}

export function parsePostToAlbums(
  post: BloggerRawPost,
  duplicatedBases: ReadonlySet<string> = EMPTY_DUPLICATED_BASES
): Album[] {
  const content = post.content ?? "";
  const anchors = findAnchors(content);
  const downloadAnchors = anchors.filter((anchor) => isDownloadAnchor(anchor));

  let pathname = "";
  try {
    pathname = new URL(post.url ?? "").pathname;
  } catch {
    pathname = "";
  }
  const slugBase = qualifiedSlugBase(pathname, duplicatedBases) || post.id;

  let segments: string[] = [];
  if (downloadAnchors.length === 0) {
    segments = [content];
  } else {
    let cursor = 0;
    for (const anchor of downloadAnchors) {
      segments.push(content.slice(cursor, anchor.end));
      cursor = anchor.end;
    }
    if (cursor < content.length) {
      segments[segments.length - 1] += content.slice(cursor);
    }
  }

  const isMulti = segments.length > 1;
  return segments.map((segment, index) =>
    parseSegment(segment, post, index, isMulti, slugBase)
  );
}
