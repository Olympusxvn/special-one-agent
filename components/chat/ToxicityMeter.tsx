export function ToxicityMeter({ level }: { level: number }) {
  const clamped = Math.min(10, Math.max(1, level));
  const isHot = clamped >= 7;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-press-border/60 bg-press/50 px-2.5 py-1.5">
      <span className="text-xs uppercase tracking-wider text-gold/70">Toxicity</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-1.5 rounded-sm transition-all duration-300 ${
              i < clamped
                ? isHot
                  ? "animate-pulse bg-roast shadow-[0_0_6px_rgba(255,71,87,0.6)]"
                  : "bg-gradient-to-t from-roast/80 to-roast"
                : "bg-press-border/80"
            }`}
          />
        ))}
      </div>
      <span
        className={`text-sm font-bold ${isHot ? "animate-pulse text-roast" : "text-roast/90"}`}
      >
        {clamped}/10
      </span>
    </div>
  );
}
