"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isRunningStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);

const subscribe = () => () => {};

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      const dismissedAt = localStorage.getItem("pwa_prompt_dismissed_at");
      if (dismissedAt) {
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() - parseInt(dismissedAt, 10) < fiveMinutes;
      }
    }
    return false;
  });

  const showIosHint = useSyncExternalStore(
    subscribe,
    () => isIOS() && !isRunningStandalone(),
    () => false,
  );

  useEffect(() => {
    if (isRunningStandalone()) return;

    const onBeforeInstall = (event: Event) => {
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setDismissed(true);
    };
    const onDisplayModeChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setInstallPrompt(null);
        setDismissed(true);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window
        .matchMedia("(display-mode: standalone)")
        .removeEventListener("change", onDisplayModeChange);
    };
  }, []);

  if (dismissed) return null;
  if (!installPrompt && !showIosHint) return null;

  const handleDismiss = () => {
    localStorage.setItem("pwa_prompt_dismissed_at", Date.now().toString());
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setDismissed(true);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 cursor-pointer" 
        aria-hidden="true" 
        onClick={handleDismiss}
      />
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-[340px] border border-white/10 bg-[#111] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-500 ease-out">
        {/* Handle decorativo para dar sensación de "Bottom Sheet" */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" />
        
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar aviso de instalación"
          className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors p-1"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4 mt-1">
          <div className="relative shrink-0">
            <Image
              src="/logo_punk_medallo.jpg"
              alt="Punk Medallo"
              width={52}
              height={52}
              className="rounded-xl shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#a40202] p-1 rounded-full border-2 border-[#111]">
              <Download size={10} className="text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base text-white uppercase tracking-tight">
              Punk Medallo
            </p>
            {installPrompt ? (
              <p className="mt-0.5 text-xs text-white/60 leading-relaxed">
                Instala la app para entrar directo a la radio, el archivo y la tienda.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-white/60 leading-relaxed">
                Toca <Share size={11} className="inline text-white/70" />{" "}
                Compartir y elige{" "}
                <span className="text-white/90 font-medium">Añadir a pantalla de inicio</span>.
              </p>
            )}
          </div>
        </div>

        {installPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-4 flex w-full items-center justify-center gap-2 bg-[#a40202] text-white font-bold tracking-wider uppercase px-4 py-3 rounded-xl text-xs transition-all duration-300 hover:bg-[#cc0303] active:scale-95 shadow-[0_4px_12px_rgba(164,2,2,0.3)]"
          >
            <Download size={14} />
            Instalar Aplicación
          </button>
        )}
      </div>
    </>
  );
}
