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
      const tab =
        selectedModel.provider === "google"
          ? "Gemini"
          : selectedModel.provider === "openai"
            ? "ChatGPT"
            : "Claude";
      return NextResponse.json(
        {
          error: `No API key for ${selectedModel.label}. Open Settings → ${tab} tab → paste your key, or switch to a model you have connected.`,
        },
        { status: 401 },
      );
    }

    const lastUserText = getLastUserText(messages);
    if (!lastUserText) {
      return NextResponse.json({ error: "No user message" }, { status: 400 });
    }

    const modelMessages = toModelMessages(messages);
    if (modelMessages.length === 0) {
      return NextResponse.json({ error: "No user message" }, { status: 400 });
    }

    const [syncResult, recalled] = await Promise.all([
      syncPendingPredictions(walletAddress),
      recallMemories(walletAddress, lastUserText, 3),
    ]);
    let profile = syncResult.profile;

    const intent = detectIntent(lastUserText);

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
      temperature: 0.8,
      maxOutputTokens: 380,
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
