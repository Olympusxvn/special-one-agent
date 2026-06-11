"use client";

import {
  getPublicMemWalAccountId,
  memWalExplorerUrl,
} from "@/lib/memwal/constants";
import { GUIDE_STEP_PROMPTS } from "@/lib/samples/demo-prompts";

const STEPS = [
  {
    n: 1,
    title: "MemWal live",
    body: "Header shows MemWal 🟢 LIVE. Open View MemWalAccount → memories on Walrus mainnet.",
  },
  {
    n: 2,
    title: "LLM key",
    body: "Settings → paste a free Gemini, ChatGPT, or Claude API key → Save.",
    action: "settings" as const,
  },
  {
    n: 3,
    title: "Declare team",
    body: "Tap a demo line or type who you support → Send. Ledger (right) shows your team.",
  },
  {
    n: 4,
    title: "Predict",
    body: "Tap ⚽ Predict score → Send. Open prediction appears in Walrus Memory Ledger.",
  },
  {
    n: 5,
    title: "Wrong result",
    body: 'Tap 📊 Report result or type e.g. "France beat Germany 2-1" → WRONG · toxicity rises.',
  },
  {
    n: 6,
    title: "Memory Moment",
    body: "Refresh the page, same wallet — ledger + roast still know your receipts (Portable Memory).",
  },
  {
    n: 7,
    title: "Optional",
    body: "🔀 Flip-flop chip → bandwagon roast. Sync pending results only if you used fixture IDs.",
  },
] as const;

function GuideDemoChips({
  step,
  onPick,
  disabled,
}: {
  step: number;
  onPick?: (text: string) => void;
  disabled?: boolean;
}) {
  const prompts = GUIDE_STEP_PROMPTS[step];
  if (!prompts?.length || !onPick) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {prompts.map((p) => (
        <button
          key={p.text}
          type="button"
          disabled={disabled}
          onClick={() => onPick(p.text)}
          className="rounded-full border border-gold/25 bg-press/80 px-2.5 py-1 text-[10px] text-foreground/75 transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function JudgeDemoGuideContent({
  memWalLive,
  onOpenSettings,
  onPickDemo,
  demoDisabled,
}: {
  memWalLive: boolean;
  onOpenSettings: () => void;
  onPickDemo?: (text: string) => void;
  demoDisabled?: boolean;
}) {
  const accountId = getPublicMemWalAccountId();

  return (
    <>
      <div className="mb-3 border-b border-gold/25 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/80">
          Walrus Sessions 4
        </p>
        <h2 className="font-display text-base font-bold tracking-wide text-gold">
          Judge demo guide
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-foreground/55">
          ~60s walkthrough — memory visible in chat, ledger, and on-chain.
        </p>
      </div>

      <ol className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="rounded-lg border border-gold/20 bg-background/30 px-2.5 py-2"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
                {step.n}
              </span>
              <span className="text-xs font-semibold text-gold">{step.title}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-foreground/65">
              {step.body}
              {"action" in step && step.action === "settings" && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="font-semibold text-pitch underline hover:text-gold"
                  >
                    Open Settings
                  </button>
                </>
              )}
            </p>
            <GuideDemoChips
              step={step.n}
              onPick={onPickDemo}
              disabled={demoDisabled}
            />
          </li>
        ))}
      </ol>

      <div className="mt-3 space-y-2 border-t border-gold/25 pt-3 text-[10px] text-foreground/45">
        <p>
          <span className="font-semibold text-foreground/60">Look for:</span>{" "}
          toxicity meter · ledger updates after each Send · roast callbacks from
          Walrus recall
        </p>
        <p>
          MemWal:{" "}
          {memWalLive ? (
            <span className="text-pitch">🟢 mainnet</span>
          ) : (
            <span>⚪ offline demo</span>
          )}
          {accountId && (
            <>
              {" · "}
              <a
                href={memWalExplorerUrl(accountId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold/90 underline hover:text-gold"
              >
                Explorer
              </a>
            </>
          )}
        </p>
      </div>
    </>
  );
}

export function JudgeDemoGuide({
  memWalLive,
  onOpenSettings,
  onPickDemo,
  demoDisabled,
}: {
  memWalLive: boolean;
  onOpenSettings: () => void;
  onPickDemo?: (text: string) => void;
  demoDisabled?: boolean;
}) {
  return (
    <aside className="festive-card flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border-2 border-gold/50 bg-gold/[0.06] p-4 shadow-[0_0_24px_rgba(245,200,66,0.08)]">
      <JudgeDemoGuideContent
        memWalLive={memWalLive}
        onOpenSettings={onOpenSettings}
        onPickDemo={onPickDemo}
        demoDisabled={demoDisabled}
      />
    </aside>
  );
}

export function JudgeDemoGuideMobile({
  memWalLive,
  onOpenSettings,
  onPickDemo,
  demoDisabled,
}: {
  memWalLive: boolean;
  onOpenSettings: () => void;
  onPickDemo?: (text: string) => void;
  demoDisabled?: boolean;
}) {
  return (
    <details className="festive-card rounded-xl border-2 border-gold/40 bg-gold/[0.06] p-3 lg:hidden">
      <summary className="cursor-pointer text-xs font-bold text-gold">
        Judge demo guide (tap to expand)
      </summary>
      <div className="mt-3 max-h-64 overflow-y-auto">
        <JudgeDemoGuideContent
          memWalLive={memWalLive}
          onOpenSettings={onOpenSettings}
          onPickDemo={onPickDemo}
          demoDisabled={demoDisabled}
        />
      </div>
    </details>
  );
}
