export function ProximosSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex min-h-[132px] w-full max-w-[460px] animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="w-[132px] shrink-0 bg-neutral-900 sm:w-[148px]" />
          <div className="flex flex-1 flex-col p-3.5 sm:p-4">
            <div className="h-4 w-3/4 rounded bg-neutral-800" />
            <div className="mt-2 h-3 w-1/2 rounded bg-neutral-800" />
            <div className="mt-auto h-6 w-20 rounded-full bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DestacadosSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-6 w-32 rounded bg-neutral-800" />
      <div className="grid items-center gap-10 lg:grid-cols-[360px_1fr]">
        <div className="aspect-square rounded-lg bg-neutral-900" />
        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-neutral-800" />
          <div className="h-8 w-3/4 rounded bg-neutral-800" />
          <div className="h-3 w-1/2 rounded bg-neutral-800" />
          <div className="h-16 w-full rounded bg-neutral-800" />
          <div className="h-10 w-32 rounded bg-neutral-800" />
        </div>
      </div>
    </div>
  )
}

export function ArchivoSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 w-48 shrink-0 rounded-xl bg-neutral-900 sm:h-40 sm:w-64" />
        ))}
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`b-${i}`} className="h-32 w-48 shrink-0 rounded-xl bg-neutral-900 sm:h-40 sm:w-64" />
        ))}
      </div>
    </div>
  )
}

export function ProductosSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-neutral-800 bg-surface">
          <div className="aspect-square bg-neutral-900" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-neutral-800" />
            <div className="h-4 w-1/3 rounded bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function BoleteriaSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="aspect-square bg-neutral-900" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-neutral-800" />
            <div className="h-3 w-1/2 rounded bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[100vh] min-h-[540px] w-screen animate-pulse bg-neutral-900">
      <div className="absolute left-1/2 top-[14%] h-[200px] w-[78%] max-w-[420px] -translate-x-1/2 rounded-xl bg-neutral-800" />
      <div className="absolute bottom-[18%] left-1/2 w-full max-w-2xl -translate-x-1/2 px-6">
        <div className="mx-auto h-8 w-3/4 rounded bg-neutral-800" />
        <div className="mx-auto mt-3 h-4 w-1/2 rounded bg-neutral-800" />
        <div className="mx-auto mt-3 h-3 w-full max-w-xl rounded bg-neutral-800" />
        <div className="mx-auto mt-6 h-20 w-full max-w-2xl rounded-xl bg-neutral-800" />
      </div>
    </div>
  )
}
