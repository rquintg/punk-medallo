"use client";

import { useState, useEffect } from "react";
import { NOWPLAYING_URL } from "@/lib/azuracast";

export interface Track {
  title: string;
  artist: string;
  album?: string;
  art?: string | null;
  isRequest?: boolean;
}

export interface HistoryTrack extends Track {
  playedAt?: number;
}

export default function useCurrentTrack() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [nextTrack, setNextTrack] = useState<Track | null>(null);
  const [history, setHistory] = useState<HistoryTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTracks = async () => {
      try {
        const response = await fetch(NOWPLAYING_URL, { cache: "no-store" });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (!isMounted) return;

        if (data?.now_playing?.song) {
          setCurrentTrack({
            title: data.now_playing.song.title || "Canción desconocida",
            artist: data.now_playing.song.artist || "Artista desconocido",
            album: data.now_playing.song.album || undefined,
            art: data.now_playing.song.art || null,
            isRequest: Boolean(data.now_playing.is_request ?? data.now_playing.song.is_request),
          });
        }

        if (data?.playing_next?.song) {
          setNextTrack({
            title: data.playing_next.song.title || "Canción desconocida",
            artist: data.playing_next.song.artist || "Artista desconocido",
            album: data.playing_next.song.album || undefined,
            art: data.playing_next.song.art || null,
            isRequest: Boolean(data.playing_next.is_request ?? data.playing_next.song.is_request),
          });
        }

        if (Array.isArray(data?.song_history)) {
          const h: HistoryTrack[] = data.song_history
            .slice(0, 10)
            .map(
              (item: {
                song?: { title?: string; artist?: string; album?: string; art?: string | null; is_request?: boolean };
                is_request?: boolean;
                played_at?: number;
              }) => ({
                title: item.song?.title || "Canción desconocida",
                artist: item.song?.artist || "Artista desconocido",
                album: item.song?.album || undefined,
                art: item.song?.art || null,
                playedAt: item.played_at,
                isRequest: Boolean(item.is_request ?? item.song?.is_request),
              }),
            );
          setHistory(h);
        }
      } catch {
        if (!isMounted) return;
        setCurrentTrack(null);
        setNextTrack(null);
        setHistory([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTracks();
    const interval = setInterval(fetchTracks, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { currentTrack, nextTrack, history, isLoading };
}
