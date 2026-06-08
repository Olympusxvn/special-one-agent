import { gateway } from "@ai-sdk/gateway";

/** Default roast model — free tier via Vercel AI Gateway on deployed apps. */
export const GATEWAY_CHAT_MODEL = "anthropic/claude-haiku-4.5";

/** Server-side: Vercel OIDC on production, or AI_GATEWAY_API_KEY locally / in env. */
export function isGatewayAvailable(): boolean {
  if (process.env.AI_GATEWAY_API_KEY?.trim()) return true;
  return process.env.VERCEL === "1";
}

export function getGatewayChatModel() {
  return gateway(GATEWAY_CHAT_MODEL);
}
