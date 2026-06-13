import type { LlmProvider } from "@/lib/ai/models";
import type { ServerLlmCapabilities } from "@/lib/ai/server-llm";

import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletButton } from "@/components/wallet/WalletButton";
import { MourinhoAvatar } from "./MourinhoAvatar";

import { MemWalStatus } from "./MemWalStatus";
import { ModelSelector } from "./ModelSelector";
import { ToxicityMeter } from "./ToxicityMeter";

export function PressRoomHeader({
  toxicityLevel,
  modelId,
  onModelChange,
  memWalLive,
  serverLlm,
  connectedProviders,
  hasUserOpenRouter,
  onOpenSettings,
}: {
  toxicityLevel: number;
  modelId: string;
  onModelChange: (id: string) => void;
  memWalLive: boolean;
  serverLlm: ServerLlmCapabilities;
  connectedProviders: LlmProvider[];
  hasUserOpenRouter: boolean;
  onOpenSettings: () => void;
}) {
  const llmReady =
    connectedProviders.length > 0 ||
    serverLlm.providers.length > 0 ||
    serverLlm.openRouter ||
    hasUserOpenRouter;

  return (
    <header className="walrus-nav relative z-30 px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-walrus flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <MourinhoAvatar size={44} />
          <div className="min-w-0">
            <p className="walrus-label mb-1">Walrus Memory · World Cup 2026</p>
            <h1 className="walrus-heading truncate text-lg font-medium sm:text-xl">
              Mr. Toxic Special One
            </h1>
            <MemWalStatus live={memWalLive} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ToxicityMeter level={toxicityLevel} />
          <button
            type="button"
            onClick={onOpenSettings}
            className="btn-walrus-primary px-3 py-2 text-caption"
            aria-label="Open LLM settings"
          >
            Settings
            {!llmReady ? (
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
            ) : null}
          </button>
          <ModelSelector
            value={modelId}
            onChange={onModelChange}
            connectedProviders={connectedProviders}
            serverLlm={serverLlm}
            hasUserOpenRouter={hasUserOpenRouter}
          />
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
