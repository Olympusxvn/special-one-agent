"use client";

export function RoastLevelBar({ level }: { level: number }) {
  const clamped = Math.min(10, Math.max(1, level));
  const pct = (clamped / 10) * 100;

  return (
    <div className="walrus-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="walrus-label">Roast level</span>
        <span className="walrus-caption font-medium text-foreground">
          {clamped}/10
        </span>
      </div>
      <div className="walrus-progress-track">
        <div className="walrus-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="walrus-quote mt-3">
        {clamped >= 7
          ? '"I am the Special One — and you are especially wrong."'
          : clamped >= 4
            ? "Sarcasm warming up."
            : "Still professional. For now."}
      </p>
    </div>
  );
}
