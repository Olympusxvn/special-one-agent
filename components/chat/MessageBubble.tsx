import { MourinhoAvatar } from "./MourinhoAvatar";
import { MemeStampRow } from "./MemeStamp";

export function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex gap-3 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
    >
      {isAssistant && <MourinhoAvatar size={44} />}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAssistant
            ? "festive-border shadow-glow-gold text-foreground"
            : "border border-pitch/25 bg-pitch/10 text-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {isAssistant && <MemeStampRow text={content} />}
      </div>
    </div>
  );
}
