import { getVerdict, type VerdictState } from "@/lib/verdict";

export const revalidate = 3600;

const STATE_STYLES: Record<
  VerdictState,
  { bg: string; fg: string; label: string; size: string }
> = {
  YES: {
    bg: "bg-green-500",
    fg: "text-white",
    label: "YES",
    size: "text-[30vw] sm:text-[28vw]",
  },
  NO: {
    bg: "bg-red-600",
    fg: "text-white",
    label: "NO",
    size: "text-[40vw] sm:text-[38vw]",
  },
  KINDA: {
    bg: "bg-amber-400",
    fg: "text-black",
    label: "KINDA",
    size: "text-[22vw] sm:text-[20vw]",
  },
  UNKNOWN: {
    bg: "bg-zinc-500",
    fg: "text-white",
    label: "UNKNOWN",
    size: "text-[14vw] sm:text-[14vw]",
  },
};

function formatTime(iso: string) {
  return new Date(iso).toUTCString();
}

export default async function Home() {
  const verdict = await getVerdict();
  const style = STATE_STYLES[verdict.state];

  return (
    <div
      className={`${style.bg} ${style.fg} flex-1 flex flex-col items-center justify-between px-6 py-10 font-sans`}
    >
      <header className="w-full max-w-4xl text-center">
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight opacity-90">
          Is the Strait of Hormuz open?
        </h1>
      </header>

      <main className="flex flex-1 items-center justify-center w-full">
        <h2
          className={`${style.size} leading-none font-black tracking-tighter text-center select-none`}
        >
          {style.label}
        </h2>
      </main>

      <footer className="w-full max-w-2xl text-center space-y-4 text-sm sm:text-base opacity-95">
        <p className="text-base sm:text-lg leading-snug">
          {verdict.reasoning}
        </p>
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
          Confidence: {verdict.confidence} · Checked {formatTime(verdict.checkedAt)} · Refreshes hourly · Based on BBC and Al Jazeera headlines
        </p>
      </footer>
    </div>
  );
}
