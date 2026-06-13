#!/usr/bin/env node
/**
 * Sync selected keys from .env.local to Vercel (production, preview, development).
 * Usage: node scripts/sync-vercel-env.mjs
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILE = resolve(process.cwd(), ".env.local");
const ENVIRONMENTS = ["production", "preview", "development"];

const PRODUCTION_OVERRIDES = {
  AUTH_MESSAGE_DOMAIN: "special-one-agent.vercel.app",
  NEXT_PUBLIC_AUTH_MESSAGE_DOMAIN: "special-one-agent.vercel.app",
};

const KEYS = [
  "MEMWAL_PRIVATE_KEY",
  "MEMWAL_ACCOUNT_ID",
  "MEMWAL_SERVER_URL",
  "MEMWAL_RELAYER_URL",
  "NEXT_PUBLIC_MEMWAL_ACCOUNT_ID",
  "AUTH_MESSAGE_DOMAIN",
  "NEXT_PUBLIC_AUTH_MESSAGE_DOMAIN",
  "NEXT_PUBLIC_SUI_NETWORK",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "OPENROUTER_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "API_FOOTBALL_KEY",
];

function loadEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (val) out[key] = val;
  }
  return out;
}

function vercel(cmd) {
  execSync(`pnpm exec vercel ${cmd}`, {
    stdio: "pipe",
    encoding: "utf8",
    cwd: process.cwd(),
  });
}

function removeEnv(name, env) {
  try {
    vercel(`env rm ${name} ${env} --yes`);
  } catch {
    /* not present */
  }
}

function addEnv(name, value, env) {
  execSync(`pnpm exec vercel env add ${name} ${env} --yes`, {
    input: value,
    stdio: ["pipe", "pipe", "pipe"],
    cwd: process.cwd(),
  });
}

const local = loadEnv(ENV_FILE);
if (!local.MEMWAL_PRIVATE_KEY || !local.MEMWAL_ACCOUNT_ID) {
  console.error("❌ .env.local missing MEMWAL_PRIVATE_KEY or MEMWAL_ACCOUNT_ID");
  process.exit(1);
}

console.log("\n=== Syncing env → Vercel (special-one-agent) ===\n");

for (const env of ENVIRONMENTS) {
  console.log(`— ${env} —`);
  for (const key of KEYS) {
    let value = local[key];
    if (!value && key === "MEMWAL_RELAYER_URL" && local.MEMWAL_SERVER_URL) {
      value = local.MEMWAL_SERVER_URL;
    }
    if (env === "production" && PRODUCTION_OVERRIDES[key]) {
      value = PRODUCTION_OVERRIDES[key];
    }
    if (!value) continue;

    removeEnv(key, env);
    try {
      addEnv(key, value, env);
      console.log(`  ✓ ${key}`);
    } catch (err) {
      console.error(`  ✗ ${key}:`, err.stderr?.toString() || err.message);
      process.exit(1);
    }
  }
}

console.log("\n✓ Done. Run: pnpm build && pnpm exec vercel --prod\n");
