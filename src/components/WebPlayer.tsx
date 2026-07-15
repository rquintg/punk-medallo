"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import useCurrentTrack from "@/hooks/useCurrentTrack";

const STREAM_URL =
  "https://a3.asurahosting.com/listen/punk_medallo/radio.mp3";

export default function WebPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isOnline, setIsOnline] = useState(true);
  const [showNext, setShowNext] = useState(false);
  const { currentTrack, nextTrack, isLoading } = useCurrentTrack();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => setIsOnline(true);
    const onCanPlay = () => setIsOnline(true);
    const onError = () => setIsOnline(false);

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);
    audio.volume = volume;

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, [volume]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNext((prev) => !prev);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        if (audio.src !== STREAM_URL) audio.src = STREAM_URL;
        await audio.play();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
      setIsOnline(false);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const track = showNext ? nextTrack : currentTrack;
  const trackLabel = showNext ? "Próxima:" : "Está sonando:";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[1100] bg-[#111] border-t-2 border-[#c40000] flex justify-start px-3 py-2 shadow-[0_-2px_6px_rgba(0,0,0,0.6)]"
      role="region"
      aria-label="Reproductor de radio"
    >
      <div className="flex items-center justify-start gap-3 w-full ml-4">
        {/* Status */}
        <div className="flex items-center gap-1.5 min-w-[95px] max-sm:min-w-[75px]">
          <span
            className={`w-2.5 h-2.5 rounded-full inline-block ${
              isOnline
                ? "bg-[#ff1c1c] shadow-[0_0_6px_2px_rgba(255,0,0,0.6)] animate-pulse"
                : "bg-[#555]"
            }`}
          />
          <span
            className={`text-[11px] font-bold tracking-[0.5px] max-sm:text-[10px] ${
              isOnline ? "text-[#ff2e2e]" : "text-[#777]"
            }`}
          >
            {isOnline ? "EN VIVO" : "FUERA DE LÍNEA"}
          </span>
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="bg-[#c40000] text-white border-none w-[41px] h-[41px] rounded cursor-pointer flex items-center justify-center text-lg shadow-[0_4px_10px_rgba(196,0,0,0.35)] transition-all duration-200 hover:bg-[#e00000] hover:scale-105 hover:shadow-[0_6px_14px_rgba(224,0,0,0.5)] active:scale-[0.93] focus:outline-2 focus:outline-[#ff3b3b] focus:outline-offset-2 max-sm:w-[34px] max-sm:h-[34px] max-sm:text-sm"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          title={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        {/* Track Info */}
        <div className="flex flex-col justify-center flex-1 min-w-0 max-w-[600px] ml-3 max-sm:max-w-[160px] max-sm:ml-2 max-[380px]:hidden">
          {isLoading ? (
            <span className="text-[#888] text-[11px] italic">Cargando...</span>
          ) : track ? (
            <div className="flex flex-col justify-start min-w-0 flex-1 animate-[fadeInTrack_0.5s_ease-in-out_forwards]">
              <span className="text-[#ff3b3b] text-[10px] font-bold tracking-[0.5px] uppercase mb-0.5 block max-sm:text-[8px]">
                {trackLabel}
              </span>
              <p className="text-white text-sm font-semibold truncate m-0 leading-tight max-sm:text-[10px]">
                {track.title}
              </p>
              <p className="text-[#aaa] text-[11px] truncate m-0 leading-tight max-sm:text-[9px]">
                {track.artist}
              </p>
            </div>
          ) : (
            <span className="text-[#888] text-[11px] italic">
              Sin información
            </span>
          )}
        </div>

        {/* Volume */}
        <div
          className="flex items-center gap-1.5 ml-auto max-sm:hidden"
          aria-label="Control de volumen"
        >
          <span className="text-[#ff3b3b]" aria-hidden>
            <Volume2 size={16} />
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            className="w-[90px] accent-[#ff2e2e] cursor-pointer max-md:w-[70px] focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff2e2e] [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(255,0,0,0.4)]"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={volume}
          />
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} preload="none" />
      </div>
    </div>
  );
}
