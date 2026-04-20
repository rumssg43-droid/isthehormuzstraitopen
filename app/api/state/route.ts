import { NextResponse } from "next/server";
import { getVerdict } from "@/lib/verdict";

export const revalidate = 3600;

export async function GET() {
  const v = await getVerdict();
  return NextResponse.json(
    {
      state: v.state,
      confidence: v.confidence,
      reasoning: v.reasoning,
      brent: v.signals.brent,
      headlines_matched: v.signals.headlineCount,
      sources: v.sources,
      checked_at: v.checkedAt,
      site: "https://www.isthehormuzstraitopen.net",
    },
    {
      headers: {
        "cache-control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET",
      },
    },
  );
}
