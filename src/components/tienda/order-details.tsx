"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Archive,
  Banknote,
  CheckCircle,
  Download,
  Home,
  Package,
  Truck,
  Receipt,
  Ticket,
  AlertCircle,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export interface OrderDetailsItem {
  imagen: string | null;
  nombre: string;
  detalle: string | null;
  talla: string | null;
  cantidad: number;
  precio: number;
}

export interface MetodoPagoInfo {
  logo: string | null;
  nombre: string;
  linea: string;
  detalle: string | null;
  ref: string | null;
}

export interface OrderDireccionInfo {
  nombre: string;
  correo: string | null;
  direccion: string | null;
  barrio: string | null;
  ciudad: string | null;
  departamento: string | null;
  telefono: string | null;
  notas: string | null;
}

export interface OrderDetailsProps {
  numero: string;
  subtitulo: string;
  fechaIso: string | null;
  estado: string;
  fechas: {
    aprobado: string | null;
    preparando: string | null;
    enviado: string | null;
    entregado: string | null;
  };
  entregaEstimada: string | null;
  items: OrderDetailsItem[];
  filasResumen: Array<{ titulo: string; valor: number | null; gratis?: boolean }>;
  total: number;
  direccion: OrderDireccionInfo;
  metodo: MetodoPagoInfo;
  notaMetodo: string | null;
}

const formatearPrecio = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const formatearFecha = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("es-CO", { dateStyle: "long" })
    : null;

const formatearFechaHora = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-CO", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : null;

const PASOS = [
  { key: "aprobado", icono: CheckCircle, titulo: "Pedido confirmado" },
  { key: "preparando", icono: Archive, titulo: "En preparación" },
  { key: "enviado", icono: Truck, titulo: "Enviado" },
  { key: "entregado", icono: Home, titulo: "Entregado" },
] as const;

const PASOS_COMPLETADOS: Record<string, number> = {
  pendiente: 0,
  aprobado: 1,
  preparando: 2,
  enviado: 3,
  entregado: 4,
};

export default function OrderDetails({
  numero,
  subtitulo,
  fechaIso,
  estado,
  fechas,
  entregaEstimada,
  items,
  filasResumen,
  total,
  direccion,
  metodo,
  notaMetodo,
}: OrderDetailsProps) {
  const [isVertical, setIsVertical] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsVertical(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const completados = PASOS_COMPLETADOS[estado] ?? 0;

  const direccionLineasFactura = [
    direccion.nombre,
    direccion.correo ? `Correo: ${direccion.correo}` : null,
    [direccion.direccion, direccion.barrio].filter(Boolean).join(", ") || null,
    [direccion.ciudad, direccion.departamento].filter(Boolean).join(", ") || null,
    direccion.telefono ? `Tel: ${direccion.telefono}` : null,
    ...(direccion.notas ? [`Notas: ${direccion.notas}`] : []),
  ].filter((l): l is string => !!l);

  const descargarFactura = () => {
    const lineas = [
      "PUNK MEDALLO",
      `Pedido ${numero}`,
      `Fecha: ${formatearFechaHora(fechas.// Fixed a typo in the line below if it exists
      aprobado ?? null) ?? subtitulo}`,
      "",
      "PRODUCTOS",
      ...items.map(
        (item) =>
          `${item.cantidad}x ${item.nombre}${item.talla ? ` (Talla ${item.talla})` : ""} — ${formatearPrecio(item.precio * item.cantidad)}`,
      ),
      "",
      ...filasResumen.map((fila) =>
        fila.gratis
          ? `${fila.titulo}: Gratis`
          : `${fila.titulo}: ${formatearPrecio(fila.valor ?? 0)}`,
      ),
      `Total: ${formatearPrecio(total)}`,
      "",
      "DIRECCIÓN DE ENVÍO",
      ...direccionLineasFactura,
      "",
      metodo.linea,
      ...(metodo.detalle ? [metodo.detalle] : []),
      ...(metodo.ref ? [`Ref: ${metodo.ref}`] : []),
      "",
      "¡Gracias por tu compra en Punk Medallo!",
    ];
    const blob = new Blob([lineas.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura-${numero}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* ================== HERO TICKET STUB ================== */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#1a0a0a] via-[#140707] to-[#0a0a0a] mb-12">
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `repeating-linear-gradient(45deg, #dc2626 0 1px, transparent 1px 10px)` }} aria-hidden />
          
          {/* Header con número de pedido y badge de estado */}
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-neutral-800 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500">
              <Receipt size={13} className="text-[#dc2626]" />
              Pedido <span className="font-semibold text-neutral-300">{numero}</span>
            </div>
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
              estado === 'aprobado' ? 'border-emerald-700/50 bg-emerald-950/30 text-emerald-400' :
              ['rechazado', 'anulado'].includes(estado) ? 'border-red-800/60 bg-red-950/30 text-red-400' :
              'border-amber-700/50 bg-amber-950/30 text-amber-300'
            }`}>
              {estado === 'aprobado' ? <CheckCircle size={13} /> : 
               ['rechazado', 'anulado'].includes(estado) ? <AlertCircle size={13} /> : 
               <Clock size={13} />}
              {estado === 'aprobado' ? 'Pago Confirmado' : 
               ['rechazado', 'anulado'].includes(estado) ? 'Pedido Anulado' : 
               'Pendiente de Pago'}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="relative grid gap-6 px-6 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <p className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                <Ticket size={12} /> Información de la Orden
              </p>
              <h1 className="text-3xl font-black uppercase italic leading-[1.05] tracking-tight text-white md:text-5xl">
                Detalle del pedido
              </h1>
              <p className="text-neutral-400 text-sm md:text-base max-w-xl">
                {subtitulo}
              </p>
            </div>
            <div className="relative md:text-right">
              <div className="inline-flex items-center gap-3 rounded-xl border border-neutral-800 bg-black/40 px-5 py-4 md:flex-col md:items-end md:gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Total</span>
                <span className="text-2xl font-black leading-none text-white">
                  {formatearPrecio(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* Timeline */}
            <div className="rounded-xl border border-neutral-800 bg-[#111] p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                  Estado del Proceso
                </p>
              </div>

              {isVertical ? (
                  <div className="space-y-6">
                    {PASOS.map(({ key, icono: Icono, titulo }, i) => (
                        <div key={key} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                                className={
                                  i < completados
                                      ? "bg-[#dc2626] flex h-10 w-10 items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                                      : "bg-neutral-800 flex h-10 w-10 items-center justify-center rounded-full"
                                }
                            >
                              {i < completados ? (
                                  <CheckCircle className="h-5 w-5 text-white" />
                              ) : (
                                  <Icono className="text-neutral-600 h-5 w-5" />
                              )}
                            </div>
                            {i < PASOS.length - 1 && (
                                <div
                                    className={
                                      i < completados
                                          ? "bg-[#dc2626] my-2 w-0.5 flex-1"
                                          : "bg-neutral-800 my-2 w-0.5 flex-1"
                                    }
                                />
                            )}
                          </div>
                          <div className={i < PASOS.length - 1 ? "pb-6" : ""}>
                            <p className={`font-bold ${i < completados ? "text-white" : "text-neutral-500"}`}>{titulo}</p>
                            <p className="text-neutral-500 mt-1 text-xs">
                              {key === "aprobado"
                                  ? formatearFechaHora(fechas.aprobado) ??
                                  "Pendiente"
                                  : fechas[key]
                                      ? formatearFecha(fechas[key])
                                      : key === "entregado"
                                          ? entregaEstimada
                                              ? `Entrega estimada: ${entregaEstimada}`
                                              : "Pendiente"
                                          : "Pendiente"}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="flex items-start justify-between">
                    {PASOS.map(({ key, icono: Icono, titulo }, i) => (
                        <div key={key} className="flex flex-1 flex-col items-center gap-4">
                          <div className="flex w-full items-center">
                            <div
                                className={
                                  i < completados
                                      ? "bg-[#dc2626] h-0.5 flex-1"
                                      : "bg-neutral-800 h-0.5 flex-1"
                                }
                            />
                            <div
                                className={
                                  i < completados
                                      ? "bg-[#dc2626] flex h-10 w-10 items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                                      : "bg-neutral-800 flex h-10 w-10 items-center justify-center rounded-full"
                                }
                            >
                              {i < completados ? (
                                  <CheckCircle className="h-5 w-5 text-white" />
                              ) : (
                                  <Icono className="text-neutral-600 h-5 w-5" />
                              )}
                            </div>
                            <div
                                className={
                                  i < completados && i < PASOS.length - 1
                                      ? "bg-[#dc2626] h-0.5 flex-1"
                                      : i < PASOS.length - 1
                                          ? "bg-neutral-800 h-0.5 flex-1"
                                          : "h-0.5 flex-1"
                                }
                            />
                          </div>
                          <div className="text-center">
                            <p className={`font-bold ${i < completados ? "text-white" : "text-neutral-500"}`}>{titulo}</p>
                            <p className="text-neutral-500 mt-1 text-xs">
                              {key === "aprobado"
                                  ? formatearFechaHora(fechas.aprobado) ??
                                  "Pendiente"
                                  : fechas[key]
                                      ? formatearFecha(fechas[key])
                                      : key === "entregado"
                                          ? entregaEstimada
                                              ? `Entrega estimada: ${entregaEstimada}`
                                              : "Pendiente"
                                          : "Pendiente"}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>

            {/* Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl border border-neutral-800 bg-[#111] shadow-sm">
              <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                  Fecha
                </p>
                <p className="font-semibold text-white">
                  {formatearFecha(fechaIso) ?? "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                  Número de pedido
                </p>
                <p className="font-semibold text-white">{numero}</p>
              </div>
              <Button
                variant="outline"
                className="group flex w-full items-center justify-center gap-2 sm:max-w-fit border-neutral-800 bg-transparent text-neutral-400 hover:text-white hover:border-[#dc2626] transition-all"
                onClick={descargarFactura}
              >
                Descargar factura
                <Download className="h-4 w-4 stroke-2 transition-transform group-hover:translate-y-0.5" />
              </Button>
            </div>



            {/* Items List */}
            <div className="rounded-xl border border-neutral-800 bg-[#111] p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                  Productos del pedido
                </h3>
              </div>
              <div className="space-y-4">
                {items.map(({ nombre, imagen, detalle, talla, cantidad, precio }, key) => (
                  <div
                    key={key}
                    className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-black/20 p-4 transition-all hover:bg-black/40"
                  >
                    <div className="bg-neutral-900 relative flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-32 sm:w-24 border border-neutral-800">
                      {imagen ? (
                        <Image
                          src={imagen}
                          alt={nombre}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <Package className="text-neutral-700 h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-bold text-white">{nombre}</p>
                      {detalle && (
                        <p className="text-neutral-500 text-xs">
                          {detalle}
                        </p>
                      )}
                      {talla && (
                        <p className="text-neutral-500 text-xs">
                          Talla: {talla}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <p className="text-neutral-600 text-xs font-mono">
                          {cantidad}x
                        </p>
                        <p className="shrink-0 text-right font-bold text-white">
                          {formatearPrecio(precio * cantidad)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-4">
            {/* Dirección */}
            <div className="rounded-xl border border-neutral-800 bg-[#111] p-6 shadow-sm">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                Dirección de envío
              </p>
              <div className="grid grid-cols-1 gap-y-3 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-neutral-500 shrink-0">Nombre:</span>
                  <span className="font-medium text-white text-right break-words">{direccion.nombre}</span>
                </div>
                {direccion.correo && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-neutral-500 shrink-0">Correo:</span>
                    <span className="font-medium text-white text-right break-all">{direccion.correo}</span>
                  </div>
                )}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-neutral-500 shrink-0">Dirección:</span>
                  <span className="font-medium text-white text-right break-words">
                    {[direccion.direccion, direccion.barrio].filter(Boolean).join(", ") || "—"}
                    {direccion.ciudad || direccion.departamento
                      ? ` — ${[direccion.ciudad, direccion.departamento].filter(Boolean).join(", ")}`
                      : ""}
                  </span>
                </div>
                {direccion.telefono && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-neutral-500 shrink-0">Teléfono:</span>
                    <span className="font-medium text-white text-right">{direccion.telefono}</span>
                  </div>
                )}
                {direccion.notas && (
                  <div className="mt-2 p-3 rounded-lg bg-black/40 border border-neutral-800">
                    <span className="text-neutral-500 text-xs block mb-1">Notas:</span>
                    <span className="text-neutral-300 text-xs leading-relaxed">{direccion.notas}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pago */}
            <div className="rounded-xl border border-neutral-800 bg-[#111] p-6 shadow-sm">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                Método de pago
              </p>
              <div className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-black/40 p-4">
                <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-white p-1.5">
                  {metodo.logo ? (
                    <Image
                      src={metodo.logo}
                      alt={metodo.nombre}
                      width={56}
                      height={36}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Banknote className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-neutral-500 text-[10px] font-mono uppercase tracking-widest">
                    {metodo.nombre}
                  </p>
                  <p className="font-bold text-white">{metodo.linea}</p>
                  {metodo.detalle && (
                    <p className="text-neutral-500 text-xs">
                      {metodo.detalle}
                    </p>
                  )}
                  {metodo.ref && (
                    <p className="truncate font-mono text-[10px] text-neutral-600">
                      Ref: {metodo.ref}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="rounded-xl border border-neutral-800 bg-[#111] p-6 shadow-sm">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]">
                Resumen Financiero
              </p>
              <div className="space-y-2">
                {filasResumen.map(({ titulo, valor, gratis }, key) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-neutral-500">{titulo}</span>
                    {valor !== null && valor < 0 ? (
                      <span className="font-medium text-emerald-400">
                        −{formatearPrecio(-valor)}
                      </span>
                    ) : (
                      <span className="text-neutral-300">
                        {gratis ? "Gratis" : formatearPrecio(valor ?? 0)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-neutral-800 pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Total Final</span>
                <span className="text-2xl font-black text-white">
                  {formatearPrecio(total)}
                </span>
              </div>
              {notaMetodo && (
                <p className="mt-4 border-t border-yellow-900/30 bg-yellow-950/20 p-3 text-[11px] text-yellow-500/80 leading-relaxed">
                  {notaMetodo}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
