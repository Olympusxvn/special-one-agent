import { NextResponse } from "next/server";

import { isWalletVerified } from "@/lib/auth/verify-wallet";
import { syncPendingPredictions } from "@/lib/football/sync-predictions";

export async function POST(req: Request) {
  const body = (await req.json()) as { walletAddress?: string };
  const walletAddress = body.walletAddress?.trim();

  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
  }

  if (!isWalletVerified(walletAddress)) {
    return NextResponse.json({ error: "Wallet not verified" }, { status: 401 });
  }

  const result = await syncPendingPredictions(walletAddress);
  return NextResponse.json(result);
}
