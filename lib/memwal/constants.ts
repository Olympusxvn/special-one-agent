export const MEMWAL_DASHBOARD_URL = "https://memory.walrus.xyz/dashboard";

export function memWalExplorerUrl(accountId: string): string {
  const id = accountId.trim();
  if (!id.startsWith("0x")) return `https://suiscan.xyz/mainnet/object/${id}`;
  return `https://suiscan.xyz/mainnet/object/${id}`;
}

export function getPublicMemWalAccountId(): string | null {
  const id = process.env.NEXT_PUBLIC_MEMWAL_ACCOUNT_ID?.trim();
  return id || null;
}
