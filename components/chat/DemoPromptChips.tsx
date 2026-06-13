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
    <div className="mt-6 text-left">
      <p className="walrus-label mb-3">Try a demo line</p>
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
        {DEMO_PROMPTS.map((p) => (
          <button
            key={p.text}
            type="button"
            disabled={disabled}
            onClick={() => onPick(p.text)}
            className="btn-walrus-primary px-3 py-1.5 text-caption disabled:opacity-40"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
