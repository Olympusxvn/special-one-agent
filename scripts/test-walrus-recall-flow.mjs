#!/usr/bin/env node
/**
 * E2E Walrus recall test — simulates multiple chat turns (commit + notebook).
 * Run: node scripts/test-walrus-recall-flow.mjs
 * Requires: dev server on :3000, MemWal env in .env.local
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

function loadEnvFile() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
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

const CHAT_TURNS = [
  "I support Brazil! Brazil will beat Argentina 3-1 in the World Cup.",
  "Still backing Brazil. I predict Brazil wins the whole tournament.",
  "Remember my Brazil 3-1 call — I'm not flip-flopping.",
];

async function signAuth(keypair) {
  const address = keypair.getPublicKey().toSuiAddress();
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `mr-toxic-special-one wants you to sign in with your Sui account:\n${address}\n\nTimestamp: ${timestamp}`;
  const { signature } = await keypair.signPersonalMessage(
    new TextEncoder().encode(message),
  );
  return { walletAddress: address, authMessage: message, authSignature: signature };
}

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log("\n=== Walrus recall E2E (simulated chat turns) ===\n");
  console.log(`Server: ${BASE}\n`);

  const keypair = Ed25519Keypair.generate();
  const auth = await signAuth(keypair);
  console.log(`Test wallet: ${auth.walletAddress.slice(0, 18)}…\n`);

  for (let i = 0; i < CHAT_TURNS.length; i++) {
    const message = CHAT_TURNS[i];
    console.log(`[Turn ${i + 1}] Commit: "${message.slice(0, 50)}…"`);
    const started = Date.now();
    const { ok, status, data } = await postJson("/api/memory/commit", {
      ...auth,
      message,
    });
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    if (!ok) {
      console.error(`  ❌ commit failed (${status}):`, data.error ?? data);
      process.exit(1);
    }
    console.log(
      `  ✓ persisted=${data.persisted} recallOk=${data.recallOk} hits=${data.hitCount} rateLimited=${data.rateLimited ?? false} fromCache=${data.fromCache ?? false} (${elapsed}s)`,
    );
    if (data.memories?.length) {
      console.log(`  sample: ${data.memories[0]?.slice(0, 80)}…`);
    }
  }

  console.log("\n[Notebook] Final Walrus recall check…");
  const notebook = await postJson("/api/memory/notebook", {
    ...auth,
    query: "Brazil predictions favorite team World Cup",
  });
  if (!notebook.ok) {
    console.error("  ❌ notebook failed:", notebook.data);
    process.exit(1);
  }

  const { data } = notebook;
  const brazilHits = (data.memories ?? []).filter((m) =>
    /brazil/i.test(m),
  );

  console.log(`  namespace: ${data.namespace}`);
  console.log(`  recallOk: ${data.recallOk}  hitCount: ${data.hitCount}  rateLimited: ${data.rateLimited ?? false}  fromCache: ${data.fromCache ?? false}`);
  console.log(`  team: ${data.profile?.favorite_team ?? "(none)"}`);
  console.log(`  Brazil-related memories: ${brazilHits.length}`);

  for (const [i, mem] of (data.memories ?? []).slice(0, 5).entries()) {
    console.log(`  ${i + 1}. ${mem.slice(0, 100)}${mem.length > 100 ? "…" : ""}`);
  }

  if (!data.recallOk || (data.hitCount ?? 0) === 0) {
    console.error("\n❌ FAIL — no memories recalled from Walrus\n");
    process.exit(1);
  }

  if (!brazilHits.length && !data.profile?.favorite_team) {
    console.warn("\n⚠ WARN — recalls returned but Brazil not detected in hits\n");
  } else {
    console.log("\n✅ PASS — Walrus recall working after multiple turns\n");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
