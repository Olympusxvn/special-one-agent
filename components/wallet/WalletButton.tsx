"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export function WalletButton() {
  const account = useCurrentAccount();
  return (
    <div className="flex items-center gap-3">
      {account && (
        <span className="badge-festive hidden rounded-full px-2.5 py-1 text-xs text-gold sm:inline">
          {account.address.slice(0, 6)}…{account.address.slice(-4)}
        </span>
      )}
      <ConnectButton />
    </div>
  );
}
