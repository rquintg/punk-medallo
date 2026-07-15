import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import StaffComponent from "@/components/StaffComponent";

export const metadata: Metadata = {
  title: "Contacto - Punk Medallo",
  description:
    "Ponte en contacto con el equipo de Punk Medallo. Envía tus sugerencias, comentarios o consultas sobre nuestra radio punk.",
  openGraph: {
    title: "Contacto - Punk Medallo",
    description:
      "Ponte en contacto con el equipo de Punk Medallo.",
    images: [
      {
        url: "https://punkmedallo.com/logo_punk_medallo.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
      },
    ],
  },
};

export default function Contacto() {
  return (
    <>
      <div
        className="relative h-[58vh] pt-20 bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/50 before:z-[-1] before:pointer-events-none"
        style={{ backgroundImage: "url('/images/fondo.jpeg')" }}
      >
        <ContactForm />
      </div>
      <div className="max-w-[90rem] mx-auto my-20 max-md:my-52 max-md:mx-0">
        <StaffComponent />
      </div>
    </>
  );
}
