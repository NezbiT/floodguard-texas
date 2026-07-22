/**
 * Free National Weather Service API (no key).
 * https://www.weather.gov/documentation/services-web-api
 * Requires a descriptive User-Agent.
 */

export type NwsAlert = {
  id: string
  event: string
  severity: string
  urgency: string
  headline: string
  areaDesc: string
  onset: string | null
  ends: string | null
  description: string
}

const UA = 'FloodGuardTexas/1.1 (txbizfinder.com; flood-risk-awareness; contact@txbizfinder.com)'

const FLOOD_EVENTS = [
  'flood',
  'flash flood',
  'coastal flood',
  'lakeshore flood',
  'river flood',
  'hydrologic',
  'tropical',
  'hurricane',
  'storm surge',
  'excessive rain',
]

export async function fetchTxAlerts(opts: { floodOnly?: boolean } = {}): Promise<{
  source: 'nws'
  count: number
  alerts: NwsAlert[]
  error?: string
}> {
  try {
    const data = await $fetch<{
      features?: Array<{
        id?: string
        properties?: Record<string, any>
      }>
    }>('https://api.weather.gov/alerts/active', {
      query: { area: 'TX' },
      headers: {
        'User-Agent': UA,
        Accept: 'application/geo+json',
      },
      timeout: 12_000,
    })

    let alerts: NwsAlert[] = (data.features || []).map((f) => {
      const p = f.properties || {}
      return {
        id: String(f.id || p.id || `${p.event || 'alert'}-${p.onset || p.sent || Math.random()}`),
        event: String(p.event || 'Alert'),
        severity: String(p.severity || 'Unknown'),
        urgency: String(p.urgency || 'Unknown'),
        headline: String(p.headline || p.event || 'NWS alert'),
        areaDesc: String(p.areaDesc || ''),
        onset: p.onset ? String(p.onset) : null,
        ends: p.ends ? String(p.ends) : p.expires ? String(p.expires) : null,
        description: String(p.description || '').slice(0, 600),
      }
    })

    if (opts.floodOnly !== false) {
      alerts = alerts.filter((a) => {
        const blob = `${a.event} ${a.headline}`.toLowerCase()
        return FLOOD_EVENTS.some((k) => blob.includes(k))
      })
    }

    return { source: 'nws', count: alerts.length, alerts }
  } catch (e: any) {
    return {
      source: 'nws',
      count: 0,
      alerts: [],
      error: e?.message || String(e),
    }
  }
}

/** Boost demo flood score when active NWS flood-related alerts mention nearby area. */
export function alertBoostForZip(
  zip: string,
  cityHint: string | undefined,
  alerts: NwsAlert[],
): { boost: number; matched: string[] } {
  if (!alerts.length) return { boost: 0, matched: [] }
  const z = zip.slice(0, 5)
  const city = (cityHint || '').toLowerCase()
  const matched: string[] = []
  for (const a of alerts.slice(0, 40)) {
    const area = a.areaDesc.toLowerCase()
    if (area.includes(z) || (city && area.includes(city))) {
      matched.push(a.event)
    }
  }
  // Statewide severe flood traffic still slightly elevates awareness
  const statewide = alerts.length >= 5 ? 4 : alerts.length >= 1 ? 2 : 0
  const local = Math.min(18, matched.length * 6)
  return { boost: statewide + local, matched: matched.slice(0, 5) }
}
