/** Shared TxBizFinder Intelligence suite metadata envelope. */

export const PRODUCT_ID = 'floodguard-texas' as const
export const PRODUCT_NAME = 'FloodGuard Texas'
export const PRODUCT_DOMAIN = 'flood.txbizfinder.com'
export const API_VERSION = '1.2.0'

export type SuiteTier = 'free' | 'contractor' | 'pro' | 'enterprise'

export function suiteMeta(extra: Record<string, unknown> = {}) {
  return {
    suite: 'txbizfinder-intelligence',
    product: PRODUCT_ID,
    productName: PRODUCT_NAME,
    domain: PRODUCT_DOMAIN,
    apiVersion: API_VERSION,
    tiers: {
      free: 'Public map + FEMA NFHL point lookup + NWS alerts (TX)',
      contractor: 'Higher rate limits, saved ZIPs, CSV export',
      pro: 'Bulk NFHL, historical claims proxy, API keys',
      enterprise: 'Bulk geocode, SLA, white-label, SSO',
    } satisfies Record<SuiteTier, string>,
    disclaimer:
      'NFHL data is educational only. Not an official FEMA flood determination or insurance advice.',
    ...extra,
  }
}

export function apiEnvelope<T extends Record<string, unknown>>(
  body: T,
  opts: { source?: string; demo?: boolean } = {},
) {
  return {
    ...body,
    meta: {
      product: PRODUCT_ID,
      asOf: new Date().toISOString(),
      source: opts.source ?? (body as any).source ?? 'unknown',
      demo: opts.demo ?? true,
      suite: 'txbizfinder-intelligence',
    },
  }
}
