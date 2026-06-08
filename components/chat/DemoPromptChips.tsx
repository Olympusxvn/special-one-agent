"use client";

import { DEMO_PROMPTS } from "@/lib/samples/demo-prompts";

export function DemoPromptChips({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4 text-left">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground/45">
        Try a demo line
      </p>
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
        {DEMO_PROMPTS.map((p) => (
          <button
            key={p.text}
            type="button"
            disabled={disabled}
            onClick={() => onPick(p.text)}
            className="rounded-full border border-gold/25 bg-press/80 px-3 py-1.5 text-xs text-foreground/75 transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
