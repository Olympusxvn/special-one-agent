import { ChatContainer } from "@/components/chat/ChatContainer";
import { isMemWalLive } from "@/lib/memory/client";

export default function ChatPage() {
  return <ChatContainer memWalLive={isMemWalLive()} />;
}
