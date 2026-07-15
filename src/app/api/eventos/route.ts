import { NextResponse } from "next/server";
import { fetchInstagramPhotos } from "@/lib/axiosInstagram";

export async function GET() {
  try {
    const photos = await fetchInstagramPhotos();

    return NextResponse.json(
      { photos },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("/api/eventos error:", error);
    return NextResponse.json({ error: "Error fetching Instagram photos" }, { status: 500 });
  }
}

