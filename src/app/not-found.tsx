import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página No Encontrada",
  description: "La página que buscas no existe o ha sido movida.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-[10rem] font-black leading-none bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent animate-pulse max-md:text-[6rem]">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mt-4 mb-4">
          Página No Encontrada
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
          Parece que se perdió en el ruido.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-8 py-3 rounded-md font-bold text-base border-2 border-primary transition-all duration-300 hover:bg-primary hover:border-primary no-underline"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
