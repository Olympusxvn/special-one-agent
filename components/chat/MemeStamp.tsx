const MEME_REGEX = /\[([^\]]+)\]/g;

export function extractMemeStamps(text: string): string[] {
  const matches = Array.from(text.matchAll(MEME_REGEX));
  return matches.map((m) => m[1]!).filter(Boolean);
}

export function MemeStamp({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-roast/40 bg-roast/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-roast">
      {label}
    </span>
  );
}

export function MemeStampRow({ text }: { text: string }) {
  const stamps = extractMemeStamps(text);
  if (stamps.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {stamps.map((stamp) => (
        <MemeStamp key={stamp} label={stamp} />
      ))}
    </div>
  );
}
