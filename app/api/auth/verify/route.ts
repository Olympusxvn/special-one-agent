import { NextResponse } from "next/server";

import {
  markWalletVerified,
  verifyWalletSignature,
} from "@/lib/auth/verify-wallet";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    walletAddress?: string;
    message?: string;
    signature?: string;
  };

  const { walletAddress, message, signature } = body;

  if (!walletAddress || !message || !signature) {
    return NextResponse.json(
      { error: "walletAddress, message, and signature required" },
      { status: 400 },
    );
  }

  const valid = await verifyWalletSignature(walletAddress, message, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  markWalletVerified(walletAddress);
  return NextResponse.json({ ok: true });
}
