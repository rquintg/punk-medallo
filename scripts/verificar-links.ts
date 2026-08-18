import { getArchive, resolveSlug } from "../src/features/descargas/services/archivo";
import { getPostById } from "../src/features/descargas/services/blogger";
import { parsePostToAlbums } from "../src/features/descargas/utils/parse-content";
import { RESENAS } from "../src/data/resenas";

const UA = "Mozilla/5.0 (compatible; PunkMedalloLinkCheck/1.0)";

interface CheckResult {
  ok: boolean;
  status: number;
  finalUrl: string;
  error?: string;
}

async function checkUrl(url: string): Promise<CheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
      headers: { Range: "bytes=0-1023", "User-Agent": UA },
      redirect: "follow",
      signal: controller.signal,
    });
    return { ok: res.status === 200 || res.status === 206, status: res.status, finalUrl: res.url };
  } catch (e) {
    return { ok: false, status: 0, finalUrl: url, error: e instanceof Error ? e.name : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const slugs = Object.keys(RESENAS);
  const archive = await getArchive();
  const hosts = new Map<string, number>();
  const fallidos: { slug: string; label: string; url: string; razon: string }[] = [];
  const sinLinks: { slug: string; titulo: string }[] = [];
  let linksOk = 0;
  let linksTotal = 0;

  for (const slug of slugs) {
    const resolution = resolveSlug(slug, archive.slugMap);
    if (!resolution) {
      console.log(`!! ${slug}: slug sin resolver`);
      continue;
    }
    const post = await getPostById(resolution.postId);
    const albums = parsePostToAlbums(post, archive.duplicatedBases);
    const album =
      albums.find((a) => a.slug === slug) ?? albums[resolution.index] ?? albums[0];
    if (!album) {
      console.log(`!! ${slug}: sin album`);
      continue;
    }
    for (const album of albums) {
      const links = album.downloadLinks.filter((l) => l.url.startsWith("http"));
      if (links.length === 0) {
        sinLinks.push({ slug: album.slug, titulo: album.title });
        console.log(`== ${album.slug} | ${album.band} ${album.year ?? ""} | "` + album.title + `" | SIN LINKS`);
        continue;
      }
      const checks: string[] = [];
      for (const link of links) {
        const r = await checkUrl(link.url);
        linksTotal += 1;
        const host = link.host || new URL(link.url).hostname;
        hosts.set(host, (hosts.get(host) ?? 0) + 1);
        if (r.ok) {
          linksOk += 1;
        } else {
          fallidos.push({ slug: album.slug, label: link.label, url: link.url, razon: r.error ? `error ${r.error}` : `${r.status}` });
        }
        checks.push(`  [${r.ok ? "OK " : "XX "}] ${String(r.status).padStart(3)} ${host} -> ${r.finalUrl.replace(/^https?:\/\//, "").slice(0, 60)} ${r.error ?? ""}`);
        await sleep(250);
      }
      console.log(`== ${album.slug} | ${album.band} ${album.year ?? ""} | ${links.length} links`);
      checks.forEach((c) => console.log(c));
    }
  }

  console.log("");
  console.log("== RESUMEN ==");
  console.log(`álbumes con reseña: ${slugs.length}`);
  console.log(`links verificados: ${linksTotal} | OK: ${linksOk} | fallidos: ${fallidos.length} | sin links: ${sinLinks.length}`);
  console.log("hosts:", [...hosts.entries()].sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h}(${n})`).join(", "));
  if (sinLinks.length) {
    console.log("");
    console.log("SIN LINKS DE DESCARGA:");
    sinLinks.forEach((s) => console.log(`  - /descargas/${s.slug} (${s.titulo})`));
  }
  if (fallidos.length) {
    console.log("");
    console.log("FALLIDOS:");
    fallidos.forEach((f) => console.log(`  - /descargas/${f.slug} | ${f.label} | ${f.razon} | ${f.url}`));
  }
  if (fallidos.length > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});