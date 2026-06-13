#!/usr/bin/env node
/**
 * Verify MemWal mainnet env (delegate key + account ID).
 * Run: node scripts/verify-memwal-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
    break;
  }
}

loadEnvFile();

const key =
  process.env.MEMWAL_PRIVATE_KEY?.trim() ||
  process.env.MEMWAL_DELEGATE_KEY?.trim();
const accountId = process.env.MEMWAL_ACCOUNT_ID?.trim();
const serverUrl =
  process.env.MEMWAL_SERVER_URL?.trim() || "https://relayer.memory.walrus.xyz";

console.log("\n=== MemWal env check (Mr. Toxic Special One) ===\n");

if (!key || !accountId) {
  console.log("❌ Missing MEMWAL_PRIVATE_KEY or MEMWAL_ACCOUNT_ID\n");
  console.log("Setup (operator):");
  console.log("  1. https://memory.walrus.xyz/dashboard");
  console.log("  2. Connect wallet (Sui mainnet)");
  console.log("  3. Create MemWalAccount (first time)");
  console.log("  4. Create DELEGATE key (not owner key)");
  console.log("  5. Copy to .env.local — see docs/MEMWAL_SETUP.md\n");
  process.exit(1);
}

console.log("✓ MEMWAL_PRIVATE_KEY set (delegate)");
console.log(`✓ MEMWAL_ACCOUNT_ID: ${accountId}`);
console.log(`✓ MEMWAL_SERVER_URL: ${serverUrl}`);
console.log(`\nExplorer: https://suiscan.xyz/mainnet/object/${accountId}`);
console.log(
  "\nUsers: connect Sui wallet in app only — namespace mr-toxic-special-one-{address}\n",
);

process.exit(0);
