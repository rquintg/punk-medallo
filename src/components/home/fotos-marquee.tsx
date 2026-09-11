'use client'

import { motion } from 'framer-motion'

interface FotosMarqueeProps {
  fotos: Array<{ id: string; src: string; link?: string; band?: string; title?: string }>
}

function MarqueeRow({ items, reverse = false }: { items: FotosMarqueeProps['fotos']; reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex gap-3"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {[...items, ...items].map((f, i) => (
          <a key={`${f.id}-${i}`} href={f.link ?? '/fotos'} target={f.link ? '_blank' : undefined} rel="noopener noreferrer" className="group relative h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 sm:h-40 sm:w-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.src} alt={f.title ?? ''} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            {(f.band || f.title) && (
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {f.band && <p className="truncate text-[11px] font-black uppercase tracking-widest text-primary">{f.band}</p>}
                {f.title && <p className="truncate text-xs font-bold leading-tight text-white">{f.title}</p>}
              </div>
            )}
          </a>
        ))}
      </motion.div>
    </div>
  )
}

export default function FotosMarquee({ fotos }: FotosMarqueeProps) {
  if (fotos.length === 0) return null
  const row1 = fotos.slice(0, Math.ceil(fotos.length / 2))
  const row2 = fotos.slice(Math.ceil(fotos.length / 2))

  return (
    <div className="space-y-3">
      <MarqueeRow items={row1} />
      <MarqueeRow items={row2} reverse />
    </div>
  )
}
