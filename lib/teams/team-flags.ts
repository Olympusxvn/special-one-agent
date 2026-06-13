/** ISO 3166-1 alpha-2 → flag emoji */
export function countryCodeToFlag(code: string): string {
  const upper = code.toUpperCase().slice(0, 2);
  if (upper.length !== 2) return "🏳️";
  return upper
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}

/** Common World Cup nation names → ISO code (lowercase keys). */
const TEAM_ISO: Record<string, string> = {
  brazil: "BR",
  argentina: "AR",
  france: "FR",
  germany: "DE",
  spain: "ES",
  portugal: "PT",
  england: "GB",
  italy: "IT",
  netherlands: "NL",
  belgium: "BE",
  croatia: "HR",
  uruguay: "UY",
  colombia: "CO",
  chile: "CL",
  mexico: "MX",
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  canada: "CA",
  japan: "JP",
  "south korea": "KR",
  korea: "KR",
  morocco: "MA",
  senegal: "SN",
  nigeria: "NG",
  ghana: "GH",
  cameroon: "CM",
  australia: "AU",
  "saudi arabia": "SA",
  iran: "IR",
  qatar: "QA",
  ecuador: "EC",
  peru: "PE",
  switzerland: "CH",
  poland: "PL",
  serbia: "RS",
  denmark: "DK",
  sweden: "SE",
  wales: "GB",
  scotland: "GB",
  "costa rica": "CR",
  panama: "PA",
  jamaica: "JM",
  honduras: "HN",
  paraguay: "PY",
  venezuela: "VE",
  bolivia: "BO",
  turkey: "TR",
  ukraine: "UA",
  austria: "AT",
  czechia: "CZ",
  "czech republic": "CZ",
  hungary: "HU",
  romania: "RO",
  greece: "GR",
  ireland: "IE",
  "northern ireland": "GB",
  iceland: "IS",
  tunisia: "TN",
  algeria: "DZ",
  egypt: "EG",
  "ivory coast": "CI",
  "south africa": "ZA",
  china: "CN",
  india: "IN",
  indonesia: "ID",
  thailand: "TH",
  vietnam: "VN",
  "new zealand": "NZ",
  "bosnia-herzegovina": "BA",
  "bosnia and herzegovina": "BA",
  bosnia: "BA",
  uzbekistan: "UZ",
  jordan: "JO",
  "cape verde": "CV",
  "cabo verde": "CV",
  curacao: "CW",
  norway: "NO",
  "north macedonia": "MK",
  slovakia: "SK",
  slovenia: "SI",
  finland: "FI",
  "new caledonia": "NC",
};

/** Common World Cup nation names → ISO alpha-2 code (e.g. "Brazil" → "BR"). */
export function teamNameToCode(
  teamName: string | null | undefined,
): string | null {
  if (!teamName?.trim()) return null;
  const key = teamName.trim().toLowerCase();
  if (TEAM_ISO[key]) return TEAM_ISO[key];
  for (const [name, iso] of Object.entries(TEAM_ISO)) {
    if (key.includes(name)) return iso;
  }
  return null;
}

export function teamNameToFlag(teamName: string | null | undefined): string {
  if (!teamName?.trim()) return "🏳️";
  const key = teamName.trim().toLowerCase();
  const code = TEAM_ISO[key];
  if (code) return countryCodeToFlag(code);
  // Partial match: "Brazil national team" → Brazil
  for (const [name, iso] of Object.entries(TEAM_ISO)) {
    if (key.includes(name)) return countryCodeToFlag(iso);
  }
  return "⚽";
}

/** Host + fan-favorite flags for ambient stadium decor */
export const FESTIVAL_FLAGS = [
  "🇺🇸",
  "🇨🇦",
  "🇲🇽",
  "🇧🇷",
  "🇦🇷",
  "🇫🇷",
  "🇩🇪",
  "🇪🇸",
  "🇵🇹",
  "🇬🇧",
  "🇯🇵",
  "🇰🇷",
  "🇳🇬",
  "🇲🇦",
] as const;
