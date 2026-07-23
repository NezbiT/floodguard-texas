/**
 * ZIP / lat-lng risk lookup.
 * Priority: FEMA NFHL (official effective zones) → demo base + NWS boost.
 */
import { lookupByPoint, lookupByZip, syntheticForZip, type DemoZone } from '../../utils/demo'
import { geocodeZip, queryNfhlAtPoint } from '../../utils/nfhl'
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

const DISCLAIMER_NFHL =
  'Flood zone from FEMA National Flood Hazard Layer (NFHL, effective data via public ArcGIS REST). ' +
  'For educational / situational awareness only — not an official flood determination, LOMA/LOMR, ' +
  'survey, or insurance rating. Always verify with a licensed professional and the official FIRM.'

const DISCLAIMER_DEMO =
  'Hybrid demo base score + live NWS alert boost (FEMA NFHL unavailable at this point). ' +
  'Not a FEMA flood-zone determination. Do not use for insurance or legal decisions.'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const zipRaw = typeof q.zip === 'string' ? q.zip.trim() : ''
  let lat = q.lat != null ? Number(q.lat) : NaN
  let lng = q.lng != null ? Number(q.lng) : q.lon != null ? Number(q.lon) : NaN
  const live = q.live !== '0' && q.live !== 'false'
  const useNfhl = q.nfhl !== '0' && q.nfhl !== 'false'

  let zip = zipRaw && /^\d{5}/.test(zipRaw) ? zipRaw.slice(0, 5) : ''
  let placeName: string | null = null
  let geoSource: string | null = null

  // Resolve coordinates for ZIP
  if (zip && (!Number.isFinite(lat) || !Number.isFinite(lng))) {
    const curated = lookupByZip(zip)
    if (curated) {
      lat = curated.lat
      lng = curated.lon
      placeName = curated.name
      geoSource = 'demo-centroid'
    } else {
      const geo = await geocodeZip(zip)
      if (geo.ok) {
        lat = geo.lat
        lng = geo.lon
        placeName = geo.place
        geoSource = 'zippopotam'
      } else {
        const synth = syntheticForZip(zip)
        lat = synth.lat
        lng = synth.lon
        placeName = synth.name
        geoSource = 'synthetic'
      }
    }
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide zip=##### or lat=&lng=',
    })
  }

  // Base demo context (name / zip / notes)
  let base: DemoZone & { distanceKm?: number }
  if (zip) {
    base = lookupByZip(zip) || {
      ...syntheticForZip(zip),
      name: placeName || `ZIP ${zip}`,
      lat,
      lon: lng,
    }
    base = { ...base, lat, lon: lng }
  } else {
    base = lookupByPoint(lat, lng)
    zip = base.zip
  }

  // Parallel: NWS + NFHL
  const [nws, nfhl] = await Promise.all([
    live
      ? fetchTxAlerts({ floodOnly: true })
      : Promise.resolve({
          source: 'nws' as const,
          count: 0,
          alerts: [] as any[],
          error: undefined as string | undefined,
        }),
    useNfhl
      ? queryNfhlAtPoint(lat, lng)
      : Promise.resolve({ ok: false as const, error: 'nfhl disabled' }),
  ])

  const { boost, matched } = alertBoostForZip(base.zip || zip, base.name, nws.alerts)

  // ── FEMA NFHL primary path ─────────────────────────────────
  if (nfhl.ok) {
    const score = clamp(nfhl.hit.score + Math.min(boost, 8)) // small NWS awareness bump
    const level = boost >= 12 ? (score >= 85 ? 'extreme' : levelFromScore(score)) : nfhl.hit.level
    const risk = {
      id: base.id,
      zip: zip || base.zip,
      name: placeName || base.name,
      lat,
      lon: lng,
      level,
      score,
      factors: [
        ...nfhl.hit.factors,
        ...(boost > 0 ? [`Active NWS flood-related alerts nearby (+${Math.min(boost, 8)} awareness)`] : []),
      ],
      populationNote: base.populationNote,
      distanceKm: 'distanceKm' in base ? base.distanceKm : undefined,
      fema: {
        fldZone: nfhl.hit.fldZone,
        zoneSubtype: nfhl.hit.zoneSubtype,
        sfha: nfhl.hit.sfha,
        staticBfe: nfhl.hit.staticBfe,
        depth: nfhl.hit.depth,
        fldArId: nfhl.hit.fldArId,
        label: nfhl.hit.label,
      },
      nws: {
        activeFloodRelated: nws.count,
        matchedEvents: matched,
        error: nws.error || null,
      },
      geoSource,
    }

    return apiEnvelope(
      {
        source: 'fema-nfhl',
        query: zip ? { zip, lat, lng } : { lat, lng },
        risk,
        disclaimer: DISCLAIMER_NFHL,
      },
      { source: 'fema-nfhl', demo: false },
    )
  }

  // ── Demo + NWS fallback ────────────────────────────────────
  const score = clamp(base.score + boost)
  const risk = {
    ...base,
    lat,
    lon: lng,
    zip: zip || base.zip,
    name: placeName || base.name,
    score,
    level: levelFromScore(score),
    factors: [
      ...base.factors,
      ...(boost > 0 ? [`NWS active flood-related alerts (+${boost})`] : []),
      `FEMA NFHL unavailable: ${nfhl.error}`,
    ],
    fema: null,
    nws: {
      activeFloodRelated: nws.count,
      matchedEvents: matched,
      error: nws.error || null,
    },
    geoSource,
    nfhlError: nfhl.error,
  }

  return apiEnvelope(
    {
      source: 'demo+nws',
      query: zip ? { zip, lat, lng } : { lat, lng },
      risk,
      disclaimer: DISCLAIMER_DEMO,
    },
    { source: 'demo+nws', demo: true },
  )
})
