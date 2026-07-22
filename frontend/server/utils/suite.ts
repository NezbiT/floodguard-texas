/** Shared TxBizFinder Intelligence suite metadata envelope. */

export const PRODUCT_ID = 'floodguard-texas' as const
export const PRODUCT_NAME = 'FloodGuard Texas'
export const PRODUCT_DOMAIN = 'flood.txbizfinder.com'
export const API_VERSION = '1.1.0'

export type SuiteTier = 'free' | 'contractor' | 'pro' | 'enterprise'

export function suiteMeta(extra: Record<string, unknown> = {}) {
  return {
    suite: 'txbizfinder-intelligence',
    product: PRODUCT_ID,
    productName: PRODUCT_NAME,
    domain: PRODUCT_DOMAIN,
    apiVersion: API_VERSION,
    tiers: {
      free: 'Public map + ZIP demo risk + NWS alerts (TX)',
      contractor: 'Higher rate limits, saved ZIPs, CSV export',
      pro: 'FEMA NFHL parcels, historical claims proxy, API keys',
      enterprise: 'Bulk geocode, SLA, white-label, SSO',
    } satisfies Record<SuiteTier, string>,
    disclaimer:
      'Not a FEMA flood-zone determination. Not insurance advice. Educational / situational awareness only.',
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
