import { lookupByPoint, lookupByZip, syntheticForZip } from '../../utils/demo'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const zip = typeof q.zip === 'string' ? q.zip.trim() : ''
  const lat = q.lat != null ? Number(q.lat) : NaN
  const lng = q.lng != null ? Number(q.lng) : q.lon != null ? Number(q.lon) : NaN

  if (zip && /^\d{5}/.test(zip)) {
    const hit = lookupByZip(zip) || syntheticForZip(zip)
    return {
      source: 'demo',
      query: { zip: zip.slice(0, 5) },
      risk: hit,
      disclaimer:
        'Demo scores only. Not a FEMA flood-zone determination. Do not use for insurance or legal decisions.',
    }
  }

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const hit = lookupByPoint(lat, lng)
    return {
      source: 'demo',
      query: { lat, lng },
      risk: hit,
      disclaimer:
        'Nearest demo zone to the coordinates. Not a FEMA flood-zone determination.',
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Provide zip=##### or lat=&lng=',
  })
})
