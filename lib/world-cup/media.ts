export type WorldCupMediaItem = {
  id: string;
  src: string;
  width: number;
  height: number;
  title: string;
  caption: string;
  team: string;
};

export const WORLD_CUP_MEDIA: WorldCupMediaItem[] = [
  {
    id: "wc01",
    src: "/world-cup-media/wc01.png",
    width: 1254,
    height: 1254,
    title: "France · #10",
    caption: "Walrus striker in full flow — World Cup 2026, Stade de France energy.",
    team: "France",
  },
  {
    id: "wc02",
    src: "/world-cup-media/wc02.png",
    width: 1254,
    height: 1254,
    title: "Belgium · #1",
    caption: "Full-stretch save. The walrus keeper denies everything but the receipts.",
    team: "Belgium",
  },
  {
    id: "wc03",
    src: "/world-cup-media/wc03.png",
    width: 1254,
    height: 1254,
    title: "Spain · #19",
    caption: "GOOOOL — celebration dab on the pitch. España leads 1-0.",
    team: "Spain",
  },
  {
    id: "wc04",
    src: "/world-cup-media/wc04.png",
    width: 1122,
    height: 1402,
    title: "Brazil · The Special One",
    caption: "Touchline authority. José Mourinho meets Walrus — Brazil sideline.",
    team: "Brazil",
  },
];
