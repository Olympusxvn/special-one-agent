import { MemWal } from "@mysten-incubation/memwal";

let client: MemWal | null = null;

export function namespaceForWallet(walletAddress: string): string {
  return `special-one-${walletAddress.toLowerCase()}`;
}

export function getMemWalClient(): MemWal | null {
  if (client) return client;

  const key = process.env.MEMWAL_PRIVATE_KEY?.trim();
  const accountId = process.env.MEMWAL_ACCOUNT_ID?.trim();
  if (!key || !accountId) return null;

  client = MemWal.create({
    key,
    accountId,
    serverUrl:
      process.env.MEMWAL_SERVER_URL?.trim() ||
      "https://relayer.memory.walrus.xyz",
    namespace: "default",
  });

  return client;
}

export function isMemWalLive(): boolean {
  return getMemWalClient() !== null;
}
