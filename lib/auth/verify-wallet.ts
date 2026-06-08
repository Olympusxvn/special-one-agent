import { verifyPersonalMessageSignature } from "@mysten/sui/verify";

export { buildAuthMessage } from "./messages";

const verifiedSessions = new Map<string, number>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export async function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signature: string,
): Promise<boolean> {
  try {
    const parsed = await verifyPersonalMessageSignature(
      new TextEncoder().encode(message),
      signature,
    );
    const signer =
      typeof parsed === "object" && parsed !== null && "toSuiAddress" in parsed
        ? (parsed as { toSuiAddress: () => string }).toSuiAddress()
        : String(parsed);

    return signer.toLowerCase() === walletAddress.toLowerCase();
  } catch {
    return false;
  }
}

export function markWalletVerified(walletAddress: string): void {
  verifiedSessions.set(walletAddress.toLowerCase(), Date.now());
}

export function isWalletVerified(walletAddress: string): boolean {
  const ts = verifiedSessions.get(walletAddress.toLowerCase());
  if (!ts) return false;
  if (Date.now() - ts > SESSION_TTL_MS) {
    verifiedSessions.delete(walletAddress.toLowerCase());
    return false;
  }
  return true;
}

/** Stateless auth for serverless — verify signature on every request when provided. */
export async function assertWalletAuth(
  walletAddress: string,
  message?: string,
  signature?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!walletAddress?.trim()) {
    return { ok: false, error: "Wallet address required" };
  }

  if (message?.trim() && signature?.trim()) {
    const valid = await verifyWalletSignature(
      walletAddress,
      message,
      signature,
    );
    if (valid) {
      markWalletVerified(walletAddress);
      return { ok: true };
    }
    return { ok: false, error: "Invalid wallet signature" };
  }

  if (isWalletVerified(walletAddress)) {
    return { ok: true };
  }

  return {
    ok: false,
    error: "Wallet not verified. Sign the auth message in the app first.",
  };
}
