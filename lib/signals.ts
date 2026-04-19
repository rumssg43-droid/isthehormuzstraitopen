export type BrentSignal = {
  price: number;
  change24h: number;
  change7d: number;
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: (number | null)[];
        }>;
      };
    }>;
  };
};

export async function fetchBrent(): Promise<BrentSignal | null> {
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=10d",
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; is-hormuz-open/1.0; +https://www.isthehormuzstraitopen.net)",
        },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as YahooChartResponse;
    const result = json.chart?.result?.[0];
    const meta = result?.meta;
    const rawCloses = result?.indicators?.quote?.[0]?.close ?? [];
    const closes = rawCloses.filter(
      (n): n is number => typeof n === "number" && Number.isFinite(n),
    );
    const current = meta?.regularMarketPrice;
    if (typeof current !== "number" || closes.length < 2) return null;
    const prev = closes[closes.length - 2];
    const weekRef = closes[Math.max(0, closes.length - 6)];
    return {
      price: Number(current.toFixed(2)),
      change24h: Number((((current - prev) / prev) * 100).toFixed(2)),
      change7d: Number((((current - weekRef) / weekRef) * 100).toFixed(2)),
    };
  } catch (err) {
    console.error("fetchBrent failed:", err);
    return null;
  }
}
