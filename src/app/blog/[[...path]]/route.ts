import { getArchive, resolveSlug } from "@/features/descargas/services/archivo";

export const revalidate = 86400;

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" };

function redirectTo(url: string, request: Request, status: 301 | 308 = 301): Response {
  return new Response(null, {
    status,
    headers: { Location: new URL(url, request.url).toString(), ...CACHE_HEADERS },
  });
}

function blogPostBase(path: string[]): string | null {
  const [year, month, ...rest] = path;
  const file = rest.at(-1) ?? "";
  if (!year || !/^\d{4}$/.test(year)) return null;
  if (!month || !/^\d{2}$/.test(month)) return null;
  if (!/\.html?$/i.test(file)) return null;
  return file.replace(/\.html?$/i, "").replace(/\./g, "-");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const base = blogPostBase(path);

  if (!base) {
    return redirectTo("/descargas", request);
  }

  const archive = await getArchive();
  const qualified =
    archive.duplicatedBases.has(base) &&
    path[0] &&
    path[1]
      ? `${base}-${path[0]}-${path[1]}`
      : null;

  const candidate = qualified ?? base;
  if (resolveSlug(candidate, archive.slugMap)) {
    return redirectTo(`/descargas/${candidate}`, request);
  }

  if (qualified && resolveSlug(base, archive.slugMap)) {
    return redirectTo(`/descargas/${base}`, request);
  }

  return redirectTo("/descargas", request);
}
