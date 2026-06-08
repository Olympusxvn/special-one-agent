import { ChatContainer } from "@/components/chat/ChatContainer";
import { isGatewayAvailable } from "@/lib/ai/gateway";
import { hasServerByokKeys } from "@/lib/ai/providers";
import { isMemWalLive } from "@/lib/memory/client";

export default function ChatPage() {
  return (
    <ChatContainer
      memWalLive={isMemWalLive()}
      hasGateway={isGatewayAvailable()}
      hasServerByok={hasServerByokKeys()}
    />
  );
}
