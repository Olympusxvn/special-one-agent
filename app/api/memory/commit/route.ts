import { NextResponse } from "next/server";

import { detectIntent } from "@/lib/ai/intent";
import { assertWalletAuth } from "@/lib/auth/verify-wallet";
import { analyzeUserMessage } from "@/lib/memory/analyze-message";
import { applyIntentToProfile } from "@/lib/memory/apply-intent";
import { loadFanProfile, setProfileCache } from "@/lib/memory/fan-profile";
import { isMemWalLive, namespaceForWallet } from "@/lib/memory/client";
import {
  markWalletJustCommitted,
  recallForWalletDetailed,
  rememberAndWaitForWallet,
  rememberUserTurn,
} from "@/lib/memory/wallet-memory";

export const maxDuration = 60;

/**
 * Dedicated persist route — full 60s budget for rememberAndWait (serverless-safe).
 * Client calls after each chat turn (roast2026wc uses a long-lived server; we split persist).
 */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    walletAddress?: string;
    authMessage?: string;
    authSignature?: string;
    message?: string;
  };

  const walletAddress = body.walletAddress?.trim();
  const message = body.message?.trim();

  if (!walletAddress || !message) {
    return NextResponse.json(
      { error: "walletAddress and message required" },
      { status: 400 },
    );
  }

  const auth = await assertWalletAuth(
    walletAddress,
    body.authMessage,
    body.authSignature,
  );
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!isMemWalLive()) {
    const intent = detectIntent(message);
    const base = await loadFanProfile(walletAddress);
    const profile = applyIntentToProfile(walletAddress, base, intent);
    return NextResponse.json({
      profile,
      memories: [] as string[],
      memoryEnabled: false,
      persisted: false,
      namespace: namespaceForWallet(walletAddress),
    });
  }

  const intent = detectIntent(message);
  const base = await loadFanProfile(walletAddress);
  const profile = applyIntentToProfile(walletAddress, base, intent);

  let persisted = false;
  try {
    await rememberUserTurn(walletAddress, message);

    if (profile.favorite_team) {
      await rememberAndWaitForWallet(
        walletAddress,
        `Favorite team: ${profile.favorite_team}. User supports ${profile.favorite_team} for World Cup 2026.`,
      );
    }

    if (intent.intent === "prediction" && intent.prediction) {
      await rememberAndWaitForWallet(
        walletAddress,
        `Prediction: ${intent.prediction} for ${intent.match ?? "World Cup 2026 match"} — PENDING`,
      );
    }

    if (intent.intent === "report_result" && intent.reported_result) {
      await rememberAndWaitForWallet(
        walletAddress,
        `Match result reported: ${intent.match ?? "match"} actual ${intent.reported_result}`,
      );
    }

    analyzeUserMessage(walletAddress, message);
    persisted = true;
    markWalletJustCommitted(walletAddress);
  } catch (err) {
    console.error("POST /api/memory/commit persist failed:", err);
  }

  setProfileCache(walletAddress, profile);

  // Fresh commit → skip restore; one optimized recall (no duplicate profile fetch).
  const recallOutcome = await recallForWalletDetailed(
    walletAddress,
    "favorite team supports football world cup predictions",
    12,
    { skipRestore: true, skipCache: persisted },
  );
  const memories = recallOutcome.memories;

  let merged = profile;
  for (const line of memories) {
    const m = line.match(
      /(?:Favorite team:|User supports|I support)\s*([A-Za-z][A-Za-z\s'-]+)/i,
    );
    const team = m?.[1]?.trim();
    if (team && team.length >= 3 && !merged.favorite_team) {
      merged = { ...merged, favorite_team: team };
    }
  }

  return NextResponse.json({
    profile: merged,
    memories,
    memoryEnabled: true,
    persisted,
    namespace: namespaceForWallet(walletAddress),
    recallOk: recallOutcome.ok,
    recallError: recallOutcome.error ?? null,
    hitCount: recallOutcome.hitCount,
    fromCache: recallOutcome.fromCache ?? false,
    rateLimited: recallOutcome.rateLimited ?? false,
  });
}
