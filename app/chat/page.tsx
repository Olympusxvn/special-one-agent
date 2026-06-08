import { ChatContainer } from "@/components/chat/ChatContainer";
import { hasAnyLlmKey } from "@/lib/ai/providers";
import { isMemWalLive } from "@/lib/memory/client";

export default function ChatPage() {
  return (
    <ChatContainer
      memWalLive={isMemWalLive()}
      hasServerLlmKey={hasAnyLlmKey()}
    />
  );
}
