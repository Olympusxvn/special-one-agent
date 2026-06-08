import { getErrorMessage } from "@ai-sdk/provider-utils";
import { streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";

import { buildSystemPrompt } from "@/lib/ai/build-prompt";
import { detectIntent, extractRoastTopics } from "@/lib/ai/intent";
import {
  CHAT_MODELS,
  DEFAULT_MODEL_ID,
  getModelById,
} from "@/lib/ai/models";
import {
  getLastUserText,
  toModelMessages,
} from "@/lib/ai/message-text";
import {
  getChatModel,
  hasProviderKey,
  type UserLlmKeys,
} from "@/lib/ai/providers";
import { assertWalletAuth } from "@/lib/auth/verify-wallet";
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages?: UIMessage[];
      walletAddress?: string;
      modelId?: string;
      llmKeys?: UserLlmKeys;
      authMessage?: string;
      authSignature?: string;
      openRouterApiKey?: string;
    };

    const {
      messages = [],
      walletAddress,
      modelId,
      llmKeys,
      authMessage,
      authSignature,
      openRouterApiKey,
    } = body;

    const userKeys: UserLlmKeys = {
      ...llmKeys,
      ...(openRouterApiKey ? { openrouter: openRouterApiKey } : {}),
    };

    if (!walletAddress?.trim()) {
      return NextResponse.json(
        { error: "walletAddress required" },
        { status: 400 },
      );
    }

    const auth = await assertWalletAuth(
      walletAddress,
      authMessage,
      authSignature,
    );
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const selectedModel =
      getModelById(modelId ?? DEFAULT_MODEL_ID) ?? CHAT_MODELS[0]!;

    if (!hasProviderKey(selectedModel.provider, userKeys)) {
      const hint =
        selectedModel.provider === "gateway"
          ? "Claude Haiku (free) requires Vercel production or AI_GATEWAY_API_KEY on the server."
          : `No API key for ${selectedModel.label}. Open Advanced → paste a ${selectedModel.provider} key, or switch to Claude Haiku (free).`;
      return NextResponse.json({ error: hint }, { status: 401 });
    }

    const lastUserText = getLastUserText(messages);
    if (!lastUserText) {
      return NextResponse.json({ error: "No user message" }, { status: 400 });
    }

    const modelMessages = toModelMessages(messages);
    if (modelMessages.length === 0) {
      return NextResponse.json({ error: "No user message" }, { status: 400 });
    }

    const syncResult = await syncPendingPredictions(walletAddress);
    let profile = syncResult.profile;

    const intent = await detectIntent(lastUserText, userKeys);

    if (intent.intent === "set_team" && intent.favorite_team) {
      profile = await setFavoriteTeam(
        walletAddress,
        intent.favorite_team,
        profile,
      );
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
      model: getChatModel(selectedModel.id, userKeys),
      system,
      messages: modelMessages,
      temperature: 0.85,
      onFinish: async ({ text }) => {
        try {
          const topics = extractRoastTopics(text);
          await appendRoast(walletAddress, profile, text, topics);
        } catch (err) {
          console.error("appendRoast failed:", err);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => getErrorMessage(error),
    });
  } catch (err) {
    console.error("POST /api/chat failed:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}
