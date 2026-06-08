import type { LlmProvider } from "@/lib/ai/models";

import { WalletButton } from "@/components/wallet/WalletButton";
import { WorldCupLogo } from "@/components/world-cup/WorldCupLogo";
import { WorldCupStripe } from "@/components/world-cup/WorldCupStripe";
import { MemWalStatus } from "./MemWalStatus";
import { ModelSelector } from "./ModelSelector";
import { ToxicityMeter } from "./ToxicityMeter";

export function PressRoomHeader({
  toxicityLevel,
  modelId,
  onModelChange,
  memWalLive,
  hasServerLlmKey,
  connectedProviders,
  onOpenSettings,
}: {
  toxicityLevel: number;
  modelId: string;
  onModelChange: (id: string) => void;
  memWalLive: boolean;
  hasServerLlmKey: boolean;
  connectedProviders: LlmProvider[];
  onOpenSettings: () => void;
}) {
  const llmReady = hasServerLlmKey || connectedProviders.length > 0;

  return (
    <>
      <div className="pitch-accent-bar" />
      <WorldCupStripe />
      <header className="relative z-30 stadium-header px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="logo-badge hidden shrink-0 sm:block">
              <WorldCupLogo size="sm" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-pitch/80">
                Walrus Sessions 4 · World Cup 2026
              </p>
              <h1 className="font-display text-xl tracking-wide sm:text-2xl">
                <span className="gradient-text-gold">MR. TOXIC SPECIAL ONE</span>
              </h1>
              <MemWalStatus live={memWalLive} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ToxicityMeter level={toxicityLevel} />
            <button
              type="button"
              onClick={onOpenSettings}
              className="shrink-0 rounded-lg border border-press-border bg-press-card px-3 py-1.5 text-xs text-foreground transition hover:border-gold/50"
              aria-label="Open settings"
            >
              ⚙️ Settings
              {!llmReady ? (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-roast" />
              ) : null}
            </button>
            <ModelSelector
              value={modelId}
              onChange={onModelChange}
              connectedProviders={connectedProviders}
              hasServerKey={hasServerLlmKey}
            />
            <WalletButton />
          </div>
        </div>
      </header>
    </>
  );
}
