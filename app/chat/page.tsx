import { ChatContainer } from "@/components/chat/ChatContainer";
import { getServerLlmCapabilities } from "@/lib/ai/server-llm";
import { isMemWalLive } from "@/lib/memory/client";

export default function ChatPage() {
  return (
    <ChatContainer
      memWalLive={isMemWalLive()}
      serverLlm={getServerLlmCapabilities()}
    />
  );
}
