import type { UIMessage } from "ai";

type MessageLike = UIMessage & {
  content?: string | Array<{ type?: string; text?: string } | string>;
};

/** Extract text from UIMessage (parts or legacy content). */
export function getMessageText(msg: MessageLike): string {
  if (Array.isArray(msg.parts)) {
    const fromParts = msg.parts
      .filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("");
    if (fromParts.trim()) return fromParts;
  }

  if (typeof msg.content === "string" && msg.content.trim()) {
    return msg.content;
  }

  if (Array.isArray(msg.content)) {
    const fromContent = msg.content
      .map((c) =>
        typeof c === "string" ? c : c?.type === "text" ? (c.text ?? "") : "",
      )
      .join("");
    if (fromContent.trim()) return fromContent;
  }

  return "";
}

export function getLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role !== "user") continue;
    const text = getMessageText(msg);
    if (text.trim()) return text;
  }
  return "";
}

export function toModelMessages(messages: UIMessage[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: getMessageText(m),
    }))
    .filter((m) => m.content.trim());
}
