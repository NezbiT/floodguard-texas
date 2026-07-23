import { fetchFloodAlerts } from '../../utils/nws'
import { apiEnvelope } from '../../utils/suite'

/**
 * GET /api/alerts/active?state=FL
 * GET /api/alerts/active?lat=25.79&lng=-80.13
 * Default area=TX for the home strip if no geo given.
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const floodOnly = q.all !== '1' && q.all !== 'true'
  const state = typeof q.state === 'string' && /^[A-Za-z]{2}$/.test(q.state) ? q.state : undefined
  const lat = q.lat != null ? Number(q.lat) : NaN
  const lng = q.lng != null ? Number(q.lng) : q.lon != null ? Number(q.lon) : NaN
  const point =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lon: lng } : undefined

  const result = await fetchFloodAlerts({ floodOnly, state, point })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=120, stale-while-revalidate=300')

  return apiEnvelope(
    {
      source: result.source,
      count: result.count,
      floodOnly,
      scope: result.scope,
      error: result.error || null,
      alerts: result.alerts.slice(0, 100),
      disclaimer:
        'Live alerts from the National Weather Service (api.weather.gov). Nationwide via state or point. Not a substitute for official warnings.',
    },
    { source: result.error ? 'nws-error' : 'nws', demo: false },
  )
})
