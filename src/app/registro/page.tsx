import type { Metadata } from "next";
import RegisterForm from "./registro-form";

export const metadata: Metadata = {
  title: "Crear cuenta - Punk Medallo",
  description:
    "Crea tu cuenta en Punk Medallo para comprar en la tienda y seguir tus pedidos.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/registro",
  },
  openGraph: {
    title: "Crear cuenta - Punk Medallo",
    description:
      "Crea tu cuenta en Punk Medallo para comprar en la tienda y seguir tus pedidos.",
    url: "/registro",
    type: "website",
    locale: "es_CO",
    siteName: "Punk Medallo",
    images: [
      {
        url: "https://punkmedallo.com/logo_punk_medallo.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crear cuenta - Punk Medallo",
    description:
      "Crea tu cuenta en Punk Medallo para comprar en la tienda y seguir tus pedidos.",
    images: ["https://punkmedallo.com/logo_punk_medallo.jpg"],
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
