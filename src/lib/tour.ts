// Shared by TourStatus.astro and where-we-are.astro — see README → "Where
// We Are page" for the full schema/setup docs.

export interface Waypoint {
  /** Port name shown on the map, e.g. "Tenerife". */
  name: string;
  lat: number;
  lng: number;
  /** ISO date the ship is at this port. Waypoints don't need to be evenly spaced — sea days between two far-apart dates just interpolate over more days. */
  date: string;
}

export interface TourEntry {
  type: 'cruise' | 'gig';
  /** Cruise only. */
  ship?: string;
  /** Cruise only — shown as the headline location, e.g. "Caribbean & Southern Islands". */
  region?: string;
  /** Cruise only, optional — e.g. "Southampton → Barbados → Southampton". */
  route?: string;
  /**
   * Cruise only, optional — the ports on this voyage with the date the ship
   * is at each one (from the published itinerary). When present, the map
   * on the "Where We Are" page interpolates a daily-updating position
   * between whichever two ports today's date falls between — no live
   * tracking, just date maths against the ports you already know.
   */
  waypoints?: Waypoint[];
  /** Gig only. */
  venue?: string;
  /** Gig only, e.g. "Manchester, UK". */
  city?: string;
  /** Picks which stylised graphic/colour theme this entry uses. Defaults to 'tropical'. */
  theme?: 'tropical' | 'mediterranean' | 'northern' | 'uk';
  /** ISO date, e.g. "2026-11-01". */
  from: string;
  /** ISO date, inclusive. */
  to: string;
  /** Optional free text shown under the entry, e.g. "Public gig — all welcome!". */
  note?: string;
}

export interface ShipPosition {
  lat: number;
  lng: number;
  /** e.g. "At Tenerife" or "Between Tenerife and Barbados". */
  label: string;
}

/** Interpolates today's position along `waypoints` by date. Returns undefined if there are fewer than 2 waypoints. */
export function getShipPosition(waypoints: Waypoint[], today: Date = new Date()): ShipPosition | undefined {
  if (waypoints.length < 2) return undefined;
  const sorted = [...waypoints].sort((a, b) => a.date.localeCompare(b.date));
  const todayStr = today.toISOString().slice(0, 10);

  if (todayStr <= sorted[0].date) {
    return { lat: sorted[0].lat, lng: sorted[0].lng, label: `At ${sorted[0].name}` };
  }
  const last = sorted[sorted.length - 1];
  if (todayStr >= last.date) {
    return { lat: last.lat, lng: last.lng, label: `At ${last.name}` };
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (todayStr >= a.date && todayStr <= b.date) {
      if (todayStr === a.date) return { lat: a.lat, lng: a.lng, label: `At ${a.name}` };
      if (todayStr === b.date) return { lat: b.lat, lng: b.lng, label: `At ${b.name}` };
      const totalDays = (new Date(b.date).getTime() - new Date(a.date).getTime()) / 86400000;
      const elapsedDays = (new Date(todayStr).getTime() - new Date(a.date).getTime()) / 86400000;
      const t = totalDays > 0 ? elapsedDays / totalDays : 0;
      return {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
        label: `Between ${a.name} and ${b.name}`,
      };
    }
  }
  return undefined;
}

export function getTourStatus(entries: TourEntry[], today: Date = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);
  const sorted = [...entries].sort((a, b) => a.from.localeCompare(b.from));
  const current = sorted.find((e) => e.from <= todayStr && todayStr <= e.to);
  const upcoming = sorted.filter((e) => e.from > todayStr);
  const past = sorted.filter((e) => e.to < todayStr && e !== current);
  return { current, upcoming, past };
}

export function entryTitle(entry: TourEntry): string {
  return entry.type === 'cruise' ? (entry.ship ?? 'At sea') : (entry.venue ?? 'Live show');
}

export function entryLocation(entry: TourEntry): string {
  return entry.type === 'cruise' ? (entry.region ?? 'Somewhere at sea') : (entry.city ?? '');
}

export function formatDateRange(from: string, to: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  if (from === to) return fmt(from);
  return `${fmt(from)} – ${fmt(to)}`;
}
