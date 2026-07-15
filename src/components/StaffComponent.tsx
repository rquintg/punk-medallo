import Image from "next/image";
import Link from "next/link";

export default function StaffComponent() {
  return (
    <div className="max-w-[90rem] mx-auto my-6 text-white">
      <div className="p-8 rounded-2xl bg-[rgba(7,7,7,0.56)] shadow-[0px_0px_6px_6px_rgba(0,0,0,0.75)] text-center">
        <h2 className="font-bold text-[calc(1.1rem+0.7vw)] mb-6">De interes</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Eventos */}
          <div className="flex flex-col items-center">
            <a
              href="https://www.instagram.com/punk.medallo"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <h3 className="text-[#ff3200] font-normal my-4 text-[calc(1.1rem+0.5vw)]">
                Cartelera de Eventos
              </h3>
              <div className="flex justify-center">
                <Image
                  src="/images/toques.webp"
                  alt="radio ruidosa"
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-full object-cover"
                />
              </div>
            </a>
            <p className="leading-8 text-center text-white">
              Siguenos, escucha, apoya y difunde.
            </p>
          </div>

          {/* Blog */}
          <div className="flex flex-col items-center">
            <a
              href="https://punk-medallo.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <h3 className="text-[#ff3200] font-normal my-4 text-[calc(1.1rem+0.5vw)]">Blog</h3>
              <div className="flex justify-center">
                <Image
                  src="/images/blog.jpg"
                  alt="punk_en_las_venas"
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-full object-cover"
                />
              </div>
            </a>
            <p className="leading-8 text-center text-white">
              Nuevo material disponible para descargar y links actualizados.
            </p>
          </div>

          {/* Páginas Amigas */}
          <div className="flex flex-col items-center">
            <Link href="/amigos" className="no-underline">
              <h3 className="text-[#ff3200] font-normal my-4 text-[calc(1.1rem+0.5vw)]">
                Páginas Amigas
              </h3>
              <div className="flex justify-center">
                <Image
                  src="/images/logo_punk_medallo.jpg"
                  alt="páginas amigas"
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-full object-cover"
                />
              </div>
            </Link>
            <p className="leading-8 text-center text-white">
              Conecta con proyectos independientes y alternativos que comparten
              nuestro espíritu punk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
