import { NextResponse } from "next/server";
import { fetchBlogPosts } from "@/lib/axiosBlog";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pageToken = url.searchParams.get("pageToken");

    const data = await fetchBlogPosts(pageToken);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("/api/descargas error:", error);
    return NextResponse.json({ error: "Error fetching blog posts" }, { status: 500 });
  }
}

