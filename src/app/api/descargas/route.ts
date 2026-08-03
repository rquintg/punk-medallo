import { NextResponse } from "next/server";
import { getAlbumsPage } from "@/features/descargas/services/albums";
import type { OrderBy } from "@/features/descargas/types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pageToken = url.searchParams.get("pageToken");
    const q = url.searchParams.get("q");
    const letra = url.searchParams.get("letra");
    const formato = url.searchParams.get("formato");
    const banda = url.searchParams.get("banda");
    const year = url.searchParams.get("year");
    const rawOrder = url.searchParams.get("orderBy");
    const orderBy: OrderBy = rawOrder === "updated" ? "updated" : "published";

    const data = await getAlbumsPage({
      pageToken,
      q,
      letra,
      formato,
      banda,
      year,
      orderBy,
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("/api/descargas error:", error);
    return NextResponse.json(
      { error: "Error fetching blog posts" },
      { status: 500 }
    );
  }
}
