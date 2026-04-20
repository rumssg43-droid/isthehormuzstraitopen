import { unstable_noStore as noStore } from "next/cache";
import { ImageResponse } from "next/og";
import { getVerdict, type VerdictState } from "@/lib/verdict";

export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Is the Strait of Hormuz open? — live answer";

const STATE_STYLE: Record<
  VerdictState,
  { bg: string; fg: string; fontSize: number }
> = {
  YES: { bg: "#22c55e", fg: "#ffffff", fontSize: 400 },
  NO: { bg: "#dc2626", fg: "#ffffff", fontSize: 500 },
  KINDA: { bg: "#fbbf24", fg: "#000000", fontSize: 260 },
  UNKNOWN: { bg: "#6b7280", fg: "#ffffff", fontSize: 180 },
};

export default async function Image() {
  const verdict = await getVerdict();
  if (verdict.state === "UNKNOWN") {
    noStore();
  }
  const style = STATE_STYLE[verdict.state];

  return new ImageResponse(
    (
      <div
        style={{
          background: style.bg,
          color: style.fg,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 36,
            opacity: 0.9,
            marginBottom: 10,
            letterSpacing: -1,
          }}
        >
          Is the Strait of Hormuz open?
        </div>
        <div
          style={{
            fontSize: style.fontSize,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -8,
          }}
        >
          {verdict.state}
        </div>
        <div
          style={{
            fontSize: 24,
            opacity: 0.8,
            marginTop: 20,
          }}
        >
          www.isthehormuzstraitopen.net · updated hourly
        </div>
      </div>
    ),
    { ...size },
  );
}
