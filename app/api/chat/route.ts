import { getErrorMessage } from "@ai-sdk/provider-utils";
import { waitUntil } from "@vercel/functions";
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
import { applyIntentToProfile } from "@/lib/memory/apply-intent";
import {
  appendRoastToProfile,
  loadFanProfileFast,
  persistProfileAndWait,
  persistProfileEnqueue,
  recallMemories,
  rememberSemanticLine,
} from "@/lib/memory/fan-profile";
import { intentMutatesProfile } from "@/lib/memory/merge-intent";
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

    const intent = detectIntent(lastUserText);

    const [baseProfile, recalledMemories] = await Promise.all([
      loadFanProfileFast(walletAddress, 500),
      recallMemories(walletAddress, lastUserText, {
        limit: 2,
        timeoutMs: 800,
        useCache: true,
      }),
    ]);
    const profile = applyIntentToProfile(walletAddress, baseProfile, intent);
    if (intentMutatesProfile(intent)) {
      persistProfileEnqueue(walletAddress, profile);
    }
    const toxicityLevel = computeToxicityLevel(profile);

    const system = buildSystemPrompt({
      fanProfile: profile,
      recalledMemories,
      toxicityLevel,
    });

    const result = streamText({
      model: getChatModel(selectedModel.id, userKeys),
      system,
      messages: modelMessages,
      temperature: 0.65,
      maxOutputTokens: 70,
      onFinish: ({ text }) => {
        const finalize = async () => {
          const topics = extractRoastTopics(text);
          const withRoast = appendRoastToProfile(profile, text, topics);
          await persistProfileAndWait(walletAddress, withRoast);
          rememberSemanticLine(
            walletAddress,
            `Roast delivered: ${text.slice(0, 200)}`,
          );
        };
        waitUntil(
          finalize().catch((err) =>
            console.error("post-stream persist failed:", err),
          ),
        );
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
