"use client";

import {
  getPublicMemWalAccountId,
  MEMWAL_DASHBOARD_URL,
  memWalExplorerUrl,
} from "@/lib/memwal/constants";

export function MemWalStatus({ live }: { live: boolean }) {
  const accountId = getPublicMemWalAccountId();

  if (live) {
    return (
      <span className="flex flex-col gap-0.5 text-xs text-foreground/50">
        <span>MemWal 🟢 LIVE</span>
        {accountId && (
          <a
            href={memWalExplorerUrl(accountId)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold/80 underline underline-offset-2 hover:text-gold"
          >
            View MemWalAccount →
          </a>
        )}
      </span>
    );
  }

  return (
    <span className="flex flex-col gap-0.5 text-xs text-foreground/50">
      <span>MemWal ⚪ offline demo</span>
      <a
        href={MEMWAL_DASHBOARD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold/80 underline underline-offset-2 hover:text-gold"
      >
        Setup: wallet → delegate key →
      </a>
    </span>
  );
}
