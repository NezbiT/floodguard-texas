import { suiteMeta } from '../../utils/suite'

export default defineEventHandler(() =>
  suiteMeta({
    layers: ['flood-risk', 'fema-nfhl', 'nws-alerts'],
    mapHubLayer: 'flood',
    defaultPort: 3013,
    dataPath: {
      now: [
        'FEMA NFHL MapServer layer 28 (Flood Hazard Zones)',
        'NWS active alerts (TX)',
        'demo zones for map pins / context',
      ],
      next: ['USGS NWIS gauges', 'OpenFEMA NFIP claims', 'NOAA ATLAS 14 precip'],
    },
  }),
)
