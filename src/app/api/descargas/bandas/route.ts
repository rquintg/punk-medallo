import { NextResponse } from "next/server";
import { getArchive } from "@/features/descargas/services/archivo";
import type { BandInfo } from "@/features/descargas/types";

export async function GET() {
  try {
    const archive = await getArchive();
    const payload: { bands: BandInfo[]; totalPosts: number } = {
      bands: archive.bands,
      totalPosts: archive.totalPosts,
    };
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("/api/descargas/bandas error:", error);
    return NextResponse.json(
      { error: "Error fetching bands" },
      { status: 500 }
    );
  }
}
