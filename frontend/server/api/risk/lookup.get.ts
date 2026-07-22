/**
 * ZIP / lat-lng risk lookup.
 * Base score: curated demo zones or synthetic ZIP.
 * Live layer: NWS flood-related alerts boost score (optional, default on).
 */
import { lookupByPoint, lookupByZip, syntheticForZip, type DemoZone } from '../../utils/demo'
import { alertBoostForZip, fetchTxAlerts } from '../../utils/nws'
import { apiEnvelope } from '../../utils/suite'

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function levelFromScore(score: number): DemoZone['level'] {
  if (score >= 85) return 'extreme'
  if (score >= 65) return 'high'
  if (score >= 40) return 'moderate'
  return 'low'
}

function enrich(base: DemoZone, boost: number, matched: string[], nwsCount: number, nwsError?: string) {
  const score = clamp(base.score + boost)
  return {
    ...base,
    score,
    level: levelFromScore(score),
    factors: [
      ...base.factors,
      ...(boost > 0 ? [`NWS active flood-related alerts (+${boost})`] : []),
    ],
    nws: {
      activeFloodRelated: nwsCount,
      matchedEvents: matched,
      error: nwsError || null,
    },
  }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const zip = typeof q.zip === 'string' ? q.zip.trim() : ''
  const lat = q.lat != null ? Number(q.lat) : NaN
  const lng = q.lng != null ? Number(q.lng) : q.lon != null ? Number(q.lon) : NaN
  const live = q.live !== '0' && q.live !== 'false'

  const nws = live
    ? await fetchTxAlerts({ floodOnly: true })
    : { source: 'nws' as const, count: 0, alerts: [] as any[], error: undefined as string | undefined }

  if (zip && /^\d{5}/.test(zip)) {
    const curated = lookupByZip(zip)
    const base = curated || syntheticForZip(zip)
    const { boost, matched } = alertBoostForZip(base.zip, base.name, nws.alerts)
    return apiEnvelope(
      {
        source: curated ? 'demo-zone+nws' : 'demo+nws',
        query: { zip: zip.slice(0, 5) },
        risk: enrich(base, boost, matched, nws.count, nws.error),
        disclaimer:
          'Hybrid demo base score + live NWS alert boost. Not a FEMA flood-zone determination. Do not use for insurance or legal decisions.',
      },
      { source: curated ? 'hybrid' : 'demo+nws', demo: true },
    )
  }

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const base = lookupByPoint(lat, lng)
    const { boost, matched } = alertBoostForZip(base.zip, base.name, nws.alerts)
    return apiEnvelope(
      {
        source: 'demo+nws',
        query: { lat, lng },
        risk: enrich(base, boost, matched, nws.count, nws.error),
        disclaimer: 'Nearest demo zone + live NWS context. Not a FEMA flood-zone determination.',
      },
      { source: 'hybrid', demo: true },
    )
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Provide zip=##### or lat=&lng=',
  })
})
