/**
 * FEMA NFHL Zone Glossary — Explanations, insurance implications, and official links.
 * Used to enhance risk card with educational context about flood zone meanings.
 */

export type ZoneExplanation = {
  zone: string
  shortLabel: string
  description: string
  riskLevel: string
  annualChance: string | null
  insuranceRequired: boolean
  typicalInsuranceCost: string | null
  keyFactors: string[]
  links: Array<{ label: string; url: string }>
}

export const NFHL_GLOSSARY: Record<string, ZoneExplanation> = {
  VE: {
    zone: 'VE',
    shortLabel: 'Coastal High Hazard',
    description:
      'Coastal areas with velocity (wave action). 1% annual chance of storm surge, high-velocity waves, and erosion. Most extreme flood risk.',
    riskLevel: 'EXTREME',
    annualChance: '1% (once per 100 years)',
    insuranceRequired: true,
    typicalInsuranceCost: '$1,200–3,500/year',
    keyFactors: [
      'Waves + storm surge + erosion',
      'Velocity hazard (V = velocity)',
      'Non-evacuation zone for most',
      'NFIP mandatory',
      'BFE included (Base Flood Elevation)',
    ],
    links: [
      {
        label: 'FEMA: Coastal High Hazard Zones',
        url: 'https://www.fema.gov/glossary/coastal-high-hazard-area-chha',
      },
      {
        label: 'What is SFHA?',
        url: 'https://www.fema.gov/glossary/special-flood-hazard-area-sfha',
      },
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
    ],
  },
  V: {
    zone: 'V',
    shortLabel: 'Coastal High Hazard',
    description:
      'General velocity zone designation. Used in some older maps or pending more detailed classification. Treat as high hazard.',
    riskLevel: 'EXTREME',
    annualChance: '1% (once per 100 years)',
    insuranceRequired: true,
    typicalInsuranceCost: '$1,200–3,500/year',
    keyFactors: ['Coastal hazard (pending detail)', 'NFIP mandatory', 'Storm surge risk'],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
    ],
  },
  AE: {
    zone: 'AE',
    shortLabel: 'Special Flood Hazard (1%)',
    description:
      'Special Flood Hazard Area with an elevation. 1% annual chance of flooding, also called 100-year flood. Most common mapped zone. NFIP insurance required if federal mortgage.',
    riskLevel: 'HIGH',
    annualChance: '1% (once per 100 years)',
    insuranceRequired: true,
    typicalInsuranceCost: '$400–1,200/year',
    keyFactors: [
      '1% annual chance (100-year flood)',
      'Base Flood Elevation (BFE) specified',
      'SFHA = Special Flood Hazard Area',
      'Most require NFIP or proof of higher ground',
      'Can appeal with LOMA/LOMR',
    ],
    links: [
      {
        label: 'FEMA: What is 100-Year Flood?',
        url: 'https://www.fema.gov/ask-fema/what-100-year-flood',
      },
      {
        label: 'FEMA: LOMA/LOMR (Letter of Map Amendment)',
        url: 'https://www.fema.gov/glossary/letter-map-amendment-loma',
      },
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
      {
        label: 'NFIP Insurance Information',
        url: 'https://www.floodsmart.gov/',
      },
    ],
  },
  AH: {
    zone: 'AH',
    shortLabel: 'Shallow Hazard (1%)',
    description:
      'Special Flood Hazard Area with shallow water hazard (e.g., ponding, dam spillway). 1% annual chance, standing water typically < 3 feet.',
    riskLevel: 'HIGH',
    annualChance: '1% (once per 100 years)',
    insuranceRequired: true,
    typicalInsuranceCost: '$500–1,200/year',
    keyFactors: [
      'Shallow water standing hazard',
      '1% annual chance',
      'Often associated with drainage issues',
      'NFIP mandatory',
      'Elevation in feet above ground',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
      {
        label: 'NFIP Insurance',
        url: 'https://www.floodsmart.gov/',
      },
    ],
  },
  AO: {
    zone: 'AO',
    shortLabel: 'Shallow Hazard (1%)',
    description:
      'Special Flood Hazard Area with sheet flow hazard. 1% annual chance, shallow flowing water, typically < 3 feet.',
    riskLevel: 'HIGH',
    annualChance: '1% (once per 100 years)',
    insuranceRequired: true,
    typicalInsuranceCost: '$500–1,200/year',
    keyFactors: [
      'Sheet flow / surface water hazard',
      '1% annual chance',
      'Often in urban/suburban areas',
      'Can be as dangerous as deeper floods',
      'NFIP mandatory',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
      {
        label: 'NFIP Insurance',
        url: 'https://www.floodsmart.gov/',
      },
    ],
  },
  AR: {
    zone: 'AR',
    shortLabel: 'Undetermined – Riverine',
    description:
      'Special Flood Hazard Area (1% chance) in areas of local-option stormwater or riverine conditions with some uncertainty.',
    riskLevel: 'HIGH',
    annualChance: '1% (once per 100 years)',
    insuranceRequired: true,
    typicalInsuranceCost: '$400–1,200/year',
    keyFactors: [
      '1% annual chance, variable',
      'Riverine or stormwater-related',
      'NFIP mandatory',
      'May have reduced rating in some cases',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
      {
        label: 'NFIP Insurance',
        url: 'https://www.floodsmart.gov/',
      },
    ],
  },
  A: {
    zone: 'A',
    shortLabel: 'Special Flood Hazard (1%)',
    description:
      'Special Flood Hazard Area. 1% annual chance, but Base Flood Elevation (BFE) not specified. Older or generalized mapping.',
    riskLevel: 'HIGH',
    annualChance: '1% (once per 100 years)',
    insuranceRequired: true,
    typicalInsuranceCost: '$400–1,200/year',
    keyFactors: [
      '1% annual chance',
      'No BFE specified (older maps)',
      'NFIP mandatory',
      'Elevation depth may be estimated',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
      {
        label: 'NFIP Insurance',
        url: 'https://www.floodsmart.gov/',
      },
    ],
  },
  X_SHADED: {
    zone: 'X (0.2%)',
    shortLabel: '0.2% Annual Chance (Shaded)',
    description:
      'Moderate flood hazard with 0.2% annual chance of flooding (500-year flood). Outside the Special Flood Hazard Area but still at risk. Shaded X on FEMA maps.',
    riskLevel: 'MODERATE',
    annualChance: '0.2% (once per 500 years)',
    insuranceRequired: false,
    typicalInsuranceCost: '$150–400/year (optional)',
    keyFactors: [
      '0.2% annual chance',
      'Lower risk than 1% zones',
      'NFIP insurance optional but often wise',
      'May see repetitive flood claims',
      'Outside SFHA',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
      {
        label: 'NFIP Insurance (Optional)',
        url: 'https://www.floodsmart.gov/',
      },
    ],
  },
  X_UNSHADED: {
    zone: 'X (Unshaded)',
    shortLabel: 'Outside Special Flood Hazard',
    description:
      'Area with minimal flood risk. Outside Special Flood Hazard Area and 0.2% annual chance zone. No NFIP requirement if federal mortgage.',
    riskLevel: 'LOW',
    annualChance: '< 0.2% (rare)',
    insuranceRequired: false,
    typicalInsuranceCost: null,
    keyFactors: [
      'Minimal flood risk',
      'No SFHA designation',
      'NFIP not required by law',
      'However, climate/development can change risk',
      'Still wise to verify with local flood data',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
    ],
  },
  D: {
    zone: 'D',
    shortLabel: 'Undetermined',
    description:
      'Area where flood hazard is undetermined. Usually old maps or areas where analysis is incomplete. Should review current FEMA maps.',
    riskLevel: 'MODERATE',
    annualChance: 'Unknown',
    insuranceRequired: false,
    typicalInsuranceCost: '$200–600/year (recommended)',
    keyFactors: [
      'Hazard not yet determined',
      'Typically on older maps',
      'Should check latest FEMA mapping',
      'NFIP available but not mandated',
      'Flood risk may be higher than indicated',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
      {
        label: 'Check for newer Flood Maps',
        url: 'https://www.fema.gov/glossary/flood-map-modernization',
      },
    ],
  },
  C: {
    zone: 'C',
    shortLabel: 'Minimal Hazard',
    description:
      'Areas outside Special Flood Hazard Area. Minimal flood risk, though local stormwater can still cause issues.',
    riskLevel: 'LOW',
    annualChance: '< 0.2% (rare)',
    insuranceRequired: false,
    typicalInsuranceCost: null,
    keyFactors: [
      'Minimal flood risk',
      'Outside SFHA',
      'NFIP insurance not required',
      'But climate change / development changes risk',
      'Review local stormwater plans',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
    ],
  },
  B: {
    zone: 'B',
    shortLabel: 'Minimal Hazard',
    description:
      'Areas between the 0.2% and 1% annual chance floodplains (or outside both). Low to minimal flood risk.',
    riskLevel: 'LOW',
    annualChance: '< 0.2% (rare)',
    insuranceRequired: false,
    typicalInsuranceCost: null,
    keyFactors: [
      'Low flood risk',
      'Outside SFHA',
      'NFIP not mandated',
      'Some lenders may still recommend insurance',
    ],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
    ],
  },
}

/**
 * Get glossary entry for a FEMA zone code.
 * Returns best-match explanation with fallback to generic entry.
 */
export function getZoneExplanation(fldZone: string, zoneSubtype?: string | null): ZoneExplanation {
  const z = (fldZone || '').toUpperCase().trim()
  const sub = (zoneSubtype || '').toUpperCase()

  // Exact matches first
  if (NFHL_GLOSSARY[z]) return NFHL_GLOSSARY[z]

  // X zone — check if shaded (0.2% annual chance)
  if (z === 'X') {
    const isShaded = sub.includes('0.2') || sub.includes('SHADED') || sub.includes('500')
    return isShaded ? NFHL_GLOSSARY.X_SHADED : NFHL_GLOSSARY.X_UNSHADED
  }

  // A* zone — return generic A
  if (z.startsWith('A')) {
    return NFHL_GLOSSARY.A
  }

  // Fallback
  return {
    zone: z || '?',
    shortLabel: 'Unknown Zone',
    description: 'FEMA zone code not recognized. Check FEMA Map Service Center for details.',
    riskLevel: 'UNKNOWN',
    annualChance: null,
    insuranceRequired: false,
    typicalInsuranceCost: null,
    keyFactors: ['Check official FEMA maps'],
    links: [
      {
        label: 'FEMA Map Service Center',
        url: 'https://msc.fema.gov/portal/home',
      },
    ],
  }
}

/**
 * Texas-specific insurance links based on flood zone.
 */
export function getTexasInsuranceLinks(fldZone: string): Array<{ label: string; url: string }> {
  const z = (fldZone || '').toUpperCase().trim()
  const high = ['VE', 'V', 'AE', 'AH', 'AO', 'AR', 'A'].includes(z)

  if (high) {
    return [
      {
        label: 'NFIP Insurance (Required)',
        url: 'https://www.floodsmart.gov/',
      },
      {
        label: 'TWIA (Texas Alternative Insurance)',
        url: 'https://www.twia.org/',
      },
      {
        label: 'Texas Department of Insurance',
        url: 'https://www.tdi.texas.gov/',
      },
    ]
  }

  return [
    {
      label: 'NFIP Insurance (Optional)',
      url: 'https://www.floodsmart.gov/',
    },
    {
      label: 'TWIA Information',
      url: 'https://www.twia.org/',
    },
  ]
}
