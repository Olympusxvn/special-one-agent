import { streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";

import { buildSystemPrompt } from "@/lib/ai/build-prompt";
import { detectIntent, extractRoastTopics } from "@/lib/ai/intent";
import { DEFAULT_MODEL_ID } from "@/lib/ai/models";
import {
  getChatModel,
  hasOpenRouterKey,
  resolveOpenRouterApiKey,
} from "@/lib/ai/providers";
import { isWalletVerified } from "@/lib/auth/verify-wallet";
import { syncPendingPredictions } from "@/lib/football/sync-predictions";
import {
  addPrediction,
  appendRoast,
  recallMemories,
  resolvePrediction,
  setFavoriteTeam,
} from "@/lib/memory/fan-profile";
import { computeToxicityLevel } from "@/lib/memory/toxicity";

export const maxDuration = 60;

function getLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role !== "user") continue;
    const text = msg.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("");
    if (text) return text;
  }
  return "";
}

function toModelMessages(messages: UIMessage[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content:
        m.parts
          ?.filter((p) => p.type === "text")
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("") ?? "",
    }))
    .filter((m) => m.content.trim());
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: UIMessage[];
    walletAddress?: string;
    modelId?: string;
    openRouterApiKey?: string;
  };

  const { messages = [], walletAddress, modelId, openRouterApiKey } = body;

  if (!walletAddress?.trim()) {
    return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
  }

  if (!isWalletVerified(walletAddress)) {
    return NextResponse.json({ error: "Wallet not verified" }, { status: 401 });
  }

  const apiKey = resolveOpenRouterApiKey(openRouterApiKey);

  if (!hasOpenRouterKey(apiKey)) {
    return NextResponse.json(
      {
        error:
          "No OpenRouter API key available. Connect your key in the header panel or ask the operator to set OPENROUTER_API_KEY for demo mode.",
      },
      { status: 401 },
    );
  }

  const lastUserText = getLastUserText(messages);
  if (!lastUserText) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  const syncResult = await syncPendingPredictions(walletAddress);
  let profile = syncResult.profile;

  const intent = await detectIntent(lastUserText, apiKey);

  if (intent.intent === "set_team" && intent.favorite_team) {
    profile = await setFavoriteTeam(walletAddress, intent.favorite_team, profile);
  }

  if (intent.intent === "prediction" && intent.prediction) {
    profile = await addPrediction(walletAddress, profile, {
      match: intent.match ?? "World Cup 2026 match",
      prediction: intent.prediction,
      fixtureId: intent.fixtureId,
      confidence: intent.confidence_level,
    });
  }

  if (intent.intent === "report_result" && intent.reported_result) {
    profile = await resolvePrediction(walletAddress, profile, {
      match: intent.match ?? lastUserText,
      result: intent.reported_result,
    });
  }

  const recalled = await recallMemories(walletAddress, lastUserText, 5);
  const toxicityLevel = computeToxicityLevel(profile);

  let matchContext: string | undefined;
  if (syncResult.resolved.length > 0) {
    matchContext = syncResult.resolved
      .map((r) => `${r.match}: ${r.result}`)
      .join("\n");
  }

  const system = buildSystemPrompt({
    fanProfile: profile,
    recalledMemories: recalled,
    toxicityLevel,
    matchContext,
  });

  const result = streamText({
    model: getChatModel(modelId ?? DEFAULT_MODEL_ID, apiKey),
    system,
    messages: toModelMessages(messages),
    temperature: 0.85,
    onFinish: async ({ text }) => {
      const topics = extractRoastTopics(text);
      await appendRoast(walletAddress, profile, text, topics);
    },
  });

  return result.toUIMessageStreamResponse();
}
