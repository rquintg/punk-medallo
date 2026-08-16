import { formatearCOP } from './chart-theme'

interface TopProducto {
  nombre: string
  cantidad: number
  ingresos: number
}

interface TopProductosProps {
  productos: TopProducto[]
  maxIngresos: number
}

export default function TopProductos({ productos, maxIngresos }: TopProductosProps) {
  if (productos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--admin-text-dim)]">
        Sin ventas en este periodo
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {productos.map((producto, index) => {
        const pct = maxIngresos > 0 ? Math.max(4, (producto.ingresos / maxIngresos) * 100) : 0
        return (
          <li key={producto.nombre} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold tabular-nums ${
                index === 0
                  ? 'bg-[var(--admin-accent)] text-white'
                  : 'bg-[var(--admin-hover)] text-[var(--admin-text-muted)]'
              }`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                  {producto.nombre}
                </p>
                <p className="shrink-0 font-mono text-xs tabular-nums text-[var(--admin-text-muted)]">
                  {formatearCOP(producto.ingresos)}
                </p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--admin-hover)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--admin-accent)] to-[var(--admin-accent)]/40"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--admin-text-dim)]">
                {producto.cantidad} vendido{producto.cantidad !== 1 ? 's' : ''}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}