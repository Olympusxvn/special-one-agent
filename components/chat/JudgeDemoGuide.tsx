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
          className="btn-walrus-primary px-2.5 py-1 text-[10px] disabled:opacity-40"
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
      <div className="mb-3 border-b border-border-subtle pb-3">
        <p className="walrus-label">Walrus Sessions 4</p>
        <h2 className="walrus-heading mt-1 text-base">Judge demo guide</h2>
        <p className="walrus-caption mt-2">
          ~60s walkthrough — memory visible in chat, ledger, and on-chain.
        </p>
      </div>

      <ol className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="walrus-card px-3 py-2"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-subtle text-[10px] font-medium text-brand-light">
                {step.n}
              </span>
              <span className="text-xs font-medium text-foreground">{step.title}</span>
            </div>
            <p className="walrus-caption">
              {step.body}
              {"action" in step && step.action === "settings" && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="text-brand-light underline hover:text-accent"
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

      <div className="mt-3 space-y-2 border-t border-border-subtle pt-3 walrus-caption">
        <p>
          <span className="font-semibold text-foreground/60">Look for:</span>{" "}
          toxicity meter · ledger updates after each Send · roast callbacks from
          Walrus recall
        </p>
        <p>
          MemWal:{" "}
          {memWalLive ? (
            <span className="text-accent">live</span>
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
                className="text-brand-light underline hover:text-accent"
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
    <aside className="walrus-card flex max-h-[calc(100vh-8rem)] flex-col p-4">
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
    <details className="walrus-card p-3 lg:hidden">
      <summary className="walrus-caption cursor-pointer font-medium text-foreground">
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
