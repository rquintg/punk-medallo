export interface CategoriaEstilo {
  label: string
  badge: string
}

const CATEGORIA_ESTILOS: Record<string, CategoriaEstilo> = {
  camisetas: {
    label: 'Camiseta',
    badge: 'bg-[#dc2626] text-white',
  },
  accesorios: {
    label: 'Accesorio',
    badge: 'bg-[#a40202] text-white',
  },
}

const ESTILO_FALLBACK: CategoriaEstilo = {
  label: 'Producto',
  badge: 'bg-neutral-700 text-white',
}

export function getCategoriaEstilo(
  categoria: { slug?: string | null; nombre?: string | null } | null,
): CategoriaEstilo {
  if (!categoria?.slug) return ESTILO_FALLBACK
  return (
    CATEGORIA_ESTILOS[categoria.slug] ?? {
      label: categoria.nombre || ESTILO_FALLBACK.label,
      badge: ESTILO_FALLBACK.badge,
    }
  )
}

export function etiquetaCategoria(
  categoria: { slug?: string | null; nombre?: string | null } | null,
): string {
  return getCategoriaEstilo(categoria).label
}
