import { NextResponse } from "next/server";
import { fetchFacebookPageComentarios } from "@/lib/axiosFacebook";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const { total, items } = await fetchFacebookPageComentarios(id);

    return NextResponse.json(
      { total, items },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error(`/api/fotos/comentarios error (${id}):`, error);
    return NextResponse.json(
      { error: "Error fetching comments from Facebook" },
      { status: 500 }
    );
  }
}