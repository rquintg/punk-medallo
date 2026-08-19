import { getArchive, resolveSlug } from "../src/features/descargas/services/archivo";
import { getPostById } from "../src/features/descargas/services/blogger";
import { parsePostToAlbums } from "../src/features/descargas/utils/parse-content";
import { RESENAS } from "../src/data/resenas";

const TODOS = process.argv.includes("--todos");
const UA = "Mozilla/5.0 (compatible; PunkMedalloLinkCheck/1.0)";
const UA_BROWSER =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Clase = "OK" | "MUERTO" | "BLOQUEADO" | "ERROR";

interface CheckResult {
  ok: boolean;
  status: number;
  finalUrl: string;
  hostFinal: string;
  error?: string;
}

async function checkUrl(url: string, browser: boolean): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
      headers: {
        Range: "bytes=0-1023",
        "User-Agent": browser ? UA_BROWSER : UA,
        ...(browser
          ? { Referer: "https://punk-medallo.blogspot.com/", Accept: "text/html,*/*" }
          : {}),
      },
      redirect: "follow",
      signal: controller.signal,
    });
    let hostFinal = "";
    try {
      hostFinal = new URL(res.url).hostname;
    } catch {}
    return {
      ok: res.status === 200 || res.status === 206,
      status: res.status,
      finalUrl: res.url,
      hostFinal,
    };
  } catch (e) {
    const r: CheckResult = {
      ok: false,
      status: 0,
      finalUrl: url,
      hostFinal: "",
      error: e instanceof Error ? (e.name === "AbortError" ? "timeout" : e.name) : String(e),
    };
    try {
      r.hostFinal = new URL(url).hostname;
    } catch {}
    return r;
  } finally {
    clearTimeout(timer);
  }
}

const cache = new Map<string, { clase: Clase; r: CheckResult }>();

async function checkCached(url: string): Promise<{ clase: Clase; r: CheckResult }> {
  const hit = cache.get(url);
  if (hit) return hit;
  let r = await checkUrl(url, false);
  if (!r.ok) {
    await sleep(500);
    const r2 = await checkUrl(url, true);
    if (r2.ok || r2.status > 0) r = r2;
  }
  let clase: Clase = "OK";
  if (r.ok) clase = "OK";
  else if (r.status === 404 || r.status === 410) clase = "MUERTO";
  else if (r.status === 403) {
    clase =
      r.hostFinal.includes("send.now") || r.hostFinal.includes("userscloud") ? "MUERTO" : "BLOQUEADO";
  } else if (r.status > 0) clase = "ERROR";
  else clase = "ERROR";
  ref.push({ url, clase, r });
  cache.set(url, { clase, r });
  return { clase, r };
}

interface Fallido {
  slug: string;
  banda: string;
  label: string;
  url: string;
  clase: Clase;
  status: number;
  host: string;
  hostFinal: string;
  motivo: string;
}

const ref: { url: string; clase: Clase; r: CheckResult }[] = [];

function motivoDe(clase: Clase, r: CheckResult): string {
  if (clase === "MUERTO") {
    if (r.hostFinal.includes("send.now")) return "migró a send.now y da 404";
    if (r.status === 410) return "410 Gone";
    return "404 no existe";
  }
  if (clase === "BLOQUEADO") return "403 bloquea bots (verificar a mano)";
  if (r.status > 0) return `HTTP ${r.status}`;
  return r.error ?? "error de red";
}

async function verificarAlbums(
  albums: { slug: string; band: string; title: string; year?: string | null; downloadLinks: { label: string; url: string; host?: string }[] }[],
  fallidos: Fallido[],
  stats: { albums: number; ocurrencias: number; ok: number; sinLinks: number },
) {
  for (const album of albums) {
    const links = album.downloadLinks.filter((l) => l.url.startsWith("http"));
    stats.albums += 1;
    if (links.length === 0) {
      stats.sinLinks += 1;
      continue;
    }
    const rotos: string[] = [];
    for (const link of links) {
      stats.ocurrencias += 1;
      const { clase, r } = await checkCached(link.url);
      let host = link.host ?? "";
      try {
        host = host || new URL(link.url).hostname;
      } catch {}
      if (clase !== "OK") {
        fallidos.push({
          slug: album.slug,
          banda: album.band,
          label: link.label,
          url: link.url,
          clase,
          status: r.status,
          host: host.replace(/^www\./, ""),
          hostFinal: r.hostFinal.replace(/^www\./, ""),
          motivo: motivoDe(clase, r),
        });
        rotos.push(`  [${clase}] ${r.status} ${host} -> ${r.hostFinal} ${r.error ?? ""}`);
      } else {
        stats.ok += 1;
      }
      await sleep(150);
    }
    if (rotos.length) {
      console.log(`== ${album.slug} | ${album.band} ${album.year ?? ""} | ${links.length} links | FALLIDOS ${rotos.length}`);
      rotos.forEach((c) => console.log(c));
    }
  }
}

async function main() {
  const archive = await getArchive();
  const fallidos: Fallido[] = [];
  const stats = { albums: 0, ocurrencias: 0, ok: 0, sinLinks: 0 };
  const hosts = new Map<string, number>();

  interface AlbumConSlug {
    postId: string;
    slug: string;
    albums: ReturnType<typeof parsePostToAlbums>;
  }
  let list: AlbumConSlug[] = [];
  if (TODOS) {
    const pendientes: { postId: string; slug: string }[] = [];
    for (const p of archive.posts) {
      if (!p.id || !p.url) continue;
      let path = "";
      try {
        path = new URL(p.url).pathname;
      } catch {}
      if (!path) continue;
      pendientes.push({ postId: p.id, slug: path.replace(/\/+/g, "").replace(/\.html$/, "") });
    }
    const conAlbum = (await Promise.all(
      pendientes.map(async (item) => {
        try {
          const full = await getPostById(item.postId);
          const albums = parsePostToAlbums(full, archive.duplicatedBases);
          return { postId: item.postId, slug: item.slug, albums };
        } catch {
          return null;
        }
      }),
    )).filter((x): x is AlbumConSlug => x !== null);

    let hecho = 0;
    const chunk = Math.max(1, Math.ceil(conAlbum.length / 10));
    list = conAlbum;
    for (const item of list) {
      await verificarAlbums(item.albums, fallidos, stats);
      if (++hecho % chunk === 0) console.log(`... ${hecho}/${list.length} posts procesados | links únicos: ${cache.size}`);
    }
    console.log(`... posts con álbumes: ${list.length} | total álbumes: ${stats.albums}`);
  } else {
    const slugs = Object.keys(RESENAS);
    for (const slug of slugs) {
      const resolution = resolveSlug(slug, archive.slugMap);
      if (!resolution) {
        console.log(`!! ${slug}: slug sin resolver`);
        continue;
      }
      const post = await getPostById(resolution.postId);
      const albums = parsePostToAlbums(post, archive.duplicatedBases);
      await verificarAlbums(albums, fallidos, stats);
    }
  }

  for (const f of fallidos) {
    const h = f.host || f.hostFinal;
    hosts.set(h, (hosts.get(h) ?? 0) + 1);
  }

  console.log("");
  console.log("== RESUMEN ==");
  const muertos = fallidos.filter((f) => f.clase === "MUERTO");
  const bloqueados = fallidos.filter((f) => f.clase === "BLOQUEADO");
  const errores = fallidos.filter((f) => f.clase === "ERROR");
  console.log(
    `links evaluados: ${stats.ocurrencias} (únicos: ${cache.size}) | OK: ${stats.ok} | MUERTOS: ${muertos.length} | BLOQUEADOS: ${bloqueados.length} | ERRORES: ${errores.length} | álbumes sin links: ${stats.sinLinks}`,
  );
  console.log("hosts con fallos:", hosts.size ? [...hosts.entries()].sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h}(${n})`).join(", ") : "ninguno");
  if (muertos.length) {
    console.log("");
    console.log("MUERTOS:");
    muertos.forEach((f) => console.log(`  - /descargas/${f.slug} | ${f.banda} | ${f.label} | ${f.status} | ${f.host} | ${f.url} ${f.motivo !== "404 no existe" ? `| ${f.motivo}` : ""}`));
  }
  if (bloqueados.length) {
    console.log("");
    console.log("BLOQUEADOS (403, revisar a mano):");
    bloqueados.forEach((f) => console.log(`  - /descargas/${f.slug} | ${f.host} | ${f.url}`));
  }
  if (errores.length) {
    console.log("");
    console.log("ERRORES:");
    errores.forEach((f) => console.log(`  - /descargas/${f.slug} | ${f.host} | ${f.url} | ${f.motivo}`));
  }
  if (fallidos.length > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});