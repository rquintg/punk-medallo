"use client";

import { useState, useEffect } from "react";

interface Track {
  title: string;
  artist: string;
}

export default function useCurrentTrack() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [nextTrack, setNextTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTracks = async () => {
      try {
        const response = await fetch(
          "https://a3.asurahosting.com/api/nowplaying/punk_medallo"
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (!isMounted) return;

        if (data?.now_playing?.song) {
          setCurrentTrack({
            title: data.now_playing.song.title || "Canción desconocida",
            artist: data.now_playing.song.artist || "Artista desconocido",
          });
        }

        if (data?.playing_next?.song) {
          setNextTrack({
            title: data.playing_next.song.title || "Canción desconocida",
            artist: data.playing_next.song.artist || "Artista desconocido",
          });
        }
      } catch {
        if (!isMounted) return;
        setCurrentTrack(null);
        setNextTrack(null);
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

  return { currentTrack, nextTrack, isLoading };
}
