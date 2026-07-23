/** Demo flood-risk dataset for Texas metro ZIPs (illustrative scores, not FEMA legal zones). */

export type DemoZone = {
  id: string
  zip: string
  name: string
  lat: number
  lon: number
  level: 'low' | 'moderate' | 'high' | 'extreme'
  score: number
  factors: string[]
  populationNote: string
}

export const DEMO_ZONES: DemoZone[] = [
  {
    id: 'hou-77002',
    zip: '77002',
    name: 'Downtown Houston',
    lat: 29.7604,
    lon: -95.3698,
    level: 'high',
    score: 78,
    factors: ['Bayou proximity', 'Urban runoff', 'Historical street flooding'],
    populationNote: 'Dense urban core — flash flood watches common in summer.',
  },
  {
    id: 'hou-77009',
    zip: '77009',
    name: 'Near Northside Houston',
    lat: 29.791,
    lon: -95.359,
    level: 'high',
    score: 74,
    factors: ['White Oak Bayou', 'Low-lying streets', 'Aging drainage'],
    populationNote: 'Residential neighborhoods with bayou overflow risk.',
  },
  {
    id: 'gal-77550',
    zip: '77550',
    name: 'Galveston',
    lat: 29.3013,
    lon: -94.7977,
    level: 'extreme',
    score: 92,
    factors: ['Storm surge', 'Gulf coast elevation', 'Hurricane track history'],
    populationNote: 'Coastal barrier — surge and tropical systems dominate risk.',
  },
  {
    id: 'aus-78701',
    zip: '78701',
    name: 'Downtown Austin',
    lat: 30.2711,
    lon: -97.7437,
    level: 'moderate',
    score: 48,
    factors: ['Lady Bird Lake', 'Flash rain events', 'Creek corridors'],
    populationNote: 'Flash flooding along creeks after heavy rain.',
  },
  {
    id: 'dal-75201',
    zip: '75201',
    name: 'Downtown Dallas',
    lat: 32.787,
    lon: -96.799,
    level: 'moderate',
    score: 42,
    factors: ['Trinity River corridor', 'Urban heat island storms'],
    populationNote: 'River floodplain awareness for lower elevations.',
  },
  {
    id: 'sa-78205',
    zip: '78205',
    name: 'Downtown San Antonio',
    lat: 29.4241,
    lon: -98.4936,
    level: 'moderate',
    score: 51,
    factors: ['San Antonio River', 'Flash flood alley'],
    populationNote: 'Central Texas flash-flood alley exposure.',
  },
  {
    id: 'cc-78401',
    zip: '78401',
    name: 'Corpus Christi',
    lat: 27.8006,
    lon: -97.3964,
    level: 'high',
    score: 81,
    factors: ['Bay / Gulf surge', 'Tropical systems', 'Low coastal elevation'],
    populationNote: 'Coastal metro with surge and tropical risk.',
  },
  {
    id: 'elp-79901',
    zip: '79901',
    name: 'El Paso',
    lat: 31.7619,
    lon: -106.485,
    level: 'low',
    score: 22,
    factors: ['Arroyo flash floods', 'Desert monsoons'],
    populationNote: 'Lower overall flood risk; arroyo flash events still matter.',
  },
  {
    id: 'fw-76102',
    zip: '76102',
    name: 'Fort Worth',
    lat: 32.7555,
    lon: -97.3308,
    level: 'moderate',
    score: 45,
    factors: ['Trinity River', 'Urban drainage'],
    populationNote: 'River and drainage-driven risk in low areas.',
  },
  {
    id: 'bea-77701',
    zip: '77701',
    name: 'Beaumont',
    lat: 30.0802,
    lon: -94.1266,
    level: 'extreme',
    score: 88,
    factors: ['Neches River', 'Hurricane Harvey history', 'Coastal plain'],
    populationNote: 'Southeast Texas river + tropical flood exposure.',
  },
  // ── National pins (map browse; NFHL still queried live on lookup) ──
  {
    id: 'mia-33139',
    zip: '33139',
    name: 'Miami Beach, FL',
    lat: 25.7907,
    lon: -80.13,
    level: 'extreme',
    score: 90,
    factors: ['Storm surge', 'Sea-level exposure', 'Tropical systems'],
    populationNote: 'Coastal South Florida — check FEMA zone at exact address.',
  },
  {
    id: 'nola-70112',
    zip: '70112',
    name: 'New Orleans, LA',
    lat: 29.9511,
    lon: -90.0715,
    level: 'extreme',
    score: 93,
    factors: ['Below sea level basins', 'Levee system', 'Hurricane history'],
    populationNote: 'NFHL + local levee context matter together.',
  },
  {
    id: 'nyc-10001',
    zip: '10001',
    name: 'Manhattan, NY',
    lat: 40.7506,
    lon: -73.9971,
    level: 'moderate',
    score: 55,
    factors: ['Coastal storm surge corridors', 'Urban drainage'],
    populationNote: 'Point NFHL varies block-by-block in NYC.',
  },
  {
    id: 'chi-60601',
    zip: '60601',
    name: 'Chicago Loop, IL',
    lat: 41.8827,
    lon: -87.6233,
    level: 'moderate',
    score: 42,
    factors: ['Lake Michigan', 'Urban flash flooding'],
    populationNote: 'Great Lakes / urban flood exposure.',
  },
  {
    id: 'lax-90291',
    zip: '90291',
    name: 'Venice, CA',
    lat: 33.985,
    lon: -118.4695,
    level: 'moderate',
    score: 48,
    factors: ['Coastal flooding', 'Urban runoff'],
    populationNote: 'California coastal and flash-flood pockets.',
  },
  {
    id: 'sea-98101',
    zip: '98101',
    name: 'Seattle, WA',
    lat: 47.6101,
    lon: -122.3344,
    level: 'moderate',
    score: 40,
    factors: ['Puget Sound', 'River valleys nearby'],
    populationNote: 'Pacific Northwest flood plains vary by valley.',
  },
]

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function lookupByZip(zip: string): DemoZone | null {
  const z = zip.trim().slice(0, 5)
  return DEMO_ZONES.find((d) => d.zip === z) || null
}

export function lookupByPoint(lat: number, lon: number): DemoZone & { distanceKm: number } {
  let best = DEMO_ZONES[0]
  let bestD = Infinity
  for (const d of DEMO_ZONES) {
    const dist = haversineKm(lat, lon, d.lat, d.lon)
    if (dist < bestD) {
      bestD = dist
      best = d
    }
  }
  return { ...best, distanceKm: Math.round(bestD * 10) / 10 }
}

export function syntheticForZip(zip: string): DemoZone {
  const digits = zip.replace(/\D/g, '').slice(0, 5).padEnd(5, '0')
  const n = Number(digits) || 77000
  const score = 25 + (n % 70)
  let level: DemoZone['level'] = 'low'
  if (score >= 85) level = 'extreme'
  else if (score >= 65) level = 'high'
  else if (score >= 40) level = 'moderate'
  return {
    id: `synth-${digits}`,
    zip: digits,
    name: `ZIP ${digits}`,
    lat: 29.5 + ((n % 400) / 100),
    lon: -95.5 - ((n % 300) / 100),
    level,
    score,
    factors: ['Demo estimate only', 'Prefer live FEMA NFHL lookup'],
    populationNote: 'Synthetic fallback if geocode/NFHL fail — not an official determination.',
  }
}
