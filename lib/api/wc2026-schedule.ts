import { teamNameToCode } from "@/lib/teams/team-flags";

import type { WorldCupMatch, WorldCupTeam } from "./worldcup";

/**
 * Curated FIFA World Cup 2026 fallback schedule.
 *
 * Used ONLY when no live data source is configured/reachable. It models the
 * real tournament structure — 12 groups of 4, the 16 official host venues, and
 * the group-stage date window (Jun 11–27, 2026) — WITHOUT fabricating any
 * scores. Every match is `scheduled`, so the Results tab stays empty until a
 * live provider supplies real outcomes. This is what fixes the previous
 * "wrong results" problem (no more invented 2-1 finals).
 *
 * Group composition is a plausible fallback draw, not the official FIFA draw.
 */

interface Venue {
  stadium: string;
  city: string;
}

// 16 real WC 2026 host venues.
const VENUES: Venue[] = [
  { stadium: "Estadio Azteca", city: "Mexico City" },
  { stadium: "MetLife Stadium", city: "New York / New Jersey" },
  { stadium: "SoFi Stadium", city: "Los Angeles" },
  { stadium: "AT&T Stadium", city: "Dallas" },
  { stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  { stadium: "Hard Rock Stadium", city: "Miami" },
  { stadium: "NRG Stadium", city: "Houston" },
  { stadium: "Arrowhead Stadium", city: "Kansas City" },
  { stadium: "Lincoln Financial Field", city: "Philadelphia" },
  { stadium: "Levi's Stadium", city: "San Francisco Bay Area" },
  { stadium: "Lumen Field", city: "Seattle" },
  { stadium: "Gillette Stadium", city: "Boston" },
  { stadium: "BMO Field", city: "Toronto" },
  { stadium: "BC Place", city: "Vancouver" },
  { stadium: "Estadio Akron", city: "Guadalajara" },
  { stadium: "Estadio BBVA", city: "Monterrey" },
];

// 12 groups × 4 teams (hosts seeded first in A/B/D). Plausible fallback draw.
const GROUPS: Record<string, string[]> = {
  A: ["Mexico", "Croatia", "Saudi Arabia", "Ecuador"],
  B: ["Canada", "Belgium", "Morocco", "Japan"],
  C: ["Argentina", "Denmark", "Nigeria", "Australia"],
  D: ["USA", "Netherlands", "Egypt", "Paraguay"],
  E: ["Brazil", "Switzerland", "Senegal", "Costa Rica"],
  F: ["France", "Sweden", "Ghana", "Peru"],
  G: ["Spain", "Serbia", "Ivory Coast", "Panama"],
  H: ["Portugal", "Poland", "Cameroon", "Jamaica"],
  I: ["England", "Austria", "Tunisia", "New Zealand"],
  J: ["Germany", "Colombia", "Algeria", "South Korea"],
  K: ["Uruguay", "Turkey", "Iran", "South Africa"],
  L: ["Italy", "Chile", "Ukraine", "Qatar"],
};

// Round-robin pairings for a 4-team group across 3 matchdays.
const MATCHDAYS: [number, number][][] = [
  [
    [0, 1],
    [2, 3],
  ],
  [
    [0, 2],
    [1, 3],
  ],
  [
    [0, 3],
    [1, 2],
  ],
];

// Matchday start dates (group stage spans Jun 11–27, 2026).
const MATCHDAY_START = ["2026-06-11", "2026-06-18", "2026-06-24"];
const KICKOFF_UTC = ["16:00", "19:00", "22:00"];

function toTeam(name: string): WorldCupTeam {
  return { name, code: teamNameToCode(name) };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Real venue → host city (used to enrich keyless live feeds that omit city).
const VENUE_CITY: Record<string, string> = Object.fromEntries(
  VENUES.map((v) => [v.stadium.toLowerCase(), v.city]),
);

export function venueToCity(venue: string | null | undefined): string | null {
  if (!venue?.trim()) return null;
  const key = venue.trim().toLowerCase();
  if (VENUE_CITY[key]) return VENUE_CITY[key];
  for (const [stadium, city] of Object.entries(VENUE_CITY)) {
    if (key.includes(stadium) || stadium.includes(key)) return city;
  }
  return null;
}

let cached: WorldCupMatch[] | null = null;

/** Deterministically build the full group-stage fixture list. */
export function buildFallbackSchedule(): WorldCupMatch[] {
  if (cached) return cached;

  const matches: WorldCupMatch[] = [];
  const groupKeys = Object.keys(GROUPS);
  let id = 2026_0000;
  let venueIdx = 0;

  groupKeys.forEach((groupKey, groupIdx) => {
    const teams = GROUPS[groupKey]!;
    MATCHDAYS.forEach((pairings, md) => {
      // Stagger groups across days so the schedule reads naturally.
      const dayOffset = Math.floor(groupIdx / 2);
      const date = addDays(MATCHDAY_START[md]!, dayOffset);
      pairings.forEach(([h, a], slot) => {
        const venue = VENUES[venueIdx % VENUES.length]!;
        venueIdx += 1;
        const time = KICKOFF_UTC[slot % KICKOFF_UTC.length]!;
        matches.push({
          id: id++,
          dateUtc: `${date}T${time}:00+00:00`,
          status: "scheduled",
          statusShort: "NS",
          minute: null,
          home: toTeam(teams[h]!),
          away: toTeam(teams[a]!),
          homeScore: null,
          awayScore: null,
          venue: venue.stadium,
          city: venue.city,
          group: `Group ${groupKey}`,
          stage: "Group Stage",
        });
      });
    });
  });

  cached = matches;
  return matches;
}

/** Group → ordered team list (for the Groups tab), derived from the draw. */
export function getFallbackGroups(): { group: string; teams: WorldCupTeam[] }[] {
  return Object.entries(GROUPS).map(([key, teams]) => ({
    group: `Group ${key}`,
    teams: teams.map(toTeam),
  }));
}
