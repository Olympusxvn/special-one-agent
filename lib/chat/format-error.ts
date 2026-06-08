/** Turn useChat / fetch errors into user-readable text. */
export function formatChatError(error: Error): string {
  const raw = error.message?.trim();
  if (!raw) {
    return "LLM request failed. Try again or switch to Claude Haiku (free) in the model dropdown.";
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

  if (/insufficient_quota|billing|exceeded|rate_limit/i.test(raw)) {
    return "LLM quota or rate limit hit. Switch to Claude Haiku (free) in the dropdown, or try again later.";
  }

  return raw.length > 280 ? `${raw.slice(0, 280)}…` : raw;
}
