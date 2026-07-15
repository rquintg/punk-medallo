import { NextResponse } from "next/server";
import { fetchFacebookPhotos } from "@/lib/axiosFacebook";

export async function GET() {
  try {
    const photos = await fetchFacebookPhotos();

    return NextResponse.json(
      { photos },
      {
        status: 200,
        headers: {
          // Cache at CDN/edge for 10 minutes and allow stale while revalidate briefly
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("/api/fotos error:", error);
    return NextResponse.json(
      { error: "Error fetching photos from Facebook" },
      { status: 500 }
    );
  }
}

