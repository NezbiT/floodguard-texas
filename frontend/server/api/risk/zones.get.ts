import { DEMO_ZONES } from '../../utils/demo'

export default defineEventHandler(() => {
  return {
    source: 'demo',
    count: DEMO_ZONES.length,
    zones: DEMO_ZONES.map(({ id, zip, name, lat, lon, level, score }) => ({
      id,
      zip,
      name,
      lat,
      lon,
      level,
      score,
    })),
  }
})
