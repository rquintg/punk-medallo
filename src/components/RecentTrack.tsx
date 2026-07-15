"use client";

import { useState } from "react";
import SpinnerLoader from "@/components/util/SpinnerLoader";

export default function RecentTrack() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center bg-[rgba(7,7,7,0.56)] rounded-lg shadow-[0px_0px_6px_6px_rgba(0,0,0,0.75)] p-[10px] pb-[5px] text-center w-[90vw] h-[330px] max-w-[500px] text-white lg:block lg:text-center lg:w-[40vw] lg:max-w-[715px]">
      <h6 className="text-[#ff0000] bg-[rgba(7,7,7,0.782)] rounded-[10px] text-center font-bold mb-[15px] w-[calc(100%-20px)] lg:bg-transparent lg:text-right lg:mb-3">
        Sonó hace poco
      </h6>

      {isLoading && <SpinnerLoader />}

      <div className="w-full flex-1 overflow-auto rounded-md">
        <iframe
          src="https://a3.asurahosting.com/public/punk_medallo/history?theme=dark"
          title="Historial de canciones"
          className="w-full h-full border-none rounded-md md:h-[318px]"
          onLoad={handleLoad}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
          aria-label="Historial de reproducción de Punk Medallo"
          style={{ backgroundColor: "transparent" }}
        />
      </div>
    </div>
  );
}
