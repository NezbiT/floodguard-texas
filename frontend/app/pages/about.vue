<script setup lang="ts">
const { t, locale } = useI18n()
useSeoMeta({
  title: () => `${t('app.name')} — ${t('nav.about')}`,
})

type Confidence = 'official' | 'agency_open_data' | 'best_effort_scrape' | 'modeled_demo'

type SourceRow = {
  name: string
  url?: string
  use: string
  status: string
  confidence: Confidence
  cadence: string
}

const sources = computed<SourceRow[]>(() => [
  {
    name: 'FEMA NFHL ArcGIS',
    url: 'https://hazards.fema.gov/femaportal/wps/portal/NFHLWMS',
    use: locale.value === 'es' ? 'Zonas inundables oficiales' : 'Official flood hazard zones',
    status: 'live',
    confidence: 'official',
    cadence: locale.value === 'es' ? 'según publicación' : 'as published',
  },
  {
    name: 'NWS api.weather.gov',
    url: 'https://www.weather.gov/documentation/services-web-api',
    use: locale.value === 'es' ? 'Alertas activas' : 'Active alerts',
    status: 'live',
    confidence: 'official',
    cadence: locale.value === 'es' ? 'tiempo real' : 'real-time',
  },
  {
    name: 'USGS NWIS',
    url: 'https://waterservices.usgs.gov/',
    use: locale.value === 'es' ? 'Caudales / gauges' : 'Stream gauges',
    status: 'pending',
    confidence: 'agency_open_data',
    cadence: locale.value === 'es' ? 'tiempo real' : 'real-time',
  },
  {
    name: 'OpenFEMA NFIP',
    url: 'https://www.fema.gov/about/openfema/data-sets',
    use: locale.value === 'es' ? 'Reclamaciones / desastres' : 'Claims / disasters',
    status: 'pending',
    confidence: 'official',
    cadence: locale.value === 'es' ? 'periódico' : 'periodic',
  },
  {
    name: 'Demo map pins',
    use: locale.value === 'es' ? 'Pines de ejemplo' : 'Sample metro pins',
    status: 'demo',
    confidence: 'modeled_demo',
    cadence: 'static',
  },
])

const chipClass: Record<Confidence, string> = {
  official: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
  agency_open_data: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/30',
  best_effort_scrape: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-amber-500/30',
  modeled_demo: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 ring-slate-500/30',
}

function confidenceLabel(c: Confidence) {
  const es = locale.value === 'es'
  switch (c) {
    case 'official':
      return es ? 'Oficial' : 'Official'
    case 'agency_open_data':
      return es ? 'Open data agencia' : 'Agency open data'
    case 'best_effort_scrape':
      return es ? 'Scrape best-effort' : 'Best-effort scrape'
    case 'modeled_demo':
      return es ? 'Modelado / demo' : 'Modeled / demo'
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 p-4 py-8 lg:p-8">
    <h1 class="text-2xl font-semibold">{{ t('about.title') }}</h1>
    <p class="leading-relaxed text-muted-foreground">{{ t('about.body') }}</p>
    <p class="text-sm leading-relaxed text-muted-foreground">{{ t('about.sources') }}</p>

    <section class="space-y-3">
      <h2 class="text-lg font-medium">{{ t('about.catalogTitle') }}</h2>
      <p class="text-xs text-muted-foreground">{{ t('about.catalogHint') }}</p>
      <ul class="space-y-2">
        <li
          v-for="s in sources"
          :key="s.name"
          class="rounded-lg border border-border bg-card/50 px-3 py-2.5"
        >
          <div class="flex flex-wrap items-center gap-2">
            <a
              v-if="s.url"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-primary hover:underline"
            >
              {{ s.name }}
            </a>
            <span v-else class="font-medium">{{ s.name }}</span>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset"
              :class="chipClass[s.confidence]"
            >
              {{ confidenceLabel(s.confidence) }}
            </span>
            <span class="text-[10px] uppercase tracking-wide text-muted-foreground">{{ s.status }}</span>
          </div>
          <div class="mt-1 text-xs text-muted-foreground">
            {{ s.use }} · {{ s.cadence }}
          </div>
        </li>
      </ul>
    </section>

    <p class="text-sm leading-relaxed text-muted-foreground">{{ t('about.suite') }}</p>
    <p class="text-sm text-muted-foreground">
      <NuxtLink to="/terms" class="text-primary hover:underline">{{ t('legal.termsTitle') }}</NuxtLink>
      ·
      <NuxtLink to="/privacy" class="text-primary hover:underline">{{ t('legal.privacyTitle') }}</NuxtLink>
    </p>
  </div>
</template>
