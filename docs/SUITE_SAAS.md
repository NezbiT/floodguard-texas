# FloodGuard Texas — Suite & SaaS notes

Part of **TxBizFinder Intelligence** (Texas situational awareness for contractors, brokers, and insurers).

## Product role

ZIP / map **flood risk awareness** with **FEMA NFHL** point lookup (public MapServer) + live **NWS alerts**.

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

1. **FEMA NFHL** MapServer layer 28 — live (implemented on `/api/risk/lookup` + `/api/risk/nfhl`)
2. **NWS** `api.weather.gov` — live (implemented)
3. **USGS NWIS** stream gauges
4. **NOAA CO-OPS** coastal water levels
5. **OpenFEMA** FIMA NFIP claims (aggregate)

## API

- `GET /api/health`
- `GET /api/suite/meta`
- `GET /api/risk/lookup?zip=77002` — NFHL + NWS (set `nfhl=0` to skip FEMA)
- `GET /api/risk/nfhl?lat=29.76&lng=-95.37` — direct NFHL
- `GET /api/risk/zones` — map pin demo centroids
- `GET /api/alerts/active`
