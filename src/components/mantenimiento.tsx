import { Wrench } from 'lucide-react'

export default function Mantenimiento({ titulo = 'En mantenimiento', mensaje = 'Estamos trabajando para volver pronto.' }: { titulo?: string; mensaje?: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dc2626]/10 ring-2 ring-[#dc2626]/30">
        <Wrench size={28} className="text-[#dc2626]" />
      </span>
      <h1 className="text-2xl font-black uppercase tracking-wide text-white md:text-3xl">{titulo}</h1>
      <p className="max-w-md text-sm leading-relaxed text-neutral-400">{mensaje}</p>
    </div>
  )
}
