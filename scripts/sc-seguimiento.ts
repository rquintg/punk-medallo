import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SITEMAP_URL = process.env.SITEMAP_URL ?? "https://punkmedallo.com/sitemap.xml";
const DOC = "PLAN-MIGRACION-SEO.md";
const SITE = "https://punkmedallo.com";

const TOP20_SLUGS = [
  "recopilas",
  "los-restos",
  "nadie-discografia",
  "ixrxa-discografia-completa",
  "sekreto-de-estado-alfitrion",
  "punk-medallo-discografia",
  "la-misma-porkeria-discografia",
  "tifoidea",
  "denuncio",
  "gp-discografia-completa",
  "lpa-la-pipa-y-lo-de-adentro",
  "pudrase",
  "los-suziox-discografia",
  "bsn",
  "zociedad-punk",
  "ni-puta-mierda",
  "estamos-en-la-sima",
  "b-i-h-brutal-inconsciencia-humana",
  "dumka-diskantus",
  "rasix-y-sociedad-violenta",
];

const norm = (u: string) => (u.startsWith("http://") ? `https://${u.slice(7)}` : u).replace(/\/$/, "");

function leerCsv(path: string): Set<string> {
  const raw = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  return new Set(
    raw
      .split("\n")
      .slice(1)
      .map((l) => l.split(",")[0].trim())
      .filter((u) => u.startsWith("http"))
      .map(norm),
  );
}

function buscarCsv(patron: string): string | undefined {
  const downloads = join(homedir(), "Downloads");
  const candidatos = readdirSync(downloads)
    .filter((dir) => dir.includes(patron) && existsSync(join(downloads, dir, "Tabla.csv")))
    .map((dir) => ({ dir, mtime: statSync(join(downloads, dir, "Tabla.csv")).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return candidatos.length ? join(downloads, candidatos[0].dir, "Tabla.csv") : undefined;
}

function marcasDelDoc(): Set<string> {
  const doc = readFileSync(DOC, "utf8");
  const seccionE = doc.slice(doc.indexOf("## FASE E"), doc.indexOf("## FASE F"));
  const marcas = new Set<string>();
  for (const line of seccionE.split("\n")) {
    if (!line.includes("☐") && !line.includes("✅")) continue;
    const matches = [...line.matchAll(/descargas(?:\/banda)?\/([a-z0-9_.-]+)/g)];
    if (matches.length) marcas.add(matches[matches.length - 1][1]);
  }
  return marcas;
}

type Estado = "INDEXADA" | "COLA" | "NUNCA";
const estado = (u: string, valid: Set<string>, drill: Set<string>): Estado =>
  valid.has(u) ? "INDEXADA" : drill.has(u) ? "COLA" : "NUNCA";

const slugDe = (u: string) => u.replace(`${SITE}/descargas/`, "");
const esBanda = (u: string) => u.includes("/descargas/banda/");
const esTienda = (u: string) => u.includes("/tienda/") || u.includes("/productos/");

async function main() {
  let validPath = process.argv.find((a, i) => process.argv[i - 1] === "--valid");
  let drillPath = process.argv.find((a, i) => process.argv[i - 1] === "--drill");
  validPath ??= buscarCsv("Coverage-Valid");
  drillPath ??= buscarCsv("Coverage-Drilldown");
  if (!validPath || !drillPath) {
    const falta: string[] = [];
    if (!validPath) falta.push("Válidas (Coverage-Valid*)");
    if (!drillPath) falta.push("Descubierta (Coverage-Drilldown*)");
    console.error(`Falta el export de ${falta.join(" y ")} en ~/Downloads. Exportarlo desde SC (Páginas → reporte → Exportar) y volver a correr, o pasar --valid <ruta> --drill <ruta>`);
    process.exit(1);
  }

  const valid = leerCsv(validPath);
  const drill = leerCsv(drillPath);
  const marcadas = marcasDelDoc();

  const res = await fetch(SITEMAP_URL, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => norm(m[1]));
  const estadoDe = (u: string) => estado(u, valid, drill);

  const bandas = locs.filter(esBanda);
  const albums = locs.filter((u) => u.startsWith(`${SITE}/descargas/`) && !esBanda(u));
  const tienda = locs.filter(esTienda);
  const top20 = TOP20_SLUGS.map((s) => `${SITE}/descargas/${s}`);
  const luego = locs.filter((u) => !bandas.includes(u) && !albums.includes(u) && !tienda.includes(u));

  const cont = (arr: string[], e: Estado) => arr.filter((u) => estadoDe(u) === e).length;

  console.log(`CSV valid: ${validPath}`);
  console.log(`CSV drill: ${drillPath}`);
  console.log("");
  console.log(`Sitemap: ${locs.length} | Indexadas: ${cont(locs, "INDEXADA")} | Cola: ${cont(locs, "COLA")} | Nunca vista: ${cont(locs, "NUNCA")}`);
  console.log("");
  console.log("== Estado por grupo ==");
  console.log(`TOP-20     ${cont(top20, "INDEXADA")}/20 | cola ${cont(top20, "COLA")}`);
  const marcadasAlbums = albums.filter((u) => marcadas.has(slugDe(u)));
  console.log(`Marcadas doc (albums): ${marcadasAlbums.length} -> indexadas ${cont(marcadasAlbums, "INDEXADA")}, en cola ${cont(marcadasAlbums, "COLA")}`);
  console.log(`Bandas     ${cont(bandas, "INDEXADA")}/${bandas.length} | cola ${cont(bandas, "COLA")}` + (cont(bandas, "NUNCA") ? ` | nunca ${cont(bandas, "NUNCA")}` : ""));
  console.log(`Albumes    ${cont(albums, "INDEXADA")}/${albums.length} | cola ${cont(albums, "COLA")}`);
  console.log(`Tienda     ${cont(tienda, "INDEXADA")}/${tienda.length} | cola ${cont(tienda, "COLA")}`);
  if (luego.length) console.log(`Otras      ${luego.map((u) => u + (estadoDe(u) === "INDEXADA" ? "" : ` (${estadoDe(u)})`)).join(", ")}`);

  const pendientes = (items: string[]) => items.filter((u) => estadoDe(u) !== "INDEXADA" && !marcadas.has(slugDe(u)));
  const bandaPend = pendientes(bandas);
  const albumPend = pendientes(albums);
  const tiendaPend = pendientes(tienda);

  console.log("");
  console.log("== Cola priorizada ==");
  console.log(`1. TOP-20 sin indexar (ya solicitadas, esperan re-rastreo):`);
  top20.filter((u) => estadoDe(u) !== "INDEXADA").forEach((x) => console.log(`   ${estadoDe(x)}`.padEnd(13) + x));
  console.log(`2. Bandas en cola sin solicitar (${bandaPend.length}):`);
  bandaPend.forEach((x, i) => console.log(`   ${String(i + 1).padStart(2)}. ${estadoDe(x)}`.padEnd(13) + x));
  console.log(`3. Albumes en cola sin solicitar (${albumPend.length}):`);
  albumPend.slice(0, 10).forEach((x) => console.log(`   ${estadoDe(x)}`.padEnd(13) + x));
  console.log(`4. Tienda en cola sin solicitar (${tiendaPend.length}):`);
  tiendaPend.forEach((x) => console.log(`   ${estadoDe(x)}`.padEnd(13) + x));

  const siguiente10 = [...bandaPend, ...albumPend, ...tiendaPend].slice(0, 10);
  console.log("");
  console.log("== SIGUIENTE 10 PARA SOLICITAR ==");
  siguiente10.forEach((x, i) => console.log(`${String(i + 1).padStart(2)}. ${x}`));

  if (siguiente10.length) {
    console.log("");
    console.log("== Tabla checklist (pegar en PLAN-MIGRACION-SEO.md) ==");
    console.log("| # | URL | Estado SC | ✅ |");
    console.log("|---|---|---|---|");
    siguiente10.forEach((x, i) => console.log(`| ${i + 1} | ${x.replace(SITE, "")} | ${estadoDe(x)} | ☐ |`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});