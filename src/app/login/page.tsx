import type { Metadata } from "next";
import LoginFormWrapper from "./login-form";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Ingresar - Punk Medallo",
    description:
      "Ingresa a tu cuenta de Punk Medallo para comprar en la tienda y gestionar tus pedidos.",
    url: "/login",
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
    title: "Ingresar - Punk Medallo",
    description:
      "Ingresa a tu cuenta de Punk Medallo para comprar en la tienda y gestionar tus pedidos.",
    images: ["https://punkmedallo.com/logo_punk_medallo.jpg"],
  },
};

export default function LoginPage() {
  return <LoginFormWrapper />;
}
