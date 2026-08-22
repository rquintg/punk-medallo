import type { Metadata } from "next";
import RegisterForm from "./registro-form";
import { ogImageActual } from "@/features/tienda/utils/seo";

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await ogImageActual();
  return {
    title: "Crear cuenta",
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
          url: ogImage,
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
      images: [ogImage],
    },
  };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
