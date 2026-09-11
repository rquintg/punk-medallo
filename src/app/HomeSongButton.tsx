"use client";

import { useState } from "react";
import SongRequest from "@/components/SongRequest";

export default function HomeSongButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden max-md:block w-full max-w-[300px] border-2 border-primary text-primary font-bold tracking-[0.5px] uppercase px-4 py-3 text-sm rounded transition-all duration-300 backdrop-blur bg-primary/10 hover:bg-primary/25 hover:border-primary hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:-translate-y-[2px] active:translate-y-0 focus:shadow-[0_0_0_0.25rem_rgba(220,38,38,0.25)]"
      >
        Pide tu canción
      </button>
      <SongRequest
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
