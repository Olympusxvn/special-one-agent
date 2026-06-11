/** One-tap demo inputs for judges — tap to fill the chat box, then Send. */
export const DEMO_PROMPTS: { label: string; text: string }[] = [
  {
    label: "🇧🇷 Brazil fan",
    text: "I support Brazil! We are definitely winning the World Cup 100%!",
  },
  {
    label: "⚽ Predict score",
    text: "Mexico will beat South Africa 2-1",
  },
  {
    label: "🇺🇸 USA hype",
    text: "I predict USA 3-0 Panama in the group stage!",
  },
  {
    label: "🇫🇷 Pick France",
    text: "France",
  },
  {
    label: "🔀 Flip-flop",
    text: "Actually I support Argentina now, Brazil is finished.",
  },
  {
    label: "📊 Report result",
    text: "France beat Germany 2-1 in the quarter-final",
  },
  {
    label: "🔥 Banter",
    text: "Messi is finished — this World Cup belongs to the kids!",
  },
];

/** Demo lines surfaced per judge-guide step (tap → fill chat input). */
export const GUIDE_STEP_PROMPTS: Record<number, { label: string; text: string }[]> = {
  3: [
    { label: "🇧🇷 Brazil fan", text: DEMO_PROMPTS[0]!.text },
    { label: "🇫🇷 Pick France", text: DEMO_PROMPTS[3]!.text },
  ],
  4: [{ label: "⚽ Predict score", text: DEMO_PROMPTS[1]!.text }],
  5: [{ label: "📊 Report result", text: DEMO_PROMPTS[5]!.text }],
  7: [{ label: "🔀 Flip-flop", text: DEMO_PROMPTS[4]!.text }],
};
