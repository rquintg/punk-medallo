import { getArchive, resolveSlug } from "@/features/descargas/services/archivo";

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
    return Response.redirect(new URL("/descargas", request.url), 301);
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
    return Response.redirect(
      new URL(`/descargas/${candidate}`, request.url),
      301
    );
  }

  if (qualified && resolveSlug(base, archive.slugMap)) {
    return Response.redirect(new URL(`/descargas/${base}`, request.url), 301);
  }

  return Response.redirect(new URL("/descargas", request.url), 301);
}
