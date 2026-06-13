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
      <span className="mt-1 flex flex-wrap items-center gap-2">
        <span className="walrus-badge walrus-badge-live">Memory live</span>
        {accountId && (
          <a
            href={memWalExplorerUrl(accountId)}
            target="_blank"
            rel="noopener noreferrer"
            className="walrus-caption text-brand-light hover:text-accent hover:underline"
          >
            Explorer
          </a>
        )}
      </span>
    );
  }

  return (
    <span className="mt-1 flex flex-wrap items-center gap-2">
      <span className="walrus-badge">Memory offline</span>
      <a
        href={MEMWAL_DASHBOARD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="walrus-caption hover:text-accent hover:underline"
      >
        Setup
      </a>
    </span>
  );
}
