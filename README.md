# FloodGuard Texas

Texas flood-risk awareness for people and neighborhoods — ZIP lookup, interactive map, and demo risk scores.

Part of **TxBizFinder Intelligence** (`flood.txbizfinder.com`).

## Stack

- Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS v4
- MapLibre GL + OpenFreeMap (no API key)
- EN/ES i18n · demo mode by default

## Dev

```bash
cd frontend
npm install
npm run dev -- --port 3013 --host 127.0.0.1
```

Open http://127.0.0.1:3013

Query deep-links: `?zip=77002` or `?lat=29.76&lng=-95.37`

## APIs (MVP demo)

| Route | Purpose |
|-------|---------|
| `GET /api/risk/lookup?zip=` | Risk score + factors for a ZIP |
| `GET /api/risk/lookup?lat=&lng=` | Risk near a point |
| `GET /api/risk/zones` | Demo zone points for the map |

Later: FEMA NFHL / NWS flood alerts (live hooks, same endpoints).

## Env

| Variable | Default |
|----------|---------|
| `NUXT_PUBLIC_APP_URL` | `http://localhost:3013` |
| `NUXT_PUBLIC_DEMO_MODE` | `true` |
| `NUXT_PUBLIC_MAP_STYLE_URL` | OpenFreeMap liberty |
