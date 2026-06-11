import { NextResponse } from "next/server";

import { assertWalletAuth } from "@/lib/auth/verify-wallet";
import { isMemWalLive, namespaceForWallet } from "@/lib/memory/client";
import {
  loadProfileFromWalrus,
  recallForWallet,
} from "@/lib/memory/wallet-memory";

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

  const query =
    body.query?.trim() ||
    "favorite team supports football world cup predictions bad takes";

  const [memories, profile] = await Promise.all([
    recallForWallet(walletAddress, query, 12),
    loadProfileFromWalrus(walletAddress),
  ]);

  return NextResponse.json({
    memories,
    profile,
    memoryEnabled: isMemWalLive(),
    namespace: namespaceForWallet(walletAddress),
  });
}
