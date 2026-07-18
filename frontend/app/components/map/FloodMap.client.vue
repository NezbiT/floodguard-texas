<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { riskColor } from '~/lib/utils'

export type FloodZone = {
  id: string
  zip: string
  name: string
  lat: number
  lon: number
  level: string
  score: number
}

const props = withDefaults(
  defineProps<{
    zones?: FloodZone[]
    center?: { lat: number; lon: number } | null
    zoom?: number
    height?: string
    selectedId?: string | null
  }>(),
  {
    zones: () => [],
    height: '420px',
    zoom: 5.6,
  },
)

const emit = defineEmits<{
  select: [zone: FloodZone]
}>()

const config = useRuntimeConfig()
const mapEl = ref<HTMLElement | null>(null)
const mapError = ref<string | null>(null)
const mapReady = ref(false)

let map: maplibregl.Map | null = null
let ro: ResizeObserver | null = null
const markers: maplibregl.Marker[] = []

/** Free basemap fallback if remote style URL fails. */
const FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

function clearMarkers() {
  while (markers.length) markers.pop()?.remove()
}

function renderMarkers() {
  if (!map) return
  clearMarkers()
  for (const z of props.zones || []) {
    if (z.lat == null || z.lon == null) continue
    const el = document.createElement('button')
    el.type = 'button'
    el.className = 'fg-marker'
    const size = props.selectedId === z.id ? 18 : 14
    el.style.width = `${size}px`
    el.style.height = `${size}px`
    el.style.borderRadius = '9999px'
    el.style.border = '2px solid white'
    el.style.boxShadow = '0 1px 4px rgba(0,0,0,.45)'
    el.style.background = riskColor(z.level)
    el.style.cursor = 'pointer'
    el.title = `${z.name} (${z.zip}) — ${z.level}`
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('select', z)
    })
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([z.lon, z.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 12, closeButton: true }).setHTML(
          `<strong>${z.name}</strong><br/>ZIP ${z.zip}<br/>${z.level} · score ${z.score}`,
        ),
      )
      .addTo(map)
    markers.push(marker)
  }
}

function resolveCenter(): { lat: number; lon: number } {
  if (props.center && Number.isFinite(props.center.lat) && Number.isFinite(props.center.lon)) {
    return props.center
  }
  const c = config.public.mapCenter as { lat?: number; lon?: number } | undefined
  const lat = Number(c?.lat)
  const lon = Number(c?.lon)
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon }
  return { lat: 31.0, lon: -99.5 }
}

function styleSource(): string | maplibregl.StyleSpecification {
  const url = (config.public.mapStyleUrl as string) || ''
  return url || FALLBACK_STYLE
}

function initMap() {
  if (!import.meta.client || !mapEl.value || map) return
  // Wait until container has real size (common MapLibre blank-map cause)
  if (!mapEl.value.clientWidth || !mapEl.value.clientHeight) {
    requestAnimationFrame(initMap)
    return
  }

  const center = resolveCenter()
  try {
    map = new maplibregl.Map({
      container: mapEl.value,
      style: styleSource(),
      center: [center.lon, center.lat],
      zoom: props.zoom ?? (Number(config.public.mapZoom) || 5.6),
      attributionControl: { compact: true },
      cooperativeGestures: false,
    })
  } catch (e) {
    mapError.value = e instanceof Error ? e.message : 'Map failed to start'
    return
  }

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    }),
    'top-right',
  )
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 100 }), 'bottom-left')

  map.on('load', () => {
    mapReady.value = true
    mapError.value = null
    map?.resize()
    renderMarkers()
  })

  let usedFallback = false
  map.on('error', (ev) => {
    const msg = String((ev as any)?.error?.message || (ev as any)?.error || '')
    if (map && msg && !usedFallback) {
      usedFallback = true
      console.warn('[FloodMap] style error, using OSM fallback:', msg)
      map.once('style.load', () => {
        mapReady.value = true
        map?.resize()
        renderMarkers()
      })
      try {
        map.setStyle(FALLBACK_STYLE)
        mapError.value = null
      } catch {
        mapError.value = 'Map tiles unavailable'
      }
    }
  })

  ro = new ResizeObserver(() => {
    map?.resize()
  })
  ro.observe(mapEl.value)
}

onMounted(() => {
  nextTick(() => {
    requestAnimationFrame(initMap)
  })
})

watch(
  () => [props.zones, props.selectedId] as const,
  () => {
    if (mapReady.value) renderMarkers()
  },
  { deep: true },
)

watch(
  () => [props.center?.lat, props.center?.lon, props.zoom] as const,
  () => {
    if (!map || !props.center) return
    if (!Number.isFinite(props.center.lat) || !Number.isFinite(props.center.lon)) return
    map.flyTo({
      center: [props.center.lon, props.center.lat],
      zoom: props.zoom ?? map.getZoom(),
      essential: true,
    })
  },
)

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  clearMarkers()
  map?.remove()
  map = null
})
</script>

<template>
  <div class="fg-map-root relative w-full" :style="{ height: height || '420px', minHeight: '360px' }">
    <div
      ref="mapEl"
      class="fg-map-canvas absolute inset-0 h-full w-full rounded-xl border border-border bg-slate-900"
    />
    <div
      v-if="!mapReady && !mapError"
      class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-900/40 text-sm text-white/80"
    >
      Loading map…
    </div>
    <div
      v-if="mapError"
      class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-950/80 p-4 text-center text-sm text-red-200"
    >
      {{ mapError }}
    </div>
  </div>
</template>

<style scoped>
.fg-map-root :deep(.maplibregl-map) {
  width: 100%;
  height: 100%;
  font: inherit;
}
.fg-map-root :deep(.maplibregl-canvas) {
  outline: none;
}
.fg-map-root :deep(.maplibregl-ctrl-group) {
  border-radius: 10px;
  overflow: hidden;
}
.fg-map-root :deep(.maplibregl-popup-content) {
  border-radius: 10px;
  padding: 10px 12px;
  color: #0f172a;
}
</style>
