import { MemWal } from "@mysten-incubation/memwal";

import { AGENT_MEMORY_PREFIX } from "./constants";

const clients = new Map<string, MemWal>();

/** Per-wallet namespace: mr-toxic-special-one-{address} */
export function namespaceForWallet(walletAddress: string): string {
  return `${AGENT_MEMORY_PREFIX}-${walletAddress.toLowerCase()}`;
}

function delegateKey(): string | null {
  return (
    process.env.MEMWAL_PRIVATE_KEY?.trim() ||
    process.env.MEMWAL_DELEGATE_KEY?.trim() ||
    null
  );
}

function accountId(): string | null {
  return process.env.MEMWAL_ACCOUNT_ID?.trim() || null;
}

function relayerUrl(): string {
  return (
    process.env.MEMWAL_SERVER_URL?.trim() ||
    process.env.MEMWAL_RELAYER_URL?.trim() ||
    "https://relayer.memory.walrus.xyz"
  );
}

export function isMemWalLive(): boolean {
  return Boolean(delegateKey() && accountId());
}

/** Per-wallet MemWal client — namespace bound at create + passed per call. */
export function getClientForWallet(walletAddress: string): MemWal | null {
  if (!isMemWalLive()) return null;

  const namespace = namespaceForWallet(walletAddress);
  let client = clients.get(namespace);
  if (!client) {
    client = MemWal.create({
      key: delegateKey()!,
      accountId: accountId()!,
      serverUrl: relayerUrl(),
      namespace,
    });
    clients.set(namespace, client);
  }
  return client;
}

/** @deprecated Use getClientForWallet(wallet) */
export function getMemWalClient(): MemWal | null {
  return getClientForWallet("default");
}
