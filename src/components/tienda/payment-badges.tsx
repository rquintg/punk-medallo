import Image from 'next/image'
import { Banknote } from 'lucide-react'

interface PaymentBadgesProps {
  highlight?: 'wompi' | 'contra_entrega'
  label?: string
}

const LOGOS: { src: string; alt: string; title: string; width: number; height: number }[] = [
  { src: '/pagos/Visa.png', alt: 'Visa', title: 'Visa', width: 800, height: 259 },
  { src: '/pagos/Symbol.png', alt: 'Mastercard', title: 'Mastercard', width: 800, height: 495 },
  { src: '/pagos/Nequi.png', alt: 'Nequi', title: 'Nequi', width: 800, height: 248 },
  { src: '/pagos/Pse.png', alt: 'PSE', title: 'PSE', width: 800, height: 248 },
  { src: '/pagos/Daviplata.png', alt: 'Daviplata', title: 'Daviplata', width: 800, height: 248 },
  { src: '/pagos/Bancolombia.png', alt: 'Bancolombia', title: 'Bancolombia', width: 820, height: 115 },
  { src: '/pagos/Qr.svg', alt: 'QR Bancolombia', title: 'QR Bancolombia', width: 48, height: 48 },
]

export default function PaymentBadges({ highlight, label = 'Aceptamos' }: PaymentBadgesProps) {
  const onlineActive = highlight === 'wompi'
  const efectivoActive = highlight === 'contra_entrega'
  const atenuado = ' opacity-40 grayscale'
  const resaltadoEfectivo = ' ring-2 ring-emerald-500'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-neutral-500">{label}:</span>

      {LOGOS.map((logo) => (
        <span
          key={logo.src}
          className={`flex h-8 w-16 shrink-0 items-center justify-center rounded bg-white px-1 py-1${onlineActive ? '' : atenuado}`}
          aria-label={logo.alt}
          title={logo.title}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            unoptimized
            className="max-h-full max-w-full object-contain"
          />
        </span>
      ))}

      <span
        className={`flex h-8 shrink-0 items-center gap-1 rounded border border-neutral-700 bg-[#181818] px-2 text-[11px] font-semibold text-emerald-400${efectivoActive ? resaltadoEfectivo : ''}${highlight && !efectivoActive ? atenuado : ''}`}
        aria-label="Efectivo contra entrega"
        title="Contra entrega"
      >
        <Banknote size={13} />
        Efectivo
      </span>
    </div>
  )
}