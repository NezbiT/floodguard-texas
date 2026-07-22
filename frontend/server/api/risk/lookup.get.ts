import { lookupByPoint, lookupByZip, syntheticForZip } from '../../utils/demo'
import { alertBoostForZip, fetchTxAlerts } from '../../utils/nws'
import { apiEnvelope } from '../../utils/suite'

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function levelFromScore(score: number): 'low' | 'moderate' | 'high' | 'extreme' {
  if (score >= 85) return 'extreme'
  if (score >= 65) return 'high'
  if (score >= 40) return 'moderate'
  return 'low'
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const zip = typeof q.zip === 'string' ? q.zip.trim() : ''
  const lat = q.lat != null ? Number(q.lat) : NaN
  const lng = q.lng != null ? Number(q.lng) : q.lon != null ? Number(q.lon) : NaN
  const live = q.live !== '0' && q.live !== 'false'

  const nws = live ? await fetchTxAlerts({ floodOnly: true }) : { source: 'nws' as const, count: 0, alerts: [], error: undefined }

  if (zip && /^\d{5}/.test(zip)) {
    const base = lookupByZip(zip) || syntheticForZip(zip)
    const isSynth = !lookupByZip(zip)
    const { boost, matched } = alertBoostForZip(base.zip, base.name, nws.alerts)
    const score = clampScore(base.score + boost)
    const risk = {
      ...base,
      score,
      level: levelFromScore(score),
      factors: [
        ...base.factors,
        ...(boost > 0 ? [`NWS active flood-related alerts (+${boost})`] : []),
      ],
      nws: {
        activeFloodRelated: nws.count,
        matchedEvents: matched,
        error: nws.error || null,
      },
    }
    return apiEnvelope(
      {
        source: isSynth ? 'demo+nws' : 'demo-zone+nws',
        query: { zip: zip.slice(0, 5) },
        risk,
        disclaimer:
          'Hybrid demo base score + live NWS alert boost. Not a FEMA flood-zone determination. Do not use for insurance or legal decisions.',
      },
      { source: isSynth ? 'demo+nws' : 'hybrid', demo: true },
    )
  }

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const hit = lookupByPoint(lat, lng)
    const { boost, matched } = alertBoostForZip(hit.zip, hit.name, nws.alerts)
    const score = clampScore(hit.score + boost)
    return apiEnvelope(
      {
        source: 'demo+nws',
        query: { lat, lng },
        risk: {
          ...hit,
          score,
          level: levelFromScore(score),
          nws: { activeFloodRelated: nws.count, matchedEvents: matched, error: nws.error || null },
        },
        disclaimer:
          'Nearest demo zone + live NWS context. Not a FEMA flood-zone determination.',
      },
      { source: 'hybrid', demo: true },
    )
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Provide zip=##### or lat=&lng=',
  })
})
