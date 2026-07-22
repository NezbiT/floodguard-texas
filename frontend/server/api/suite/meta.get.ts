import { suiteMeta } from '../../utils/suite'

export default defineEventHandler(() =>
  suiteMeta({
    layers: ['flood-risk', 'nws-alerts'],
    mapHubLayer: 'flood',
    defaultPort: 3013,
    dataPath: {
      now: ['curated demo zones', 'NWS active alerts (TX)'],
      next: ['FEMA NFHL MapServer', 'USGS NWIS gauges', 'NOAA ATLAS 14 precip'],
    },
  }),
)
