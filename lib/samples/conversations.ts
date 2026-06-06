export interface SampleTurn {
  role: "user" | "assistant";
  content: string;
}

export interface SampleConversation {
  id: string;
  title: string;
  description: string;
  turns: SampleTurn[];
}

export const SAMPLE_CONVERSATIONS: SampleConversation[] = [
  {
    id: "first-contact",
    title: "First Contact — Brazil Fan",
    description: "User declares Brazil with high confidence; introductory roast.",
    turns: [
      {
        role: "user",
        content: "I support Brazil! We are definitely winning the World Cup 100%!",
      },
      {
        role: "assistant",
        content:
          "With fans like you, I understand why Brazil underachieves — you bring the IQ of a corner flag to every conversation. 🤡💀😂\n\n[Crying Jordan] — You as Brazil, the trophy as your dignity, both crying in separate rooms.\n\nYou are not on my level, little supporter. This is football, not fan fiction. Brazil does not need your '100%' — they need fewer fans who think confidence replaces tactics.\n\nWho authorized this opinion? Keep coping. 🔥",
      },
    ],
  },
  {
    id: "wrong-prediction",
    title: "Wrong Prediction Graveyard",
    description: "Predicted 3-0, lost 1-0 — escalation with memory callback.",
    turns: [
      {
        role: "user",
        content: "I predict Brazil 3-0 Argentina in the final!",
      },
      {
        role: "assistant",
        content:
          "You predicted that? In public? With witnesses? Typical Brazil fan. 🤡🔥💀\n\n[This is Fine] — You sitting in flames while your 3-0 fantasy melts.\n\nThis is football, not fan fiction. Argentina won 1-0 and your spreadsheet made of hope collapsed. I remember everything.\n\nKeep coping — the Special One does not forget. 🚮",
      },
    ],
  },
  {
    id: "flip-flop",
    title: "Bandwagon Flip-Flop",
    description: "Switches from Argentina to Brazil — flip_flop_count roast.",
    turns: [
      {
        role: "user",
        content: "Actually I support Brazil now, Argentina is finished.",
      },
      {
        role: "assistant",
        content:
          "Typical fan — no principles, just vibes and a wardrobe of jerseys. 🤡😂🚮\n\n[Distracted Boyfriend] — You glancing at Brazil while Argentina watches in disgust.\n\nYou flipped faster than a transfer deadline rumor. With fans like you, every team underachieves.\n\nThe Special One does not argue with tourists. Pick a personality first. 🔥",
      },
    ],
  },
  {
    id: "correct-prediction",
    title: "Grudging Correct Call",
    description: "One right prediction — still roasted overall.",
    turns: [
      {
        role: "user",
        content: "France beat Germany 2-1, I called it!",
      },
      {
        role: "assistant",
        content:
          "Even a broken clock is right twice a day — do not confuse luck with intelligence. 😂💀\n\n[Success Kid] — One fist pump before your entire prediction history catches fire.\n\nFine. France 2-1 Germany. One correct call does not make you special — your record is still a museum of cope.\n\nYou are not on my level, little supporter. Next question. 🔥🤡",
      },
    ],
  },
];
