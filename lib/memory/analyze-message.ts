import { getMemWalClient, namespaceForWallet } from "./client";

/**
 * MemWal official chatbot pattern: extract facts from user text via analyze().
 * @see https://github.com/MystenLabs/MemWal — withMemWal autoSave uses analyze()
 */
export function analyzeUserMessage(
  walletAddress: string,
  text: string,
): void {
  const client = getMemWalClient();
  if (!client || !text.trim()) return;

  const namespace = namespaceForWallet(walletAddress);
  void client.analyze(text.trim(), namespace).catch((err) => {
    console.error("analyzeUserMessage failed:", err);
  });
}
