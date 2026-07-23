/**
 * Free National Weather Service API (no key).
 * https://www.weather.gov/documentation/services-web-api
 * Supports US states + point queries (nationwide).
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

const UA = 'FloodGuard/1.3 (txbizfinder.com; nationwide flood awareness)'

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

export type AlertQuery = {
  floodOnly?: boolean
  /** Two-letter state, e.g. TX, FL, CA */
  state?: string
  /** Prefer point for local relevance (lat, lon WGS84) */
  point?: { lat: number; lon: number }
}

/** @deprecated use fetchFloodAlerts — kept for call sites */
export async function fetchTxAlerts(opts: AlertQuery = {}) {
  return fetchFloodAlerts(opts)
}

export async function fetchFloodAlerts(opts: AlertQuery = {}): Promise<{
  source: 'nws'
  count: number
  alerts: NwsAlert[]
  scope: string
  error?: string
}> {
  const query: Record<string, string> = {}
  let scope = 'us-unscoped'

  if (opts.point && Number.isFinite(opts.point.lat) && Number.isFinite(opts.point.lon)) {
    // NWS: point=lat,lon
    query.point = `${opts.point.lat},${opts.point.lon}`
    scope = `point:${opts.point.lat.toFixed(3)},${opts.point.lon.toFixed(3)}`
  } else if (opts.state && /^[A-Za-z]{2}$/.test(opts.state)) {
    query.area = opts.state.toUpperCase()
    scope = `state:${opts.state.toUpperCase()}`
  } else {
    // Default: still TX for the alerts strip if no geo — UI can pass state/point
    query.area = 'TX'
    scope = 'state:TX'
  }

  try {
    const data = await $fetch<{
      features?: Array<{
        id?: string
        properties?: Record<string, any>
      }>
    }>('https://api.weather.gov/alerts/active', {
      query,
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

    return { source: 'nws', count: alerts.length, alerts, scope }
  } catch (e: any) {
    return {
      source: 'nws',
      count: 0,
      alerts: [],
      scope,
      error: e?.message || String(e),
    }
  }
}

/** Boost score when active NWS flood-related alerts mention nearby area. */
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
    if (area.includes(z) || (city && city.length > 2 && area.includes(city))) {
      matched.push(a.event)
    }
  }
  // Point-scoped alerts are already local — any hit is meaningful
  const base = alerts.length >= 3 ? 4 : alerts.length >= 1 ? 2 : 0
  const local = Math.min(18, matched.length * 6)
  // If query was by point and we got flood alerts, apply mild awareness boost
  const pointAware = !matched.length && alerts.length > 0 ? 3 : 0
  return { boost: base + local + pointAware, matched: matched.slice(0, 5) }
}
