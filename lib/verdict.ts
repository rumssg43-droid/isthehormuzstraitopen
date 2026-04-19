import Anthropic from "@anthropic-ai/sdk";
import Parser from "rss-parser";

const FEEDS = [
  {
    outlet: "BBC",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
  },
  {
    outlet: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
  },
];

const KEYWORDS =
  /hormuz|strait|iran|tanker|persian gulf|oman|shipping|oil trade|blockad/i;

export type VerdictState = "YES" | "NO" | "KINDA" | "UNKNOWN";

export type Source = {
  outlet: string;
  title: string;
  url: string;
  pubDate?: string;
};

export type Verdict = {
  state: VerdictState;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  sources: Source[];
  checkedAt: string;
};

type Headline = {
  outlet: string;
  title: string;
  url: string;
  snippet?: string;
  pubDate?: string;
};

async function fetchHeadlines(): Promise<Headline[]> {
  const parser = new Parser({ timeout: 15_000 });
  const results: Headline[] = [];

  await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items ?? []) {
          const title = item.title ?? "";
          const snippet = item.contentSnippet ?? "";
          if (KEYWORDS.test(title) || KEYWORDS.test(snippet)) {
            results.push({
              outlet: feed.outlet,
              title,
              url: item.link ?? "",
              snippet: snippet.slice(0, 400),
              pubDate: item.pubDate,
            });
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${feed.outlet}:`, err);
      }
    }),
  );

  return results.slice(0, 20);
}

const SYSTEM_PROMPT = `You determine whether the Strait of Hormuz is currently open to commercial shipping, based on recent news headlines from BBC and Al Jazeera.

The Strait of Hormuz is a narrow waterway between Iran and Oman. Roughly 20% of the world's oil passes through it. In practice it has almost never been physically closed, but tensions, tanker seizures, missile strikes, and Iranian threats to close it regularly disrupt traffic.

You must output ONLY a single valid JSON object. No preamble, no markdown, no prose outside the JSON.

Schema:
{
  "state": "YES" | "NO" | "KINDA",
  "confidence": "high" | "medium" | "low",
  "reasoning": "one or two sentences citing what the headlines indicate",
  "source_indices": [number, ...]
}

State definitions:
- YES: shipping is flowing normally. No active closure or serious disruption in the provided headlines.
- NO: the strait is actually closed, blocked, mined, or commercial shipping has halted.
- KINDA: partial disruption — tanker seizures, missile exchanges, heightened military presence, explicit Iranian threats to close it, drone attacks on shipping — but not fully closed.

"source_indices" must reference indices into the headline list the user provides you (0-based, max 4 entries, pick the ones most load-bearing for your verdict).

If none of the headlines are relevant to the strait, default to {"state": "YES", "confidence": "low", "reasoning": "No recent news indicates disruption.", "source_indices": []}.`;

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  throw new Error("no JSON object found in response");
}

export async function getVerdict(): Promise<Verdict> {
  const checkedAt = new Date().toISOString();
  const headlines = await fetchHeadlines();

  if (headlines.length === 0) {
    return {
      state: "YES",
      confidence: "low",
      reasoning:
        "No recent BBC or Al Jazeera headlines mention the Strait of Hormuz. Absence of news usually means normal operations.",
      sources: [],
      checkedAt,
    };
  }

  const userContent = headlines
    .map(
      (h, i) =>
        `[${i}] (${h.outlet}, ${h.pubDate ?? "recent"}) ${h.title}${
          h.snippet ? ` — ${h.snippet}` : ""
        }`,
    )
    .join("\n");

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1500,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("no text block in Claude response");
    }

    const parsed = JSON.parse(extractJson(textBlock.text)) as {
      state: VerdictState;
      confidence: "high" | "medium" | "low";
      reasoning: string;
      source_indices: number[];
    };

    const sources: Source[] = (parsed.source_indices ?? [])
      .map((i) => headlines[i])
      .filter((h): h is Headline => Boolean(h))
      .map((h) => ({
        outlet: h.outlet,
        title: h.title,
        url: h.url,
        pubDate: h.pubDate,
      }));

    return {
      state: parsed.state,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      sources,
      checkedAt,
    };
  } catch (err) {
    console.error("Claude classification failed:", err);
    return {
      state: "UNKNOWN",
      confidence: "low",
      reasoning:
        "Could not classify right now. Showing latest relevant headlines below.",
      sources: headlines.slice(0, 4).map((h) => ({
        outlet: h.outlet,
        title: h.title,
        url: h.url,
        pubDate: h.pubDate,
      })),
      checkedAt,
    };
  }
}
