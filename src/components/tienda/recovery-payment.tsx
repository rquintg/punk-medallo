"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

interface RecoveryPaymentProps {
  wompi: {
    publicKey: string;
    amountInCents: number;
    currency: string;
    reference: string;
    signature: { integrity: string };
    redirectUrl: string;
  };
}

export default function RecoveryPayment({ wompi }: RecoveryPaymentProps) {
  const [isPaying, setIsPaying] = useState(false);

  const handlePayment = async () => {
    setIsPaying(true);
    
    if (!window.Wompi) {
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widgets/checkout.js";
      script.async = true;
      script.onload = () => initiateWompi();
      document.body.appendChild(script);
    } else {
      initiateWompi();
    }
  };

  const initiateWompi = () => {
    try {
      (window as any).Wompi.checkout({
        amountInCents: wompi.amountInCents,
        currency: wompi.currency,
        reference: wompi.reference,
        publicKey: wompi.publicKey,
        signature: wompi.signature,
        redirectUrl: wompi.redirectUrl,
      });
    } catch (err) {
      console.error("Wompi Widget error:", err);
      alert("Hubo un error al iniciar el pago. Por favor intenta de nuevo.");
    } finally {
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

declare global {
  interface Window {
    Wompi?: any;
  }
}
