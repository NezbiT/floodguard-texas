import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['maplibre-gl'],
    },
  },
  components: [{ path: '~/components', pathPrefix: false }],
  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    lazy: false,
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'fg_locale',
      alwaysRedirect: false,
      fallbackLocale: 'en',
    },
  },
  app: {
    head: {
      title: 'FloodGuard — USA flood risk (FEMA NFHL)',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'FloodGuard — check FEMA National Flood Hazard Layer (NFHL) by any US ZIP or map pin, plus live NWS flood alerts.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3013',
      demoMode: process.env.NUXT_PUBLIC_DEMO_MODE !== 'false',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'FloodGuard',
      mapStyleUrl:
        process.env.NUXT_PUBLIC_MAP_STYLE_URL ||
        'https://tiles.openfreemap.org/styles/liberty',
      // Continental US
      mapCenter: { lat: 39.8, lon: -98.5 },
      mapZoom: 4,
    },
  },
})
