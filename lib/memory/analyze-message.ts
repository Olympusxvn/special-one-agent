import { getClientForWallet } from "./client";

/**
 * MemWal withMemWal autoSave pattern — extract facts from user text.
 */
export function analyzeUserMessage(
  walletAddress: string,
  text: string,
): void {
  const client = getClientForWallet(walletAddress);
  if (!client || !text.trim()) return;

  void client.analyze(text.trim()).catch((err) => {
    console.error("analyzeUserMessage failed:", err);
  });
}
