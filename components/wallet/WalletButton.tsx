"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export function WalletButton() {
  const account = useCurrentAccount();
  return (
    <div className="flex items-center gap-3">
      {account && (
        <span className="hidden text-xs text-gold/80 sm:inline">
          {account.address.slice(0, 6)}…{account.address.slice(-4)}
        </span>
      )}
      <ConnectButton />
    </div>
  );
}
