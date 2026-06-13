/**
 * National team crest paths from fifa-world-cup-2026.football-logos.cc
 * (128×128 PNGs in /public/world-cup-logos/).
 */

const LOGO_DIR = "/world-cup-logos";

/** Team name aliases → logo filename slug (without .png). */
const TEAM_LOGO_SLUG: Record<string, string> = {
  algeria: "algeria",
  argentina: "argentina",
  australia: "australia",
  austria: "austria",
  belgium: "belgium",
  "bosnia and herzegovina": "bosnia-and-herzegovina",
  "bosnia-herzegovina": "bosnia-and-herzegovina",
  bosnia: "bosnia-and-herzegovina",
  brazil: "brazil",
  "cape verde": "cabo-verde",
  "cabo verde": "cabo-verde",
  canada: "canada",
  colombia: "colombia",
  "dr congo": "congo-dr",
  "democratic republic of the congo": "congo-dr",
  "congo dr": "congo-dr",
  "ivory coast": "cote-d-ivoire",
  "cote d'ivoire": "cote-d-ivoire",
  "côte d'ivoire": "cote-d-ivoire",
  croatia: "croatia",
  curacao: "curacao",
  "czech republic": "czech-republic",
  czechia: "czech-republic",
  ecuador: "ecuador",
  egypt: "egypt",
  england: "england",
  france: "france",
  germany: "germany",
  ghana: "ghana",
  haiti: "haiti",
  iran: "iran",
  iraq: "iraq",
  japan: "japan",
  jordan: "jordan",
  mexico: "mexico",
  morocco: "morocco",
  netherlands: "dutch",
  dutch: "dutch",
  "new zealand": "new-zealand",
  norway: "norway",
  panama: "panama",
  paraguay: "paraguay",
  portugal: "portuguese-football-federation",
  qatar: "qatar",
  "saudi arabia": "saudi-arabia",
  scotland: "scotland",
  senegal: "senegal",
  "south africa": "south-africa",
  "south korea": "south-korea",
  korea: "south-korea",
  spain: "spain",
  sweden: "sweden",
  switzerland: "switzerland",
  tunisia: "tunisia",
  turkey: "turkey",
  uruguay: "uruguay",
  usa: "usa",
  "united states": "usa",
  "united states of america": "usa",
  uzbekistan: "uzbekistan",
};

/** Public URL for a national-team crest, or null if unknown / TBD. */
export function teamNameToLogoSrc(
  teamName: string | null | undefined,
): string | null {
  if (!teamName?.trim()) return null;
  const key = teamName.trim().toLowerCase();
  if (/^tbd$/i.test(key)) return null;

  if (TEAM_LOGO_SLUG[key]) return `${LOGO_DIR}/${TEAM_LOGO_SLUG[key]}.png`;

  for (const [alias, logoSlug] of Object.entries(TEAM_LOGO_SLUG)) {
    if (key.includes(alias) || alias.includes(key)) {
      return `${LOGO_DIR}/${logoSlug}.png`;
    }
  }

  return null;
}
