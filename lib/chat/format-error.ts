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

  if (/incorrect api key|invalid_api_key|authentication|401/i.test(raw)) {
    return "Invalid API key. Open Settings, pick the matching provider tab, and paste a fresh key.";
  }

  if (/insufficient_quota|billing|exceeded|rate_limit|429/i.test(raw)) {
    return "API quota or rate limit on this provider. Try another model in the dropdown, or use a different API key.";
  }

  if (/no api key/i.test(raw)) {
    return raw;
  }

  return raw.length > 280 ? `${raw.slice(0, 280)}…` : raw;
}
