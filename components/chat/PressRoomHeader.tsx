import { WalletButton } from "@/components/wallet/WalletButton";
import { ToxicityMeter } from "./ToxicityMeter";
import { ModelSelector } from "./ModelSelector";
import { OpenRouterConnect } from "./OpenRouterConnect";

export function PressRoomHeader({
  toxicityLevel,
  modelId,
  onModelChange,
  memWalLive,
  hasServerOpenRouterKey,
  modelSelectorDisabled,
  onOpenRouterKeyChange,
}: {
  toxicityLevel: number;
  modelId: string;
  onModelChange: (id: string) => void;
  memWalLive: boolean;
  hasServerOpenRouterKey: boolean;
  modelSelectorDisabled: boolean;
  onOpenRouterKeyChange: (key: string | null) => void;
}) {
  return (
    <header className="border-b border-press-border bg-press/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/70">
            Walrus Sessions 4 · World Cup
          </p>
          <h1 className="text-xl font-black tracking-tight text-gold sm:text-2xl">
            MR. TOXIC SPECIAL ONE
          </h1>
          <p className="text-xs text-foreground/50">
            MemWal {memWalLive ? "🟢 LIVE" : "⚪ offline demo"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <ToxicityMeter level={toxicityLevel} />
          <OpenRouterConnect
            hasServerKey={hasServerOpenRouterKey}
            onKeyChange={onOpenRouterKeyChange}
          />
          <ModelSelector
            value={modelId}
            onChange={onModelChange}
            disabled={modelSelectorDisabled}
          />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
