"use client";

import { useState } from "react";
import SongRequest from "@/components/SongRequest";

export default function HomeSongButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden max-md:block w-full max-w-[300px] border-2 border-[#a40202] text-[#ff4444] font-bold tracking-[0.5px] uppercase px-4 py-3 text-sm rounded transition-all duration-300 backdrop-blur bg-[rgba(164,2,2,0.1)] hover:bg-[rgba(164,2,2,0.25)] hover:border-[#ff4444] hover:shadow-[0_0_15px_rgba(164,2,2,0.4)] hover:-translate-y-[2px] active:translate-y-0 focus:shadow-[0_0_0_0.25rem_rgba(164,2,2,0.25)]"
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
