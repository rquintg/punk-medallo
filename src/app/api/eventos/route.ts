import { NextResponse } from "next/server";
import { fetchInstagramPhotos } from "@/lib/axiosInstagram";
import { parseCaptionEventos } from "@/features/eventos/parse-caption";

export async function GET() {
  try {
    const photos = await fetchInstagramPhotos();
    const eventos = parseCaptionEventos(photos);

    return NextResponse.json(
      { eventos },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("/api/eventos error:", error);
    return NextResponse.json({ error: "Error fetching Instagram photos" }, { status: 500 });
  }
}
