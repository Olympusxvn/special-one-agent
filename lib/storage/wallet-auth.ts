export const WALLET_AUTH_STORAGE_KEY = "wallet_auth_proof";

export type WalletAuthProof = {
  walletAddress: string;
  message: string;
  signature: string;
};

export function getStoredWalletAuth(): WalletAuthProof | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(WALLET_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WalletAuthProof;
    if (
      parsed.walletAddress &&
      parsed.message &&
      parsed.signature
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setStoredWalletAuth(proof: WalletAuthProof): void {
  sessionStorage.setItem(WALLET_AUTH_STORAGE_KEY, JSON.stringify(proof));
}

export function clearStoredWalletAuth(): void {
  sessionStorage.removeItem(WALLET_AUTH_STORAGE_KEY);
}
