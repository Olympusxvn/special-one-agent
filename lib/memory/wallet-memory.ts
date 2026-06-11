import { getClientForWallet, isMemWalLive, namespaceForWallet } from "./client";
import { buildProfileFromRecallHits } from "./profile-from-recall";
import type { FanMemory } from "./types";
import { emptyFanMemory } from "./types";

const REMEMBER_TIMEOUT_MS = 60_000;

interface RecallItemLike {
  text?: string;
  content?: string;
  memory?: string;
  snippet?: string;
}

function recallText(item: RecallItemLike): string {
  return (item.text ?? item.content ?? item.memory ?? item.snippet ?? "").trim();
}

/**
 * Write one memory and wait for indexing — matches roast2026wc / daily-walrus pattern.
 * @see https://github.com/tienlenan/walrus-wc-2026-agentic-ai-hackathon
 */
export async function rememberAndWaitForWallet(
  walletAddress: string,
  text: string,
  timeoutMs = REMEMBER_TIMEOUT_MS,
): Promise<void> {
  const client = getClientForWallet(walletAddress);
  if (!client || !text.trim()) return;
  await client.rememberAndWait(text.trim(), undefined, { timeoutMs });
}

/** Fire-and-forget remember (chat hot path). */
export function rememberForWallet(walletAddress: string, text: string): void {
  const client = getClientForWallet(walletAddress);
  if (!client || !text.trim()) return;
  void client.remember(text.trim()).catch((err) => {
    console.error("rememberForWallet failed:", err);
  });
}

/** Recall relevant memories for a wallet + query. */
export async function recallForWallet(
  walletAddress: string,
  query: string,
  topK = 10,
): Promise<string[]> {
  const client = getClientForWallet(walletAddress);
  if (!client || !query.trim()) return [];

  const res = await client.recall({ query: query.trim(), limit: topK });
  return (res.results ?? [])
    .map((r) => recallText(r as RecallItemLike))
    .filter(Boolean)
    .slice(0, topK);
}

/** Store full user turn — same string pattern as Gil chatbot. */
export async function rememberUserTurn(
  walletAddress: string,
  message: string,
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) return;
  await rememberAndWaitForWallet(
    walletAddress,
    `User said: "${trimmed.replace(/"/g, "'")}"`,
  );
}

/** Build ledger profile from Walrus recall (notebook pattern). */
export async function loadProfileFromWalrus(
  walletAddress: string,
): Promise<FanMemory> {
  if (!isMemWalLive()) return emptyFanMemory();

  const client = getClientForWallet(walletAddress);
  if (!client) return emptyFanMemory();

  const namespace = namespaceForWallet(walletAddress);

  try {
    await Promise.race([
      client.restore(namespace, 20),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("restore timeout")), 8_000),
      ),
    ]);
  } catch {
    // best-effort
  }

  const query =
    "favorite team supports football world cup predictions bad takes roasts";
  const lines = await recallForWallet(walletAddress, query, 15);

  if (lines.length === 0) {
    const fallback = await recallForWallet(
      walletAddress,
      "User said team support Brazil Argentina France",
      10,
    );
    return buildProfileFromRecallHits(fallback.map((text) => ({ text })));
  }

  return buildProfileFromRecallHits(lines.map((text) => ({ text })));
}
