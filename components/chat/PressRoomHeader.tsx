import type { LlmProvider } from "@/lib/ai/models";

import { WalletButton } from "@/components/wallet/WalletButton";
import { WorldCupLogo } from "@/components/world-cup/WorldCupLogo";
import { WorldCupStripe } from "@/components/world-cup/WorldCupStripe";
import { MemWalStatus } from "./MemWalStatus";
import { ModelSelector } from "./ModelSelector";
import { ToxicityMeter } from "./ToxicityMeter";

type ByokProvider = Exclude<LlmProvider, "gateway">;

export function PressRoomHeader({
  toxicityLevel,
  modelId,
  onModelChange,
  memWalLive,
  hasGateway,
  hasServerByok,
  connectedProviders,
  onOpenSettings,
}: {
  toxicityLevel: number;
  modelId: string;
  onModelChange: (id: string) => void;
  memWalLive: boolean;
  hasGateway: boolean;
  hasServerByok: boolean;
  connectedProviders: ByokProvider[];
  onOpenSettings: () => void;
}) {
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
              aria-label="Open advanced LLM settings"
            >
              ⚙️ Advanced
            </button>
            <ModelSelector
              value={modelId}
              onChange={onModelChange}
              connectedProviders={connectedProviders}
              hasGateway={hasGateway}
              hasServerByok={hasServerByok}
            />
            <WalletButton />
          </div>
        </div>
        {hasGateway && (
          <p className="mx-auto mt-2 max-w-6xl text-center text-[10px] text-foreground/45">
            Claude Haiku 4.5 free via Vercel AI Gateway — connect wallet only, no API key
          </p>
        )}
      </header>
    </>
  );
}
