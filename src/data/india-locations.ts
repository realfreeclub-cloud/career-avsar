/**
 * Career Avsar – Regional Service Locations Configuration
 * Approved Initial Service Locations: Six Districts of Uttar Pradesh
 * 1. Pratapgarh
 * 2. Amethi
 * 3. Jaunpur
 * 4. Prayagraj (Canonical; Allahabad is an alias)
 * 5. Raebareli (Canonical spelling)
 * 6. Sultanpur
 */

export const DEFAULT_COUNTRY = "India";
export const DEFAULT_STATE = "Uttar Pradesh";

export const ACTIVE_REGIONAL_DISTRICTS = [
  "Pratapgarh",
  "Amethi",
  "Jaunpur",
  "Prayagraj",
  "Raebareli",
  "Sultanpur",
] as const;

export type RegionalDistrict = (typeof ACTIVE_REGIONAL_DISTRICTS)[number];

/**
 * Historical or legacy districts (kept for backwards compatibility of existing teacher/job records)
 */
export const HISTORICAL_DISTRICTS = ["Lucknow", "Barabanki"] as const;

/**
 * Common search and legacy aliases mapped to the canonical district name.
 * Prayagraj is canonical; Allahabad resolves to Prayagraj.
 * Raebareli is canonical; alternate spellings resolve to Raebareli.
 */
export const DISTRICT_ALIASES: Record<string, RegionalDistrict> = {
  allahabad: "Prayagraj",
  prayag: "Prayagraj",
  ilhabad: "Prayagraj",
  "rae bareli": "Raebareli",
  "rai bareli": "Raebareli",
  raebarelly: "Raebareli",
  sooltanpoor: "Sultanpur",
  "bela pratapgarh": "Pratapgarh",
};

/**
 * Resolves any legacy or alias name to its canonical district name.
 */
export function canonicalizeDistrict(input?: string | null): string {
  if (!input) return "";
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  if (DISTRICT_ALIASES[lower]) {
    return DISTRICT_ALIASES[lower];
  }
  // Check exact case-insensitive match against active districts
  const matched = ACTIVE_REGIONAL_DISTRICTS.find((d) => d.toLowerCase() === lower);
  if (matched) return matched;
  return trimmed;
}

export const STATE_OPTIONS = [{ value: DEFAULT_STATE, label: DEFAULT_STATE }];

export const ACTIVE_DISTRICT_OPTIONS = ACTIVE_REGIONAL_DISTRICTS.map((d) => ({
  value: d,
  label: d,
}));

export function districtOptions(state?: string): { value: string; label: string }[] {
  // If state is not specified or is Uttar Pradesh, return active regional districts
  if (!state || state.toLowerCase() === DEFAULT_STATE.toLowerCase()) {
    return [...ACTIVE_DISTRICT_OPTIONS];
  }
  return [];
}

/**
 * Checks if a given district name is currently one of the six active initial districts.
 */
export function isRegionalDistrictActive(districtName?: string | null): boolean {
  if (!districtName) return false;
  const canonical = canonicalizeDistrict(districtName);
  return (ACTIVE_REGIONAL_DISTRICTS as readonly string[]).includes(canonical);
}
