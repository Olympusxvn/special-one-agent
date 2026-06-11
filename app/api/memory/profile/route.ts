import { NextResponse } from "next/server";

import { assertWalletAuth } from "@/lib/auth/verify-wallet";

export const maxDuration = 60;
import { loadFanProfile } from "@/lib/memory/fan-profile";
import { computeToxicityLevel } from "@/lib/memory/toxicity";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    walletAddress?: string;
    authMessage?: string;
    authSignature?: string;
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

  const profile = await loadFanProfile(walletAddress);
  const toxicityLevel = computeToxicityLevel(profile);

  return NextResponse.json({
    profile,
    toxicityLevel,
    namespace: `special-one-${walletAddress.toLowerCase()}`,
  });
}
