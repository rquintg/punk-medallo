interface FotosHeroProps {
  totalArchivos: number;
  aniosCubiertos: number;
  rangoAnios?: string | null;
  ultimaPublicacion: string | null;
}

function daysAgo(iso: string | null): string {
  if (!iso) return "";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  );
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

export function FotosHero({
  totalArchivos,
  aniosCubiertos,
  rangoAnios,
  ultimaPublicacion,
}: FotosHeroProps) {
  const latest = daysAgo(ultimaPublicacion);

  return (
    <section className="border-b border-neutral-800 bg-[#101010]">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-12 md:pt-28 md:pb-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#dc2626]">
          Punk Medallo — Archivo visual
        </p>
        <h1 className="mt-3 text-5xl font-bold uppercase leading-none tracking-tight text-white md:text-7xl">
          Registro{" "}
          <span className="text-[#dc2626]">Audiovisual</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">
          La memoria visual de la escena: toques, ensayos.
          Fotos y videos directos de la página de Facebook, tal como
          se vivieron.
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 font-mono text-sm">
          <div>
            <dt className="sr-only">Publicaciones del registro</dt>
            <dd className="text-2xl font-bold text-white">{totalArchivos}</dd>
            <dd className="text-[11px] uppercase tracking-widest text-neutral-500">
              publicaciones del registro
            </dd>
          </div>
          <div>
            <dt className="sr-only">Años</dt>
            <dd className="text-2xl font-bold text-white">{aniosCubiertos}</dd>
            <dd className="text-[11px] uppercase tracking-widest text-neutral-500">
              {rangoAnios ? `años / ${rangoAnios}` : "años cubiertos"}
            </dd>
          </div>
          {latest && (
            <div>
              <dt className="sr-only">Última publicación</dt>
              <dd className="text-2xl font-bold text-white">{latest}</dd>
              <dd className="text-[11px] uppercase tracking-widest text-neutral-500">
                última publicación
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}