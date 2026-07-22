import { suiteMeta, API_VERSION, PRODUCT_ID } from '../utils/suite'

export default defineEventHandler(() => ({
  status: 'ok',
  product: PRODUCT_ID,
  version: API_VERSION,
  ...suiteMeta({
    endpoints: [
      'GET /api/health',
      'GET /api/suite/meta',
      'GET /api/risk/lookup?zip=77002',
      'GET /api/risk/zones',
      'GET /api/alerts/active',
    ],
  }),
}))
