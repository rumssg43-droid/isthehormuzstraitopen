import { getVerdict, type VerdictState } from "@/lib/verdict";

export const revalidate = 3600;

const STATE_STYLES: Record<
  VerdictState,
  { bg: string; fg: string; label: string; size: string; panel: string }
> = {
  YES: {
    bg: "bg-green-500",
    fg: "text-white",
    label: "YES",
    size: "text-[30vw] sm:text-[28vw]",
    panel: "bg-black/15",
  },
  NO: {
    bg: "bg-red-600",
    fg: "text-white",
    label: "NO",
    size: "text-[40vw] sm:text-[38vw]",
    panel: "bg-black/20",
  },
  KINDA: {
    bg: "bg-amber-400",
    fg: "text-black",
    label: "KINDA",
    size: "text-[22vw] sm:text-[20vw]",
    panel: "bg-black/10",
  },
  UNKNOWN: {
    bg: "bg-zinc-500",
    fg: "text-white",
    label: "UNKNOWN",
    size: "text-[14vw] sm:text-[14vw]",
    panel: "bg-black/20",
  },
};

function formatTime(iso: string) {
  return new Date(iso).toUTCString();
}

function formatPct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export default async function Home() {
  const verdict = await getVerdict();
  const style = STATE_STYLES[verdict.state];
  const { brent } = verdict.signals;

  return (
    <div
      className={`${style.bg} ${style.fg} min-h-screen flex flex-col items-center justify-between px-6 py-10 gap-10 font-sans`}
    >
      <header className="w-full max-w-4xl text-center">
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight opacity-90">
          Is the Strait of Hormuz open?
        </h1>
      </header>

      <main className="flex items-center justify-center w-full min-h-[50vh]">
        <h2
          className={`${style.size} leading-none font-black tracking-tighter text-center select-none`}
        >
          {style.label}
        </h2>
      </main>

      <footer className="w-full max-w-5xl text-center space-y-6 text-sm sm:text-base opacity-95">
        <p className="text-base sm:text-lg leading-snug">
          {verdict.reasoning}
        </p>

        <div
          className={`${style.panel} rounded-xl grid grid-cols-3 gap-2 p-3 sm:p-4 text-center`}
        >
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-70">
              Brent crude
            </span>
            {brent ? (
              <>
                <span className="font-bold text-base sm:text-xl leading-tight">
                  ${brent.price}
                </span>
                <span className="text-xs sm:text-sm opacity-80">
                  {formatPct(brent.change24h)} 24h
                </span>
              </>
            ) : (
              <span className="font-bold text-base sm:text-xl">—</span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-70">
              Headlines
            </span>
            <span className="font-bold text-base sm:text-xl leading-tight">
              {verdict.signals.headlineCount}
            </span>
            <span className="text-xs sm:text-sm opacity-80">
              matched
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-70">
              UKMTO
            </span>
            <a
              href="https://www.ukmto.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm sm:text-base underline underline-offset-2 decoration-2 hover:opacity-70 leading-tight"
            >
              Advisories →
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold uppercase text-xs tracking-widest opacity-80">
            Live traffic in the strait
          </p>
          <div
            className={`${style.panel} rounded-xl overflow-hidden aspect-[4/3] sm:aspect-[16/9]`}
          >
            <iframe
              src="https://www.marinetraffic.com/en/ais/embed/zoom:8/centery:26.5/centerx:56.3/maptype:0/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:0/vlist:false/remember:true"
              className="w-full h-full border-0"
              loading="lazy"
              title="Live ship traffic in the Strait of Hormuz via MarineTraffic"
            />
          </div>
          <p className="text-xs opacity-70">
            Live AIS data from{" "}
            <a
              href="https://www.marinetraffic.com/en/ais/home/centerx:56.3/centery:26.5/zoom:8"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              MarineTraffic
            </a>
            . Each marker is a real vessel.
          </p>
        </div>

        {verdict.sources.length > 0 && (
          <div className="space-y-1">
            <p className="font-semibold uppercase text-xs tracking-widest opacity-80">
              Sources
            </p>
            <ul className="space-y-1">
              {verdict.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 decoration-2 hover:opacity-70"
                  >
                    {s.outlet}: {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs opacity-70">
          Confidence: {verdict.confidence} · Checked {formatTime(verdict.checkedAt)} · Refreshes hourly · BBC · Al Jazeera · Maritime Executive · gCaptain · Google News
        </p>
      </footer>
    </div>
  );
}
