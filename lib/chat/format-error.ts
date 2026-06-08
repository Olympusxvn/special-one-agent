/** Turn useChat / fetch errors into user-readable text. */
export function formatChatError(error: Error): string {
  const raw = error.message?.trim();
  if (!raw) {
    return "LLM request failed. Check your API key in Settings or try another model.";
  }

  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // not JSON — use raw message
  }

  if (/incorrect api key|invalid_api_key|authentication/i.test(raw)) {
    return "Invalid API key. Open Settings and paste a fresh key from your provider.";
  }

  if (/insufficient_quota|billing|exceeded/i.test(raw)) {
    return "API quota or billing issue on your LLM account. Check your provider dashboard.";
  }

  return raw.length > 280 ? `${raw.slice(0, 280)}…` : raw;
}
