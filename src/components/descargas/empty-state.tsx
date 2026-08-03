import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "NADA EN EL ARCHIVO",
  description = "No se encontraron lanzamientos para este filtro. Intentá con otros términos.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-800 py-20 text-center">
      <SearchX className="h-10 w-10 text-neutral-600" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
          {title}
        </p>
        <p className="max-w-md text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
