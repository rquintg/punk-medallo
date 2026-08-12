import axios from "axios";
import type {
  ComentarioFacebook,
  FotoFacebook,
  PaginaComentarios,
  PaginaFotos,
  VideoFacebook,
} from "@/features/fotos/types";
import { interaccion } from "@/features/fotos/types";

// Server-only helpers for fetching photos/videos from the Facebook Graph API.
// Uses server env vars (do NOT use NEXT_PUBLIC_ for tokens).

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const GRAPH_BASE = "https://graph.facebook.com/v24.0";
const FACEBOOK_WEB = "https://www.facebook.com";

interface HasNext {
  paging?: { cursors?: { after?: string } };
}

function nextCursor(data: HasNext): string | null {
  return data.paging?.cursors?.after ?? null;
}

function ensureConfig(): void {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error(
      "Facebook configuration is missing (FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN)."
    );
  }
}

function permalinkAbs(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${FACEBOOK_WEB}${url.startsWith("/") ? "" : "/"}${url}`;
}

// IMPORTANTE: comments.summary NO puede ir junto con likes en el listado —
// la Graph API excluye silenciosamente fotos con alta interacción (verificado:
// con solo likes = 100 items incl. posts de 2095 likes; con likes+comments la
// lista baja a ~37 items y esos posts desaparecen). Los comentarios se obtienen
// aparte por id (fetchFacebookPageComentarios) en el lightbox.
const META_FIELDS = "likes.summary(true){id}";

function parseMeta(node: {
  likes?: { summary?: { total_count?: number } };
  comments?: { summary?: { total_count?: number } };
}): { likeCount?: number; commentCount?: number } {
  const likeCount = node.likes?.summary?.total_count;
  const commentCount = node.comments?.summary?.total_count;
  return {
    ...(typeof likeCount === "number" ? { likeCount } : {}),
    ...(typeof commentCount === "number" ? { commentCount } : {}),
  };
}

interface FotoNode {
  id: string;
  images?: { source?: string; width?: number; height?: number }[];
  name?: string;
  alt_text?: string;
  created_time?: string;
  link?: string;
  width?: number;
  height?: number;
  likes?: { summary?: { total_count?: number } };
  comments?: { summary?: { total_count?: number } };
}

interface VideoNode {
  id: string;
  picture?: string;
  description?: string;
  created_time?: string;
  permalink_url?: string;
  length?: number;
  likes?: { summary?: { total_count?: number } };
  comments?: { summary?: { total_count?: number } };
}

interface ComentarioNode {
  id?: string;
  message?: string;
  created_time?: string;
  from?: { name?: string };
}

interface ComentariosNode {
  data?: ComentarioNode[];
  summary?: { total_count?: number };
}

export async function fetchFacebookPagePhotos(
  opts: { after?: string | null; limit?: number } = {}
): Promise<{ fotos: FotoFacebook[]; next: string | null }> {
  ensureConfig();
  const limit = opts.limit ?? 24;

  const { data } = await axios.get(`${GRAPH_BASE}/${PAGE_ID}/photos`, {
    params: {
      type: "uploaded",
      fields: `id,images,name,alt_text,created_time,link,width,height,${META_FIELDS}`,
      access_token: ACCESS_TOKEN,
      limit,
      ...(opts.after ? { after: opts.after } : {}),
    },
  });

  const fotos: FotoFacebook[] = (data?.data ?? []).flatMap((node: FotoNode) => {
    const srcs = (node.images ?? [])
      .filter((img) => img.source && img.width)
      .map((img) => ({
        source: img.source as string,
        width: img.width as number,
        height: img.height ?? 0,
      }))
      .sort((a, b) => a.width - b.width);

    if (srcs.length === 0) return [];

    return [
      {
        id: node.id,
        srcs,
        name: node.name,
        altText: node.alt_text,
        createdAt: node.created_time ?? "",
        link: node.link ?? "",
        width: node.width ?? srcs[srcs.length - 1].width,
        height: node.height ?? srcs[srcs.length - 1].height,
        ...parseMeta(node),
      },
    ];
  });

  return { fotos, next: nextCursor(data) };
}

export async function fetchFacebookPageVideos(
  opts: { after?: string | null; limit?: number } = {}
): Promise<{ videos: VideoFacebook[]; next: string | null }> {
  ensureConfig();

  const { data } = await axios.get(`${GRAPH_BASE}/${PAGE_ID}/videos`, {
    params: {
      fields: `id,picture,description,created_time,permalink_url,length,${META_FIELDS}`,
      access_token: ACCESS_TOKEN,
      limit: opts.limit ?? 24,
      ...(opts.after ? { after: opts.after } : {}),
    },
  });

  const videos: VideoFacebook[] = (data?.data ?? [])
    .filter((node: VideoNode) => node.picture)
    .map((node: VideoNode) => ({
      id: node.id,
      thumbnail: node.picture as string,
      description: node.description,
      createdAt: node.created_time ?? "",
      link: permalinkAbs(node.permalink_url ?? ""),
      durationSec: node.length,
      ...parseMeta(node),
    }));

  return { videos, next: nextCursor(data) };
}

export async function fetchFacebookPage(
  tipo: "fotos" | "videos",
  opts: { after?: string | null; limit?: number } = {}
): Promise<PaginaFotos> {
  if (tipo === "fotos") {
    const { fotos, next } = await fetchFacebookPagePhotos(opts);
    return { items: fotos, next };
  }
  const { videos, next } = await fetchFacebookPageVideos(opts);
  return { items: videos, next };
}

export async function fetchFacebookPageTop(
  opts: { limit?: number; maxPaginas?: number } = {}
): Promise<(FotoFacebook | VideoFacebook)[]> {
  ensureConfig();
  const limite = opts.limit ?? 6;
  const maxPaginas = opts.maxPaginas ?? 3;
  const porPagina = 50;

  const recoger = async (
    tipo: "fotos" | "videos"
  ): Promise<(FotoFacebook | VideoFacebook)[]> => {
    const acumulados: (FotoFacebook | VideoFacebook)[] = [];
    let after: string | null = null;
    for (let i = 0; i < maxPaginas; i++) {
      try {
        const page = await fetchFacebookPage(tipo, {
          after,
          limit: porPagina,
        });
        acumulados.push(...page.items);
        if (!page.next) break;
        after = page.next;
      } catch (error) {
        // Rate limiting or transient error: keep what we have
        console.warn(`fetchFacebookPageTop: ${tipo} pag ${i + 1} falló`, error);
        break;
      }
    }
    return acumulados;
  };

  // Secuencial: evita rate limiting al golpear la Graph API con llamadas paralelas
  const fotos = await recoger("fotos");
  const videos = await recoger("videos");

  const conInteraccion = (item: FotoFacebook | VideoFacebook) =>
    item.likeCount !== undefined || item.commentCount !== undefined;

  const topFotos = fotos
    .filter(conInteraccion)
    .sort((a, b) => interaccion(b) - interaccion(a))
    .slice(0, Math.ceil(limite / 2));

  const topVideos = videos
    .filter(conInteraccion)
    .sort((a, b) => interaccion(b) - interaccion(a))
    .slice(0, Math.ceil(limite / 2));

  // Intercalar fotos y videos para variedad visual en la fila
  const mezclados: (FotoFacebook | VideoFacebook)[] = [];
  const max = Math.max(topFotos.length, topVideos.length);
  for (let i = 0; i < max; i++) {
    if (i < topFotos.length) mezclados.push(topFotos[i]);
    if (i < topVideos.length) mezclados.push(topVideos[i]);
  }

  return mezclados.slice(0, limite);
}

export async function fetchFacebookPageComentarios(
  id: string
): Promise<PaginaComentarios> {
  ensureConfig();
  if (!/^\d+$/.test(id)) return { total: 0, items: [] };

  const { data } = await axios.get(`${GRAPH_BASE}/${id}`, {
    params: {
      fields:
        "comments.limit(3).summary(true).order(reverse_chronological){id,message,created_time,from{name}}",
      access_token: ACCESS_TOKEN,
    },
    timeout: 15_000,
  });

  const comentarios: ComentariosNode | undefined = data?.comments;
  const total = comentarios?.summary?.total_count ?? 0;

  const items: ComentarioFacebook[] = (comentarios?.data ?? [])
    .filter((node) => node.message || node.id)
    .map((node) => ({
      id: node.id ?? "",
      message: node.message,
      createdAt: node.created_time ?? "",
      autor: node.from?.name ?? "Anónimo",
    }));

  return { total, items };
}

export interface StatsArchivo {
  totalFotos: number;
  totalVideos: number;
  minYear: number | null;
  maxYear: number | null;
  ultimaPublicacion: string | null;
}

function anioAUnix(inicioDeAnio: number): number {
  return Date.UTC(inicioDeAnio, 0, 1) / 1000;
}

// La Graph API lanza 500s transitorios con frecuencia; cada GET se reintenta con
// backoff antes de considerarlo un fallo real (dato de los walks de stats).
async function getConReintento<T>(
  url: string,
  params: Record<string, unknown>,
  intentos = 2
): Promise<T> {
  let ultimoError: unknown;
  for (let i = 0; i < intentos; i++) {
    try {
      const { data } = await axios.get<T>(url, { params, timeout: 15_000 });
      return data;
    } catch (error) {
      ultimoError = error;
      if (i < intentos - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (i + 1)));
      }
    }
  }
  throw ultimoError;
}

async function conteoFotos(): Promise<{ total: number; ultima: string | null }> {
  const data = await getConReintento<{
    photos?: { summary?: { total_count?: number }; data?: { created_time?: string }[] };
  }>(`${GRAPH_BASE}/${PAGE_ID}`, {
    fields: "photos.type(uploaded).limit(1).summary(true)",
    access_token: ACCESS_TOKEN,
  });
  const total = data?.photos?.summary?.total_count ?? 0;
  const ultima = data?.photos?.data?.[0]?.created_time ?? null;
  return { total, ultima };
}

// El edge de `photos` no expone ningún resto (limite 100 por request) y el
// orden no es estrictamente cronológico, así que para el año más antiguo se
// busca con probes `since/until` (binsearch: ~4-5 llamadas livianas con limit=1).
async function hayFotosAntesDe(anio: number): Promise<boolean> {
  const data = await getConReintento<{ data?: { id?: string }[] }>(
    `${GRAPH_BASE}/${PAGE_ID}/photos`,
    {
      type: "uploaded",
      since: 0,
      until: anioAUnix(anio),
      limit: 1,
      fields: "id",
      access_token: ACCESS_TOKEN,
    }
  );
  return (data?.data?.length ?? 0) > 0;
}

async function minAnioFotos(totalFotos: number): Promise<number | null> {
  if (totalFotos <= 0) return null;
  // Invariante: hayFotosAntesDe(lo) === false, hayFotosAntesDe(hi) === true.
  let lo = 2012;
  let hi = 2027;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (await hayFotosAntesDe(mid)) hi = mid;
    else lo = mid;
  }
  return lo;
}

// El edge de `videos` NO expone summary y falla al paginar rangos densos
// (~100+ ítems seguidos: error 500 o "reduce the amount of data"), por eso se
// recorre por rangos since/until fijos diseñados para caber en 1 request cada
// uno (≤100 ítems). Si un rango falla tras el reintento básico se omite con
// warn: el total siempre es la suma de lo contado (sin recursión ni
// reintentos globales).
interface WalkVideos {
  total: number;
  min: string | null;
  max: string | null;
}

async function videosPorAnio(): Promise<WalkVideos> {
  const anioActual = new Date().getUTCFullYear();
  const H1 = 15_552_000; // 180 días
  const Q1 = Math.floor(91.5 * 86_400); // ~abril 1 (límite estable, < 100 ítems)

  // Rangos diseñados para caber en 1 request cada uno (≤100 ítems), evitando
  // la paginación con `after`, que es lo que la Graph API falla con 500s en
  // rangos densos ("reduce the amount of data": 2025-H1 tenía 129 ítems y se
  // partió en 2 sub-rangos; así confirmado contra la API hoy). El rango que
  // termina en "ahora" (semestre en curso) es el único sensible a fallos si no
  // es el PRIMER request del edge, por eso va primero; después los rangos con
  // límites históricos fijos (nunca fallan). El `until` se FLOOREA: la API
  // rechaza con 400 un unixtime con decimales. Los semestres del año en curso
  // y el previo se derivan de `anioActual`.
  const rangos: [number, number][] = [
    [anioAUnix(anioActual) + H1, Math.floor(Date.now() / 1000)],
    [anioAUnix(2012), anioAUnix(2019)],
    [anioAUnix(2019), anioAUnix(2020)],
    [anioAUnix(2020), anioAUnix(2021)],
    [anioAUnix(2021), anioAUnix(2022)],
    [anioAUnix(2022), anioAUnix(2023)],
    [anioAUnix(2023), anioAUnix(2024)],
    [anioAUnix(2024), anioAUnix(2025)],
    [anioAUnix(2025), anioAUnix(2025) + Q1],
    [anioAUnix(2025) + Q1, anioAUnix(2025) + H1],
    [anioAUnix(anioActual - 1) + H1, anioAUnix(anioActual)],
    [anioAUnix(anioActual), anioAUnix(anioActual) + H1],
  ];

  let total = 0;
  let min: string | null = null;
  let max: string | null = null;

  // Pacing leve entre rangos: la Graph API responde cuando los requests van
  // espaciados; el primer rango (hasta "ahora") es el más sensible.
  for (let i = 0; i < rangos.length; i++) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 800));
    const [desde, hasta] = rangos[i];
    try {
      const data = await getConReintento<HasNext & { data?: { created_time?: string }[] }>(
        `${GRAPH_BASE}/${PAGE_ID}/videos`,
        {
          fields: "id,created_time",
          limit: 100,
          since: desde,
          until: hasta,
          access_token: ACCESS_TOKEN,
        }
      );
      const items: { created_time?: string }[] = data.data ?? [];
      total += items.length;
      for (const item of items) {
        if (!item.created_time) continue;
        if (!min || item.created_time < min) min = item.created_time;
        if (!max || item.created_time > max) max = item.created_time;
      }
    } catch (error) {
      // Rango fallido (ya reintentado 2x): se omite; el total queda como suma
      // de lo contado.
      console.warn(`videosPorAnio: rango [${desde}..${hasta}] falló; se omite`, error);
    }
  }

  return { total, min, max };
}

export async function fetchFacebookArchivoStats(): Promise<StatsArchivo> {
  ensureConfig();

  const { total: totalFotos, ultima: ultimaFoto } = await conteoFotos();
  const minFoto = await minAnioFotos(totalFotos);

  // El edge de videos es intermitente solo bajo ráfagas de requests de la
  // sesión de debug; con la caché de 24h se consulta 1x/día. Si algún rango
  // falló, videosPorAnio ya devolvió el parcial: la página siempre muestra un
  // conteo real (nunca lanzamos para no degradar a datos fantasmas).
  const videos = await videosPorAnio();

  const minYear = minFoto && videos.min ? Math.min(minFoto, Number(videos.min.slice(0, 4))) : (minFoto ?? (videos.min ? Number(videos.min.slice(0, 4)) : null));
  const maxCreated = [ultimaFoto, videos.max]
    .filter((f): f is string => Boolean(f))
    .sort()
    .at(-1);
  const maxYear = maxCreated ? Number(maxCreated.slice(0, 4)) : null;

  return {
    totalFotos,
    totalVideos: videos.total,
    minYear,
    maxYear,
    ultimaPublicacion: maxCreated ?? null,
  };
}