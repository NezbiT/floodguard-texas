# FloodGuard Texas — Suite & SaaS notes

Part of **TxBizFinder Intelligence** (Texas situational awareness for contractors, brokers, and insurers).

## Product role

ZIP / map **flood risk awareness** with live **NWS alerts** (free). Future: FEMA NFHL official zones for Pro/Enterprise tiers.

## Unified stack

- Nuxt 4 + Nitro APIs + MapLibre + i18n EN/ES
- Port default: **3013**
- MapHub layer id: `flood`

## SaaS tiers (target)

| Tier | Access |
|------|--------|
| Free | Demo zones + NWS alerts + ZIP lookup |
| Contractor | Saved places, higher rate limits, CSV |
| Pro | FEMA NFHL, history, API key |
| Enterprise | Bulk, SSO, white-label, SLA |

## Public data roadmap

1. **NWS** `api.weather.gov` — live (implemented)
2. **FEMA NFHL** ArcGIS MapServer — official SFHA
3. **USGS NWIS** stream gauges
4. **NOAA CO-OPS** coastal water levels
5. **OpenFEMA** FIMA NFIP claims (aggregate)

## API

- `GET /api/health`
- `GET /api/suite/meta`
- `GET /api/risk/lookup?zip=77002`
- `GET /api/risk/zones`
- `GET /api/alerts/active`
