export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/gi, "o")
    .replace(/ß/gi, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeBand(name: string): string {
  return slugify(name);
}

export function firstLetter(name: string): string {
  const normalized = normalizeBand(name);
  return normalized ? normalized.charAt(0).toUpperCase() : "#";
}

export function normalizeSearch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/gi, "o")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function postSlugFromPath(pathname: string): string {
  const filename = pathname.split("/").filter(Boolean).pop() ?? pathname;
  return filename.replace(/\.html?$/i, "").replace(/\./g, "-");
}

export function qualifiedSlugBase(
  pathname: string,
  duplicatedBases: ReadonlySet<string>
): string {
  const base = postSlugFromPath(pathname);
  if (!duplicatedBases.has(base)) return base;
  const match = pathname.match(/\/(\d{4})\/(\d{2})\//);
  if (!match) return base;
  return `${base}-${match[1]}-${match[2]}`;
}

export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
