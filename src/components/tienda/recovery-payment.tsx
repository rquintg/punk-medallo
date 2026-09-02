"use client";

import { useState, useRef, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loadWompiScript } from "@/lib/wompi-client";

interface RecoveryPaymentProps {
  numeroPedido: string;
}

export default function RecoveryPayment({ numeroPedido }: RecoveryPaymentProps) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const closeGuardRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (closeGuardRef.current) clearTimeout(closeGuardRef.current);
  }, []);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/recuperar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_pedido: numeroPedido }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo preparar el pago");
        setIsPaying(false);
        return;
      }

      await loadWompiScript();
      if (typeof window.WidgetCheckout === "undefined") {
        throw new Error("El widget de Wompi no cargó (¿bloqueador de anuncios o red?)");
      }

      const checkout = new window.WidgetCheckout({
        currency: data.wompi.currency,
        amountInCents: data.wompi.amountInCents,
        reference: data.wompi.reference,
        publicKey: data.wompi.publicKey,
        signature: data.wompi.signature,
        redirectUrl: data.wompi.redirectUrl || `${window.location.origin}/tienda/compra`,
        customerData: data.wompi.customerData,
      });

      closeGuardRef.current = setTimeout(() => setIsPaying(false), 30000);

      checkout.open((result) => {
        if (closeGuardRef.current) clearTimeout(closeGuardRef.current);
        setIsPaying(false);
        const txId = (result as unknown as { transaction?: { id: string } })?.transaction?.id || numeroPedido;
        router.push(`/tienda/compra?id=${txId}`);
      });
    } catch (err) {
      console.error("Wompi Widget error:", err);
      toast.error(err instanceof Error ? err.message : "Hubo un error al iniciar el pago. Por favor intenta de nuevo.");
      setIsPaying(false);
    }
  };

  return (
    <div className="mt-6 w-full">
      <button
        onClick={handlePayment}
        disabled={isPaying}
        className="w-full group relative flex items-center justify-center gap-3 bg-[#dc2626] hover:bg-red-700 disabled:bg-neutral-800 text-white font-black uppercase italic tracking-tight py-4 px-6 rounded-xl transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(220,38,38,0.3)]"
      >
        {isPaying ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Procesando...
          </span>
        ) : (
          <>
            <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
            <span>Completar Pago Ahora</span>
          </>
        )}
      </button>
      <p className="mt-4 text-center text-[11px] font-mono uppercase tracking-widest text-neutral-500">
        Pasarela Segura Wompi
      </p>
    </div>
  );
}
