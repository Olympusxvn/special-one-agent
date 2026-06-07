export interface FixtureSummary {
  id: number;
  date: string;
  status: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  scoreline: string | null;
}

export function formatFixtureResult(fixture: FixtureSummary): string {
  if (!fixture.scoreline) {
    return `${fixture.homeTeam} vs ${fixture.awayTeam} — pending`;
  }
  return `${fixture.homeTeam} ${fixture.scoreline} ${fixture.awayTeam}`;
}

export function isFixtureFinished(fixture: FixtureSummary): boolean {
  return ["FT", "AET", "PEN", "FT_PEN"].includes(fixture.status);
}
