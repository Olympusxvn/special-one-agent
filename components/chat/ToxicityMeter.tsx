export function ToxicityMeter({ level }: { level: number }) {
  const clamped = Math.min(10, Math.max(1, level));
  const pct = (clamped / 10) * 100;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="walrus-label">Roast</span>
      <div className="walrus-progress-track w-16 sm:w-20">
        <div className="walrus-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="walrus-caption font-medium text-foreground">{clamped}</span>
    </div>
  );
}
