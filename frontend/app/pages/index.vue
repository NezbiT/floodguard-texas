<script setup lang="ts">
import { riskBgClass, riskColor } from '~/lib/utils'
import type { FloodZone } from '~/components/map/FloodMap.client.vue'
import { Search, MapPin, Waves } from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const zipInput = ref(typeof route.query.zip === 'string' ? route.query.zip : '')
const selectedId = ref<string | null>(null)
const scoreAnim = ref(0)

const QUICK_ZIPS = [
  { zip: '77002', label: 'Houston' },
  { zip: '77550', label: 'Galveston' },
  { zip: '78701', label: 'Austin' },
  { zip: '75201', label: 'Dallas' },
  { zip: '78205', label: 'San Antonio' },
  { zip: '77701', label: 'Beaumont' },
]

const { data: zonesData, pending: zonesPending } = await useFetch('/api/risk/zones', {
  server: false,
})

const { data: alertsData, pending: alertsPending } = await useFetch('/api/alerts/active', {
  server: false,
})

const lookupQuery = ref<{ zip?: string; lat?: number; lng?: number } | null>(null)

onMounted(() => {
  const z = route.query.zip
  const lat = route.query.lat
  const lng = route.query.lng ?? route.query.lon
  if (typeof z === 'string' && /^\d{5}/.test(z)) {
    zipInput.value = z.slice(0, 5)
    lookupQuery.value = { zip: z.slice(0, 5) }
  } else if (lat != null && lng != null && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    lookupQuery.value = { lat: Number(lat), lng: Number(lng) }
  }
})

const {
  data: lookup,
  pending: lookupPending,
  error: lookupError,
  refresh: refreshLookup,
} = await useFetch('/api/risk/lookup', {
  query: lookupQuery,
  immediate: false,
  watch: [lookupQuery],
  server: false,
})

watch(lookupQuery, (q) => {
  if (q) refreshLookup()
})

const zones = computed<FloodZone[]>(() => (zonesData.value?.zones as FloodZone[]) || [])
const risk = computed(() => lookup.value?.risk)
const alerts = computed(() => (alertsData.value?.alerts as Array<{ event: string; headline: string; severity: string }>) || [])
const alertCount = computed(() => alertsData.value?.count ?? alerts.value.length)

const mapCenter = computed(() => {
  const r = lookup.value?.risk
  if (r?.lat != null && r?.lon != null) return { lat: r.lat, lon: r.lon }
  return null
})

const mapZoom = computed(() => (lookup.value?.risk ? 10 : 5.5))

/** Animate score number when risk changes */
watch(
  () => risk.value?.score,
  (target) => {
    if (target == null) {
      scoreAnim.value = 0
      return
    }
    const from = scoreAnim.value
    const to = target
    const start = performance.now()
    const dur = 520
    function tick(now: number) {
      const p = Math.min(1, (now - start) / dur)
      const ease = 1 - (1 - p) ** 3
      scoreAnim.value = Math.round(from + (to - from) * ease)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  },
)

function runZipLookup() {
  const z = zipInput.value.replace(/\D/g, '').slice(0, 5)
  if (z.length < 5) return
  zipInput.value = z
  selectedId.value = null
  lookupQuery.value = { zip: z }
  router.replace({ query: { zip: z } })
}

function pickZip(zip: string) {
  zipInput.value = zip
  selectedId.value = null
  lookupQuery.value = { zip }
  router.replace({ query: { zip } })
}

function onSelectZone(z: FloodZone) {
  selectedId.value = z.id
  zipInput.value = z.zip
  lookupQuery.value = { zip: z.zip }
  router.replace({ query: { zip: z.zip } })
}

const scorePct = computed(() => Math.min(100, Math.max(0, scoreAnim.value)))
</script>

<template>
  <div class="fg-page flex flex-1 flex-col gap-5 p-4 lg:p-6">
    <!-- Hero -->
    <section class="fg-hero relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 sm:p-6">
      <div class="fg-hero__glow" aria-hidden="true" />
      <div class="relative z-[1] flex flex-wrap items-start gap-4">
        <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner">
          <Waves class="size-6" />
        </div>
        <div class="min-w-0 flex-1 space-y-1.5">
          <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">{{ t('home.title') }}</h1>
          <p class="max-w-2xl text-sm text-muted-foreground sm:text-base">{{ t('home.subtitle') }}</p>
        </div>
      </div>

      <form class="relative z-[1] mt-5 flex flex-wrap items-end gap-2" @submit.prevent="runZipLookup">
        <div class="min-w-[10rem] flex-1 sm:max-w-xs">
          <label class="mb-1.5 block text-xs font-medium text-muted-foreground" for="zip">
            {{ t('home.zipLabel') }}
          </label>
          <div class="relative">
            <MapPin class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="zip"
              v-model="zipInput"
              type="text"
              inputmode="numeric"
              maxlength="5"
              pattern="[0-9]{5}"
              :placeholder="t('home.zipPlaceholder')"
              class="fg-input h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none ring-ring transition focus:ring-2"
            />
          </div>
        </div>
        <Button type="submit" class="h-11 gap-2 rounded-xl px-5" :disabled="zipInput.replace(/\D/g, '').length < 5">
          <Search class="size-4" />
          {{ t('home.check') }}
        </Button>
      </form>

      <div class="relative z-[1] mt-3 flex flex-wrap gap-2">
        <button
          v-for="q in QUICK_ZIPS"
          :key="q.zip"
          type="button"
          class="fg-chip"
          :class="{ 'fg-chip--on': zipInput === q.zip && risk }"
          @click="pickZip(q.zip)"
        >
          {{ q.label }}
          <span class="opacity-60">{{ q.zip }}</span>
        </button>
      </div>

      <div
        v-if="!alertsPending"
        class="relative z-[1] mt-4 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs sm:text-sm"
      >
        <p class="font-semibold text-sky-800 dark:text-sky-300">
          {{ t('home.nwsTitle') }} · {{ alertCount }}
        </p>
        <ul v-if="alerts.length" class="mt-1.5 space-y-1 text-muted-foreground">
          <li v-for="(a, i) in alerts.slice(0, 3)" :key="i" class="line-clamp-2">
            <span class="font-medium text-foreground">{{ a.event }}</span>
            — {{ a.headline }}
          </li>
        </ul>
        <p v-else class="mt-1 text-muted-foreground">{{ t('home.nwsNone') }}</p>
      </div>
    </section>

    <div class="grid flex-1 gap-4 lg:grid-cols-[1fr_340px]">
      <div class="fg-map-shell relative w-full" style="min-height: 420px">
        <ClientOnly>
          <FloodMap
            :zones="zones"
            :center="mapCenter"
            :zoom="mapZoom"
            :selected-id="selectedId || risk?.id"
            height="min(62vh, 560px)"
            @select="onSelectZone"
          />
          <template #fallback>
            <div
              class="fg-skeleton flex items-center justify-center rounded-xl border text-sm text-muted-foreground"
              style="height: min(62vh, 560px); min-height: 360px"
            >
              {{ t('common.loading') }}
            </div>
          </template>
        </ClientOnly>
        <p v-if="zonesPending" class="mt-2 text-xs text-muted-foreground">{{ t('common.loading') }}</p>
      </div>

      <aside class="space-y-3 lg:sticky lg:top-[4.25rem] lg:self-start">
        <Transition name="fg-panel" mode="out-in">
          <div
            v-if="lookupPending && !risk"
            key="loading"
            class="fg-card rounded-2xl border p-5 text-sm text-muted-foreground"
          >
            <div class="fg-pulse mb-3 h-3 w-24 rounded bg-muted" />
            <div class="fg-pulse h-10 w-16 rounded bg-muted" />
            <p class="mt-3">{{ t('common.loading') }}</p>
          </div>
          <div
            v-else-if="lookupError"
            key="err"
            class="fg-card rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm"
          >
            {{ t('home.lookupError') }}
          </div>
          <div
            v-else-if="risk"
            :key="risk.id"
            class="fg-card fg-card--risk rounded-2xl border p-5"
            :class="riskBgClass(risk.level)"
          >
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-xs font-semibold uppercase tracking-wider opacity-80">{{ t('home.riskTitle') }}</p>
              <span
                v-if="risk.fema"
                class="rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              >
                {{ t('home.femaBadge') }}
              </span>
              <span
                v-else
                class="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300"
              >
                DEMO
              </span>
            </div>
            <p class="mt-1 text-lg font-bold">{{ risk.name }}</p>
            <p class="text-sm opacity-90">ZIP {{ risk.zip }}</p>

            <div
              v-if="risk.fema"
              class="mt-3 rounded-xl border border-black/10 bg-black/5 p-3 text-xs dark:border-white/10 dark:bg-white/5"
            >
              <p class="font-semibold">
                {{ t('home.femaZone') }}:
                <span class="tabular-nums">{{ risk.fema.fldZone }}</span>
              </p>
              <p class="mt-1 opacity-90">
                {{ t('home.femaSfha') }}:
                {{ risk.fema.sfha ? t('home.femaYes') : t('home.femaNo') }}
              </p>
              <p v-if="risk.fema.zoneSubtype" class="mt-1 opacity-80">{{ risk.fema.zoneSubtype }}</p>
              <p class="mt-1 opacity-80">{{ risk.fema.label }}</p>
            </div>
            <p v-else class="mt-2 text-xs opacity-80">{{ t('home.femaFallback') }}</p>

            <div class="mt-4 flex items-end gap-3">
              <span
                class="text-5xl font-bold tabular-nums tracking-tight"
                :style="{ color: riskColor(risk.level) }"
              >
                {{ scoreAnim }}
              </span>
              <span class="mb-1.5 rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide dark:bg-white/10">
                {{ risk.level }}
              </span>
            </div>

            <!-- Score meter -->
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                class="fg-meter-fill h-full rounded-full transition-all duration-500 ease-out"
                :style="{
                  width: `${scorePct}%`,
                  background: riskColor(risk.level),
                }"
              />
            </div>

            <p v-if="'distanceKm' in risk && risk.distanceKm != null" class="mt-2 text-xs opacity-80">
              {{ t('home.nearest', { km: risk.distanceKm }) }}
            </p>
            <p class="mt-3 text-sm leading-relaxed opacity-90">{{ risk.populationNote }}</p>
            <ul class="mt-3 space-y-1.5 text-sm">
              <li
                v-for="(f, i) in risk.factors"
                :key="f"
                class="fg-factor flex gap-2"
                :style="{ animationDelay: `${i * 60}ms` }"
              >
                <span class="mt-1.5 size-1.5 shrink-0 rounded-full" :style="{ background: riskColor(risk.level) }" />
                <span>{{ f }}</span>
              </li>
            </ul>
          </div>
          <div
            v-else
            key="hint"
            class="fg-card rounded-2xl border border-dashed p-5 text-sm text-muted-foreground"
          >
            {{ t('home.hint') }}
          </div>
        </Transition>

        <div class="fg-card rounded-2xl border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
          {{ lookup?.disclaimer || t('home.disclaimer') }}
        </div>

        <div class="fg-card rounded-2xl border bg-card p-4">
          <p class="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {{ t('home.legend') }}
          </p>
          <ul class="space-y-2 text-xs">
            <li v-for="lv in ['low', 'moderate', 'high', 'extreme']" :key="lv" class="flex items-center gap-2.5">
              <span class="size-2.5 rounded-full shadow-sm" :style="{ background: riskColor(lv) }" />
              {{ t(`levels.${lv}`) }}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>
