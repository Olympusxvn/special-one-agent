import type { FanMemory } from "@/lib/memory/types";
import { emptyFanMemory } from "@/lib/memory/types";

const PREFIX = "special-one-profile:";

export function loadCachedFanProfile(walletAddress: string): FanMemory | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${walletAddress.toLowerCase()}`);
    if (!raw) return null;
    return JSON.parse(raw) as FanMemory;
  } catch {
    return null;
  }
}

export function saveCachedFanProfile(
  walletAddress: string,
  profile: FanMemory,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${PREFIX}${walletAddress.toLowerCase()}`,
      JSON.stringify(profile),
    );
  } catch {
    // quota / private mode
  }
}

export function clearCachedFanProfile(walletAddress: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${PREFIX}${walletAddress.toLowerCase()}`);
}

export function cachedOrEmpty(walletAddress: string): FanMemory {
  return loadCachedFanProfile(walletAddress) ?? emptyFanMemory();
}
