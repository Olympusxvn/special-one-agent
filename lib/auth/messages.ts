export function buildAuthMessage(walletAddress: string): string {
  const domain =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_AUTH_MESSAGE_DOMAIN ?? "mr-toxic-special-one")
      : (process.env.AUTH_MESSAGE_DOMAIN ?? "mr-toxic-special-one");
  const timestamp = Math.floor(Date.now() / 1000);
  return `${domain} wants you to sign in with your Sui account:\n${walletAddress}\n\nTimestamp: ${timestamp}`;
}
