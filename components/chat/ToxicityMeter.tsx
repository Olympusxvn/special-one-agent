export function ToxicityMeter({ level }: { level: number }) {
  const clamped = Math.min(10, Math.max(1, level));
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-gold/70">Toxicity</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-1.5 rounded-sm ${
              i < clamped ? "bg-roast" : "bg-press-border"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-roast">{clamped}/10</span>
    </div>
  );
}
