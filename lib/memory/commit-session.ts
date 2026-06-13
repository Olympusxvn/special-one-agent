import { JUST_COMMITTED_TTL_MS } from "./constants";

/** Wallet → expiry timestamp (ms). Skip restore() while active. */
const justCommittedUntil = new Map<string, number>();

function walletKey(walletAddress: string): string {
  return walletAddress.toLowerCase();
}

/**
 * Mark wallet as freshly committed — recall should skip restore() for ~45s.
 * Call after rememberAndWait / successful /api/memory/commit persist.
 */
export function markWalletJustCommitted(
  walletAddress: string,
  ttlMs = JUST_COMMITTED_TTL_MS,
): void {
  justCommittedUntil.set(walletKey(walletAddress), Date.now() + ttlMs);
}

export function isWalletJustCommitted(walletAddress: string): boolean {
  const key = walletKey(walletAddress);
  const until = justCommittedUntil.get(key);
  if (!until) return false;
  if (Date.now() > until) {
    justCommittedUntil.delete(key);
    return false;
  }
  return true;
}

export function clearWalletJustCommitted(walletAddress: string): void {
  justCommittedUntil.delete(walletKey(walletAddress));
}
