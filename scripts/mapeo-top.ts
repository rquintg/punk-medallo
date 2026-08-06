import { getArchive } from "../src/features/descargas/services/archivo";
import { getPostById } from "../src/features/descargas/services/blogger";
import { parsePostToAlbums } from "../src/features/descargas/utils/parse-content";
import { qualifiedSlugBase, postSlugFromPath } from "../src/features/descargas/utils/slug";

const TOP_TITLES = [
  "Punk Medallo",
  "Los Restos - Discografia",
  "NADIE - Discografia",
  "IxRxA - Discografia Completa",
  "Sekreto de Estado - Anfitrión",
  "Punk Medallo Discografia",
  "La Misma Porkeria - Discografia",
  "TIFOIDEA",
  "DENUNCIO",
  "G.P Discografia [Completa]",
  "L.P.A (La Pipa y Lo De Adentro)",
  "Púdrase!",
  "Los Suziox - Discografia",
  "B.S.N",
  "Zoøciedad Punk",
  "NI PUTA MIERDA",
  "ESTAMOS EN LA CIMA (1989)",
  "B. I. H. – Brutal Inconsciencia Humana",
  "DUMKA DISKANTUS",
  "RASIX Y SOCIEDAD VIOLENTA Split",
];

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

async function main() {
  const archive = await getArchive();
  const byNorm = new Map(archive.posts.map((p) => [norm(p.title ?? ""), p]));
  for (const t of TOP_TITLES) {
    const post = byNorm.get(norm(t));
    if (!post) {
      console.log(`SIN MATCH EXACTO: "${t}"`);
      const fuzzy = archive.posts.find((p) => norm(p.title ?? "").includes(norm(t).slice(0, 15)));
      if (fuzzy) console.log(`  -> ¿posible: "${fuzzy.title}" (${postSlugFromPath(new URL(fuzzy.url ?? "").pathname)})?`);
      continue;
    }
    const pathname = new URL(post.url ?? "").pathname;
    const base = qualifiedSlugBase(pathname, archive.duplicatedBases);
    const full = await getPostById(post.id);
    const albums = parsePostToAlbums(full, archive.duplicatedBases);
    console.log(`\n== "${t}"`);
    console.log(`   url: ${pathname}`);
    console.log(`   labels: ${(post.labels ?? []).join(", ") || "-"}`);
    for (const a of albums) {
      console.log(`   slug: ${a.slug} | banda: ${a.band} | año: ${a.year} | formato: ${a.format} | tracks: ${a.trackList.length} | hosts: ${[...new Set(a.downloadLinks.map((l) => l.host))].join(",")}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
