import { NextResponse } from "next/server";

import { assertWalletAuth } from "@/lib/auth/verify-wallet";
import { DEFAULT_RECALL_QUERY } from "@/lib/memory/constants";
import { isMemWalLive, namespaceForWallet } from "@/lib/memory/client";
import { buildProfileFromRecallHits } from "@/lib/memory/profile-from-recall";
import { recallForWalletDetailed } from "@/lib/memory/wallet-memory";
import { emptyFanMemory } from "@/lib/memory/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    walletAddress?: string;
    authMessage?: string;
    authSignature?: string;
    query?: string;
  };

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
  }

  const auth = await assertWalletAuth(
    walletAddress,
    body.authMessage,
    body.authSignature,
  );
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const query = body.query?.trim() || DEFAULT_RECALL_QUERY;

  // Single optimized recall — profile derived from same hits (avoids double relayer load).
  const recallOutcome = await recallForWalletDetailed(walletAddress, query, 12);

  const profile =
    recallOutcome.memories.length > 0
      ? buildProfileFromRecallHits(
          recallOutcome.memories.map((text) => ({ text })),
        )
      : emptyFanMemory();

  return NextResponse.json({
    memories: recallOutcome.memories,
    profile,
    memoryEnabled: isMemWalLive(),
    namespace: namespaceForWallet(walletAddress),
    recallOk: recallOutcome.ok,
    recallError: recallOutcome.error ?? null,
    hitCount: recallOutcome.hitCount,
    fromCache: recallOutcome.fromCache ?? false,
    rateLimited: recallOutcome.rateLimited ?? false,
  });
}
