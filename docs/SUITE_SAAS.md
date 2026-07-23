# FloodGuard Texas — Suite & SaaS notes

Part of **TxBizFinder Intelligence** (Texas situational awareness for contractors, brokers, and insurers).

## Product role

ZIP / map **flood risk awareness** for the **entire USA** via **FEMA NFHL** (national MapServer) + **NWS** alerts by point/state.

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

### ✅ Implemented (Phase 1)
1. **FEMA NFHL** MapServer layer 28 — live (implemented on `/api/risk/lookup` + `/api/risk/nfhl`)
2. **NWS** `api.weather.gov` — live (implemented)
3. **Zone Explanations** — FEMA NFHL glossary + insurance context (implemented)
4. **TWIA Links** — Texas FAIR Plan (alternative insurance)
5. **FEMA MSC Links** — Official Map Service Center references

### 🔄 Roadmap (Phase 2-3)
1. **USGS NWIS** stream gauges (nearby)
2. **NOAA CO-OPS** coastal water levels (TX coast)
3. **OpenFEMA** FIMA NFIP claims (aggregate by ZIP)
4. **NOAA ATLAS 14** precipitation design storms
5. **Rate limiting** + caching for federal APIs

## API

- `GET /api/health`
- `GET /api/suite/meta`
- `GET /api/risk/lookup?zip=77002` — NFHL + NWS (set `nfhl=0` to skip FEMA)
- `GET /api/risk/nfhl?lat=29.76&lng=-95.37` — direct NFHL
- `GET /api/risk/zones` — map pin demo centroids
- `GET /api/alerts/active`
