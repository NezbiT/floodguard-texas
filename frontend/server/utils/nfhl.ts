/**
 * FEMA National Flood Hazard Layer (NFHL) — public ArcGIS REST.
 * Service: https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer
 * Layer 28: Flood Hazard Zones
 *
 * Educational use only. Not a LOMA/LOMR or official flood determination for insurance.
 */

export type NfhlHit = {
  source: 'fema-nfhl'
  fldZone: string
  zoneSubtype: string | null
  sfha: boolean
  staticBfe: number | null
  depth: number | null
  fldArId: string | null
  /** Mapped FloodGuard level from FLD_ZONE */
  level: 'low' | 'moderate' | 'high' | 'extreme'
  /** 0–100 score derived from zone class */
  score: number
  label: string
  factors: string[]
  raw?: Record<string, unknown>
}

const NFHL_QUERY =
  'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query'

/** Map FEMA zone codes → score / level (illustrative mapping for UX, not actuarial). */
export function mapFldZone(fldZone: string, zoneSubtype: string | null, sfha: boolean): {
  level: NfhlHit['level']
  score: number
  label: string
} {
  const z = (fldZone || '').toUpperCase().trim()
  const sub = (zoneSubtype || '').toUpperCase()

  // Coastal high velocity
  if (/^V/.test(z) || z === 'VE') {
    return { level: 'extreme', score: 94, label: `FEMA Zone ${z || 'V'} (coastal high hazard)` }
  }
  // Special flood hazard areas (1% annual chance)
  if (['A', 'AE', 'AH', 'AO', 'AR', 'A99'].includes(z) || /^A\d/.test(z)) {
    return { level: 'high', score: 84, label: `FEMA Zone ${z} (Special Flood Hazard Area)` }
  }
  // 0.2% annual chance / shaded X
  if (z === 'X' && (sub.includes('0.2') || sub.includes('0.2 PCT') || sub.includes('SHADED'))) {
    return { level: 'moderate', score: 52, label: 'FEMA Zone X (0.2% annual chance / shaded)' }
  }
  if (z === 'X' || z === 'C' || z === 'B') {
    if (sfha) {
      return { level: 'high', score: 78, label: `FEMA Zone ${z} (SFHA flag)` }
    }
    return { level: 'low', score: 22, label: `FEMA Zone ${z} (minimal flood hazard)` }
  }
  if (z === 'D') {
    return { level: 'moderate', score: 48, label: 'FEMA Zone D (undetermined)' }
  }
  if (sfha) {
    return { level: 'high', score: 80, label: `FEMA Zone ${z || 'SFHA'}` }
  }
  if (!z) {
    return { level: 'moderate', score: 40, label: 'FEMA NFHL: no zone attributes at point' }
  }
  return { level: 'moderate', score: 45, label: `FEMA Zone ${z}` }
}

export async function queryNfhlAtPoint(
  lat: number,
  lon: number,
): Promise<{ ok: true; hit: NfhlHit } | { ok: false; error: string }> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { ok: false, error: 'invalid coordinates' }
  }
  // Geometry as lon,lat (WGS84)
  const geometry = `${lon},${lat}`
  try {
    const data = await $fetch<{
      features?: Array<{ attributes?: Record<string, any> }>
      error?: { message?: string }
    }>(NFHL_QUERY, {
      query: {
        geometry,
        geometryType: 'esriGeometryPoint',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: 'FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE,DEPTH,VELOCITY,FLD_AR_ID',
        returnGeometry: 'false',
        f: 'json',
      },
      timeout: 15_000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'FloodGuardTexas/1.2 (txbizfinder.com; educational NFHL lookup)',
      },
    })

    if (data.error?.message) {
      return { ok: false, error: data.error.message }
    }

    const attrs = data.features?.[0]?.attributes
    if (!attrs) {
      return { ok: false, error: 'No NFHL polygon at this point (unmapped or no effective data)' }
    }

    const fldZone = String(attrs.FLD_ZONE || '').trim()
    const zoneSubtype = attrs.ZONE_SUBTY != null && String(attrs.ZONE_SUBTY).trim()
      ? String(attrs.ZONE_SUBTY).trim()
      : null
    const sfhaRaw = String(attrs.SFHA_TF || '').toUpperCase()
    const sfha = sfhaRaw === 'T' || sfhaRaw === 'TRUE' || sfhaRaw === 'Y'
    const staticBfe =
      typeof attrs.STATIC_BFE === 'number' && attrs.STATIC_BFE > -9000 ? attrs.STATIC_BFE : null
    const depth = typeof attrs.DEPTH === 'number' && attrs.DEPTH > -9000 ? attrs.DEPTH : null
    const mapped = mapFldZone(fldZone, zoneSubtype, sfha)

    const factors = [
      mapped.label,
      sfha ? 'Special Flood Hazard Area (SFHA = true)' : 'Outside SFHA (or not flagged)',
      zoneSubtype ? `Subtype: ${zoneSubtype}` : null,
      staticBfe != null ? `Static BFE: ${staticBfe}` : null,
      depth != null ? `Depth: ${depth}` : null,
      'Source: FEMA NFHL MapServer layer 28 (effective data)',
    ].filter(Boolean) as string[]

    return {
      ok: true,
      hit: {
        source: 'fema-nfhl',
        fldZone: fldZone || '—',
        zoneSubtype,
        sfha,
        staticBfe,
        depth,
        fldArId: attrs.FLD_AR_ID != null ? String(attrs.FLD_AR_ID) : null,
        level: mapped.level,
        score: mapped.score,
        label: mapped.label,
        factors,
        raw: {
          FLD_ZONE: attrs.FLD_ZONE,
          ZONE_SUBTY: attrs.ZONE_SUBTY,
          SFHA_TF: attrs.SFHA_TF,
        },
      },
    }
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) }
  }
}

/** Geocode US ZIP via Zippopotam (free). TX preferred validation. */
export async function geocodeZip(zip: string): Promise<{
  ok: true
  zip: string
  lat: number
  lon: number
  place: string
} | { ok: false; error: string }> {
  const z = zip.replace(/\D/g, '').slice(0, 5)
  if (z.length !== 5) return { ok: false, error: 'invalid zip' }
  try {
    const data = await $fetch<{
      'post code'?: string
      places?: Array<{
        latitude?: string
        longitude?: string
        'place name'?: string
        state?: string
        'state abbreviation'?: string
      }>
    }>(`https://api.zippopotam.us/us/${z}`, { timeout: 8_000 })
    const place = data.places?.[0]
    if (!place?.latitude || !place?.longitude) {
      return { ok: false, error: 'zip not found' }
    }
    const state = place['state abbreviation'] || ''
    if (state && state !== 'TX') {
      return { ok: false, error: `ZIP is in ${state}, not Texas` }
    }
    return {
      ok: true,
      zip: z,
      lat: Number(place.latitude),
      lon: Number(place.longitude),
      place: [place['place name'], state].filter(Boolean).join(', '),
    }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'geocode failed' }
  }
}
