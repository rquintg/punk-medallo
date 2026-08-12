import { NextResponse } from "next/server";
import { fetchFacebookPage, fetchFacebookPageTop } from "@/lib/axiosFacebook";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  try {
    if (tipo === "top") {
      const items = await fetchFacebookPageTop({ limit: 6, maxPaginas: 3 });
      return NextResponse.json(
        { items, next: null },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
          },
        }
      );
    }

    const modo = tipo === "videos" ? "videos" : "fotos";
    const after = searchParams.get("after");
    const { items, next } = await fetchFacebookPage(modo, { after });

    return NextResponse.json(
      { items, next },
      {
        status: 200,
        headers: {
          // Cache at CDN/edge for 10 minutes and allow stale while revalidate briefly
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error(`/api/fotos error (${tipo}):`, error);
    return NextResponse.json(
      { error: "Error fetching media from Facebook" },
      { status: 500 }
    );
  }
}