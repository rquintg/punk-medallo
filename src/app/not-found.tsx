import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página No Encontrada",
  description: "La página que buscas no existe o ha sido movida.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-[10rem] font-black leading-none bg-gradient-to-r from-[#a40202] via-[#ff4444] to-[#a40202] bg-clip-text text-transparent animate-pulse max-md:text-[6rem]">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mt-4 mb-4">
          Página No Encontrada
        </h2>
        <p className="text-[#d0d0d0] text-lg leading-relaxed mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
          Parece que se perdió en el ruido.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#a40202] text-white px-8 py-3 rounded-md font-bold text-base border-2 border-[#a40202] transition-all duration-300 hover:bg-[#ff6b6b] hover:border-[#ff6b6b] no-underline"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
