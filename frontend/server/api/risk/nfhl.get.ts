/**
 * Direct FEMA NFHL point query (debug / API consumers).
 * GET /api/risk/nfhl?lat=29.76&lng=-95.37
 */
import { queryNfhlAtPoint } from '../../utils/nfhl'
import { apiEnvelope } from '../../utils/suite'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const lat = q.lat != null ? Number(q.lat) : NaN
  const lng = q.lng != null ? Number(q.lng) : q.lon != null ? Number(q.lon) : NaN

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createError({ statusCode: 400, statusMessage: 'Provide lat=&lng=' })
  }

  const result = await queryNfhlAtPoint(lat, lng)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=600')

  if (!result.ok) {
    return apiEnvelope(
      {
        source: 'fema-nfhl',
        query: { lat, lng },
        found: false,
        error: result.error,
        disclaimer:
          'No effective NFHL polygon returned. Point may be unmapped or service unavailable.',
      },
      { source: 'fema-nfhl-miss', demo: false },
    )
  }

  return apiEnvelope(
    {
      source: 'fema-nfhl',
      query: { lat, lng },
      found: true,
      nfhl: result.hit,
      disclaimer:
        'FEMA NFHL effective data. Educational only — not an official flood determination for insurance.',
    },
    { source: 'fema-nfhl', demo: false },
  )
})
