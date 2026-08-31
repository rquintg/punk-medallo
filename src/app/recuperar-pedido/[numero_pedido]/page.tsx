import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateIntegritySignature } from '@/lib/wompi';
import { Breadcrumbs } from '@/components/tienda/breadcrumbs';
import RecoveryPayment from '@/components/tienda/recovery-payment';
import { AlertCircle, Receipt, ShieldCheck, Ticket } from 'lucide-react';
import Link from 'next/link';

interface RecoveryPageProps {
  params: Promise<{ numero_pedido: string }>;
}

export default async function RecuperarPedidoPage({ params }: RecoveryPageProps) {
  const { numero_pedido } = await params;
  const supabase = await createClient();

  // 1. Buscar el pedido y sus items
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('*, pedido_items(*)')
    .eq('numero_pedido', numero_pedido)
    .single();

  if (pedidoError || !pedido) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <Breadcrumbs segments={[{ label: 'Tienda', href: '/tienda' }, { label: 'Recuperar Pedido' }]} />
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} className="text-red-500" />
          <h1 className="text-xl font-semibold text-white">Pedido no encontrado</h1>
          <p className="text-sm text-neutral-500">No pudimos encontrar la información de tu compra.</p>
          <Link href="/tienda" className="mt-4 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // 2. Validar estado
  if (pedido.estado !== 'pendiente') {
    const isApproved = pedido.estado === 'aprobado';
    return (
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <Breadcrumbs segments={[{ label: 'Tienda', href: '/tienda' }, { label: 'Recuperar Pedido' }]} />
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          {isApproved ? <ShieldCheck size={48} className="text-green-500" /> : <AlertCircle size={48} className="text-red-500" />}
          <h1 className="text-xl font-semibold text-white">
            {isApproved ? 'Pedido ya procesado' : 'Pedido no disponible'}
          </h1>
          <p className="text-sm text-neutral-500">
            {isApproved 
              ? 'Este pedido ya ha sido pagado y procesado correctamente.' 
              : 'Este pedido ya no está disponible para pago.'}
          </p>
          <Link href="/cuenta/pedidos" className="mt-4 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  // 3. Generar parámetros de Wompi (exactamente como en checkout)
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
  const amountInCents = Math.round(pedido.total * 100);

  if (!publicKey || !integrityKey) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} className="text-red-500" />
          <h1 className="text-xl font-semibold text-white">Error de configuración</h1>
          <p className="text-sm text-neutral-500">Hubo un error interno al generar la pasarela de pago.</p>
        </div>
      </div>
    );
  }

  const signature = generateIntegritySignature(
    pedido.numero_pedido,
    amountInCents,
    'COP',
    integrityKey,
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://punkmedallo.com';
  const isLocal = siteUrl.startsWith('http://localhost') || siteUrl.startsWith('http://127.0.0.1');
  const redirectUrl = isLocal ? '' : `${siteUrl}/tienda/compra`;

  const wompiParams = {
    publicKey,
    amountInCents,
    currency: 'COP',
    reference: pedido.numero_pedido,
    signature: { integrity: signature },
    redirectUrl,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-20 pb-8">
      <Breadcrumbs segments={[{ label: 'Tienda', href: '/tienda' }, { label: 'Recuperar Pedido' }]} />
      
      <div className="mt-12 mx-auto max-w-3xl space-y-6">
        {/* ================== HERO TICKET STUB ================== */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#1a0a0a] via-[#140707] to-[#0a0a0a]">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #dc2626 0 1px, transparent 1px 10px)' }} aria-hidden />
          
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-neutral-800 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500">
              <Receipt size={13} className="text-[#dc2626]" />
              Pedido <span className="font-semibold text-neutral-300">{pedido.numero_pedido}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/50 bg-amber-950/30 px-3 py-1 text-xs font-semibold text-amber-300">
              <ShieldCheck size={13} />
                Pendiente de Pago
            </div>
          </div>

          <div className="relative grid gap-6 px-6 py-8 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                <Ticket size={12} /> Recuperación de Compra
              </p>
              <h1 className="text-3xl font-black uppercase italic leading-[1.05] tracking-tight text-white md:text-5xl">
                Finaliza tu pedido
              </h1>
              <p className="mt-3 text-sm text-neutral-400">Retoma tu compra exactamente donde la dejaste.</p>
            </div>
            <div className="relative md:text-right">
              <div className="inline-flex items-center gap-3 rounded-xl border border-neutral-800 bg-black/40 px-5 py-4 md:flex-col md:items-end md:gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Total</span>
                <span className="text-2xl font-black leading-none text-white">
                  ${pedido.total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================== RESUMEN Y PAGO ================== */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Detalle de Items */}
          <section className="rounded-xl border border-neutral-800 bg-[#111] p-5 sm:p-6">
            <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
              Resumen de Artículos
            </p>
            <div className="space-y-3">
              {pedido.pedido_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">
                    {item.nombre} <span className="text-neutral-600">x{item.cantidad}</span>
                  </span>
                  <span className="text-white font-medium">
                    ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-neutral-800 flex justify-between items-center">
                <span className="text-white font-bold">Total Final</span>
                <span className="text-xl font-black text-[#dc2626]">
                  ${pedido.total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </section>

          {/* Acción de Pago */}
          <section className="rounded-xl border border-neutral-800 bg-[#111] p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                Finalizar Pago
              </p>
              <p className="text-sm text-neutral-400 mb-6">
                Estás a un solo paso de asegurar tus productos. Completa el pago de forma segura a través de Wompi.
              </p>
            </div>
            <RecoveryPayment wompi={wompiParams} />
          </section>
        </div>
      </div>
    </div>
  );
}
