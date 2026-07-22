import { fetchTxAlerts } from '../../utils/nws'
import { apiEnvelope } from '../../utils/suite'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const floodOnly = q.all !== '1' && q.all !== 'true'
  const result = await fetchTxAlerts({ floodOnly })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=120, stale-while-revalidate=300')

  return apiEnvelope(
    {
      source: result.source,
      count: result.count,
      floodOnly,
      error: result.error || null,
      alerts: result.alerts.slice(0, 100),
      disclaimer:
        'Live alerts from the National Weather Service (api.weather.gov). Not a substitute for official warnings.',
    },
    { source: result.error ? 'nws-error' : 'nws', demo: false },
  )
})
