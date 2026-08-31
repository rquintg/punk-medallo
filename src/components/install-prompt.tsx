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
  const [dismissed, setDismissed] = useState(false);

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

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[1200] w-[calc(100%-2rem)] max-w-[340px] border border-[rgba(164,2,2,0.4)] bg-[#111] rounded-lg p-4 shadow-[0_0_25px_rgba(164,2,2,0.15)]">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso de instalación"
        className="absolute top-2 right-2 text-white/50 hover:text-[#ff4444] transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <Image
          src="/logo_punk_medallo.jpg"
          alt="Punk Medallo"
          width={44}
          height={44}
          className="rounded shrink-0"
        />
        <div className="min-w-0">
          <p className="font-bold text-sm text-white uppercase tracking-wide">
            Punk Medallo
          </p>
          {installPrompt ? (
            <p className="mt-0.5 text-xs text-white/60">
              Instala la app para entrar directo a la radio al archivo y a la tienda.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-white/60">
              Toca <Share size={11} className="inline text-white/70" />{" "}
              Compartir y elige{" "}
              <span className="text-white/90">Añadir a pantalla de inicio</span>.
            </p>
          )}
        </div>
      </div>

      {installPrompt && (
        <button
          type="button"
          onClick={handleInstall}
          className="mt-3 flex w-full items-center justify-center gap-2 border border-[#a40202] text-[#ff4444] font-bold tracking-[0.5px] uppercase px-4 py-2 rounded text-xs transition-all duration-300 bg-[rgba(164,2,2,0.1)] hover:bg-[rgba(164,2,2,0.25)] hover:border-[#ff4444]"
        >
          <Download size={14} />
          Instalar app
        </button>
      )}
    </div>
  );
}
