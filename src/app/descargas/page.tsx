import type { Metadata } from "next";
import DescargasContent from "./DescargasContent";
import { fetchBlogPosts } from "@/lib/axiosBlog";
import type { BlogPost } from "@/lib/axiosBlog";

export const revalidate = 600;
export const metadata: Metadata = {
  title: "Descargar Música - Punk Medallo",
  description:
    "Descarga y disfruta de la mejor música punk de Medellín. Accede a nuestro catálogo completo de artistas locales y bandas underground.",
  openGraph: {
    title: "Descargar Música - Punk Medallo",
    description:
      "Descarga y disfruta de la mejor música punk de Medellín.",
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

export default async function Descargas() {
  let posts: BlogPost[] = [];
  try {
    const data = await fetchBlogPosts();
    posts = data.items || [];
  } catch (error) {
    console.error("Error fetching initial blog posts:", error);
  }

  return <DescargasContent initialPosts={posts} />;
}
