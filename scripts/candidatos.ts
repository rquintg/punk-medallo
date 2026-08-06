import { getArchive } from "../src/features/descargas/services/archivo";
import { resolveBandFromMeta } from "../src/features/descargas/utils/album";
import { postSlugFromPath } from "../src/features/descargas/utils/slug";

async function main() {
  const archive = await getArchive();
  const counts = new Map<string, { slug: string; title: string }[]>();
  for (const post of archive.posts) {
    const band = resolveBandFromMeta(post).replace(/\s+/g, " ").trim();
    if (!band || band === "Varios Artistas") continue;
    const slug = postSlugFromPath(post.url ?? "");
    const arr = counts.get(band) ?? [];
    arr.push({ slug, title: post.title ?? "" });
    counts.set(band, arr);
  }
  const multi = [...counts.entries()].filter(([, v]) => v.length >= 2);
  console.log("BANDAS CON 2+ ÁLBUMES (" + multi.length + " bandas):");
  for (const [band, albums] of multi.sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n== ${band} (${albums.length}) ==`);
    for (const a of albums) console.log(`  ${a.slug}  —  ${a.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
