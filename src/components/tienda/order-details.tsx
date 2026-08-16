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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

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
  direccionLineas: string[];
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
  direccionLineas,
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

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const completados = PASOS_COMPLETADOS[estado] ?? 0;

  const descargarFactura = () => {
    const lineas = [
      "PUNK MEDALLO",
      `Pedido ${numero}`,
      `Fecha: ${formatearFechaHora(fechas.aprobado ?? null) ?? subtitulo}`,
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
      ...direccionLineas,
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
        <h2 className="md:text-4xl text-3xl font-bold">Detalle del pedido</h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {subtitulo}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Fecha
                </p>
                <p className="mt-1 font-semibold">
                  {formatearFecha(fechaIso) ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Número de pedido
                </p>
                <p className="mt-1 font-semibold">{numero}</p>
              </div>
              <Button
                variant="outline"
                className="group flex w-full items-center gap-2 sm:max-w-fit"
                onClick={descargarFactura}
              >
                Descargar factura
                <Download className="h-4 w-4 stroke-2 transition-transform group-hover:translate-y-0.5" />
              </Button>
            </Card>
            <Card>
              <CardHeader className="m-0 w-full space-y-6 rounded-none border-b p-6">
                {isVertical ? (
                  <div className="space-y-6">
                    {PASOS.map(({ key, icono: Icono, titulo }, i) => (
                      <div key={key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={
                              i < completados
                                ? "bg-primary flex h-10 w-10 items-center justify-center rounded-full"
                                : "bg-muted flex h-10 w-10 items-center justify-center rounded-full"
                            }
                          >
                            {i < completados ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <Icono className="text-muted-foreground h-5 w-5" />
                            )}
                          </div>
                          {i < PASOS.length - 1 && (
                            <div
                              className={
                                i < completados
                                  ? "bg-primary my-2 w-0.5 flex-1"
                                  : "bg-muted my-2 w-0.5 flex-1"
                              }
                            />
                          )}
                        </div>
                        <div className={i < PASOS.length - 1 ? "pb-6" : ""}>
                          <p className="font-semibold">{titulo}</p>
                          <p className="text-muted-foreground mt-2 text-sm">
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
                              i === 0
                                ? "bg-primary h-0.5 flex-1"
                                : i < completados
                                  ? "bg-primary h-0.5 flex-1"
                                  : "bg-muted h-0.5 flex-1"
                            }
                          />
                          <div
                            className={
                              i < completados
                                ? "bg-primary flex h-10 w-10 items-center justify-center rounded-full"
                                : "bg-muted flex h-10 w-10 items-center justify-center rounded-full"
                            }
                          >
                            {i < completados ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <Icono className="text-muted-foreground h-5 w-5" />
                            )}
                          </div>
                          <div
                            className={
                              i < completados && i < PASOS.length - 1
                                ? "bg-primary h-0.5 flex-1"
                                : "h-0.5 flex-1"
                            }
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{titulo}</p>
                          <p className="text-muted-foreground mt-2 text-sm">
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
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-xl font-bold">Productos</h3>
                </div>
                <div className="space-y-4">
                  {items.map(({ nombre, imagen, detalle, talla, cantidad, precio }, key) => (
                    <div
                      key={key}
                      className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-md"
                    >
                      <div className="bg-muted/50 relative flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-32 sm:w-24">
                        {imagen ? (
                          <Image
                            src={imagen}
                            alt={nombre}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <Package className="text-muted-foreground h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-semibold">{nombre}</p>
                        {detalle && (
                          <p className="text-muted-foreground text-sm">
                            {detalle}
                          </p>
                        )}
                        {talla && (
                          <p className="text-muted-foreground text-sm">
                            Talla: {talla}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between gap-4">
                          <p className="text-muted-foreground text-sm">
                            {cantidad}x
                          </p>
                          <p className="shrink-0 text-right font-semibold">
                            {formatearPrecio(precio * cantidad)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6 lg:col-span-4">
            <Card>
              <CardHeader className="m-0 flex w-full items-center justify-between p-6">
                <h3 className="text-lg font-semibold">Dirección de envío</h3>
              </CardHeader>
              <CardContent className="space-y-1 px-6 pt-0 pb-6">
                {direccionLineas.map((linea, key) => (
                  <p key={key} className="text-muted-foreground text-sm">
                    {linea}
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="m-0 flex w-full items-center justify-between p-6">
                <h3 className="text-lg font-semibold">Método de pago</h3>
              </CardHeader>
              <CardContent className="space-y-1 px-6 pt-0 pb-6">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md bg-white p-1.5">
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
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      {metodo.nombre}
                    </p>
                    <p className="font-semibold">{metodo.linea}</p>
                    {metodo.detalle && (
                      <p className="text-muted-foreground text-sm">
                        {metodo.detalle}
                      </p>
                    )}
                    {metodo.ref && (
                      <p className="truncate font-mono text-xs text-muted-foreground/70">
                        Ref: {metodo.ref}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4 p-6">
                <h3 className="text-xl font-bold">Resumen</h3>
                {filasResumen.map(({ titulo, valor, gratis }, key) => (
                  <div key={key} className="flex justify-between text-sm">
                    <p className="text-muted-foreground">{titulo}</p>
                    {valor !== null && valor < 0 ? (
                      <p className="font-medium text-emerald-400">
                        −{formatearPrecio(-valor)}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        {gratis ? "Gratis" : formatearPrecio(valor ?? 0)}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="border-t p-6">
                <div className="flex w-full justify-between">
                  <p className="font-semibold">Total</p>
                  <p className="text-xl font-bold">{formatearPrecio(total)}</p>
                </div>
              </CardFooter>
              {notaMetodo && (
                <p className="border-t border-yellow-900/60 bg-yellow-950/40 px-6 py-3 text-xs text-yellow-400">
                  {notaMetodo}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}