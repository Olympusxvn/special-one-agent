"use client";

import { TeamFlag } from "@/components/world-cup/TeamFlag";

import { MemeStampRow } from "./MemeStamp";
import { MourinhoAvatar } from "./MourinhoAvatar";

export function MessageBubble({
  role,
  content,
  favoriteTeam,
  toxicityLevel = 1,
}: {
  role: "user" | "assistant";
  content: string;
  favoriteTeam?: string | null;
  toxicityLevel?: number;
}) {
  const isAssistant = role === "assistant";
  const isHot = isAssistant && toxicityLevel >= 7;

  return (
    <div
      className={`flex gap-3 animate-fade-in ${
        isAssistant ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {isAssistant ? (
        <MourinhoAvatar size={40} />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface">
          <TeamFlag team={favoriteTeam} size="md" />
        </div>
      )}

      <div
        className={`max-w-[85%] px-4 py-3 text-nav leading-relaxed ${
          isAssistant
            ? `bubble-walrus-agent ${isHot ? "bubble-walrus-agent-hot" : ""}`
            : "bubble-walrus-user"
        }`}
      >
        {isAssistant && (
          <p className="walrus-label mb-2 text-brand-light">Special One</p>
        )}
        <p className="whitespace-pre-wrap text-foreground">{content}</p>
        {isAssistant && <MemeStampRow text={content} />}
      </div>
    </div>
  );
}
