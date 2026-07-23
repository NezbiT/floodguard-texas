<script setup lang="ts">
/**
 * Flood map with ZIP heat layer — colors match flood risk index (low→extreme).
 * - heatmap: density weighted by score
 * - circles: per-ZIP glow colored by score
 * - markers: clickable dots for selection
 */
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { scoreHeatColor } from '~/lib/utils'

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
    /** Show heat layer (default true) */
    heat?: boolean
  }>(),
  {
    zones: () => [],
    height: '420px',
    zoom: 5.6,
    heat: true,
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

const SOURCE_ID = 'flood-zips'
const LAYER_HEAT = 'flood-heat'
const LAYER_GLOW = 'flood-glow'
const LAYER_CORE = 'flood-core'

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

function zonesToGeoJSON(zones: FloodZone[]) {
  return {
    type: 'FeatureCollection' as const,
    features: (zones || [])
      .filter((z) => Number.isFinite(z.lat) && Number.isFinite(z.lon))
      .map((z) => ({
        type: 'Feature' as const,
        properties: {
          id: z.id,
          zip: z.zip,
          name: z.name,
          level: z.level,
          score: Number(z.score) || 0,
          weight: Math.max(0.05, Math.min(1, (Number(z.score) || 0) / 100)),
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [z.lon, z.lat] as [number, number],
        },
      })),
  }
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
    const selected = props.selectedId === z.id
    const size = selected ? 16 : 11
    el.style.width = `${size}px`
    el.style.height = `${size}px`
    el.style.borderRadius = '9999px'
    el.style.border = selected ? '2.5px solid #fff' : '2px solid rgba(255,255,255,.9)'
    el.style.boxShadow = selected
      ? `0 0 0 3px ${scoreHeatColor(z.score)}88, 0 2px 8px rgba(0,0,0,.5)`
      : '0 1px 4px rgba(0,0,0,.45)'
    el.style.background = scoreHeatColor(z.score)
    el.style.cursor = 'pointer'
    el.title = `${z.name} (${z.zip}) — ${z.level} · ${z.score}`
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('select', z)
    })
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([z.lon, z.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 14, closeButton: true }).setHTML(
          `<div style="min-width:140px">
            <strong>${z.name}</strong><br/>
            ZIP ${z.zip}<br/>
            <span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:999px;background:${scoreHeatColor(z.score)};color:#fff;font-size:11px;font-weight:700">
              ${String(z.level).toUpperCase()} · ${z.score}
            </span>
          </div>`,
        ),
      )
      .addTo(map)
    markers.push(marker)
  }
}

function ensureHeatLayers() {
  if (!map || !map.isStyleLoaded()) return

  const data = zonesToGeoJSON(props.zones || [])

  if (map.getSource(SOURCE_ID)) {
    ;(map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(data)
  } else {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data,
    })
  }

  // Heatmap: weight = flood score (same index colors)
  if (!map.getLayer(LAYER_HEAT)) {
    map.addLayer({
      id: LAYER_HEAT,
      type: 'heatmap',
      source: SOURCE_ID,
      maxzoom: 12,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'score'],
          0,
          0.15,
          40,
          0.45,
          65,
          0.75,
          85,
          0.95,
          100,
          1,
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3,
          0.7,
          6,
          1.15,
          10,
          1.5,
        ],
        // Density ramp aligned with low → moderate → high → extreme
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(22, 163, 74, 0)',
          0.15,
          'rgba(22, 163, 74, 0.35)',
          0.35,
          'rgba(202, 138, 4, 0.55)',
          0.55,
          'rgba(234, 88, 12, 0.7)',
          0.75,
          'rgba(185, 28, 28, 0.85)',
          1,
          'rgba(127, 29, 29, 0.95)',
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3,
          28,
          5,
          42,
          8,
          55,
          11,
          70,
        ],
        'heatmap-opacity': props.heat ? 0.85 : 0,
      },
    })
  } else {
    map.setPaintProperty(LAYER_HEAT, 'heatmap-opacity', props.heat ? 0.85 : 0)
  }

  // Soft glow circles per ZIP — color by score (index)
  if (!map.getLayer(LAYER_GLOW)) {
    map.addLayer({
      id: LAYER_GLOW,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'score'],
          0,
          18,
          40,
          26,
          65,
          34,
          85,
          42,
          100,
          48,
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'score'],
          0,
          '#16a34a',
          40,
          '#ca8a04',
          65,
          '#ea580c',
          85,
          '#b91c1c',
          100,
          '#7f1d1d',
        ],
        'circle-opacity': 0.28,
        'circle-blur': 0.65,
      },
    })
  }

  // Solid core ring matching risk index
  if (!map.getLayer(LAYER_CORE)) {
    map.addLayer({
      id: LAYER_CORE,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': [
          'case',
          ['==', ['get', 'id'], props.selectedId || ''],
          10,
          7,
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'score'],
          0,
          '#16a34a',
          40,
          '#ca8a04',
          65,
          '#ea580c',
          85,
          '#b91c1c',
          100,
          '#7f1d1d',
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.92,
      },
    })

    map.on('click', LAYER_CORE, (e) => {
      const f = e.features?.[0]
      if (!f?.properties) return
      const id = String(f.properties.id)
      const zone = (props.zones || []).find((z) => z.id === id)
      if (zone) emit('select', zone)
    })
    map.on('mouseenter', LAYER_CORE, () => {
      if (map) map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', LAYER_CORE, () => {
      if (map) map.getCanvas().style.cursor = ''
    })
  } else {
    map.setPaintProperty(LAYER_CORE, 'circle-radius', [
      'case',
      ['==', ['get', 'id'], props.selectedId || ''],
      10,
      7,
    ])
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
  return { lat: 39.8, lon: -98.5 }
}

function styleSource(): string | maplibregl.StyleSpecification {
  const url = (config.public.mapStyleUrl as string) || ''
  return url || FALLBACK_STYLE
}

function onStyleReady() {
  mapReady.value = true
  mapError.value = null
  map?.resize()
  ensureHeatLayers()
  renderMarkers()
}

function initMap() {
  if (!import.meta.client || !mapEl.value || map) return
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
      zoom: props.zoom ?? (Number(config.public.mapZoom) || 4),
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

  map.on('load', onStyleReady)
  map.on('style.load', () => {
    // After style swap (fallback), re-add heat layers
    ensureHeatLayers()
    renderMarkers()
  })

  let usedFallback = false
  map.on('error', (ev) => {
    const msg = String((ev as any)?.error?.message || (ev as any)?.error || '')
    if (map && msg && !usedFallback) {
      usedFallback = true
      console.warn('[FloodMap] style error, using OSM fallback:', msg)
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
  () => [props.zones, props.selectedId, props.heat] as const,
  () => {
    if (!mapReady.value || !map) return
    ensureHeatLayers()
    renderMarkers()
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
    <!-- Heat legend (same colors as risk index) -->
    <div
      v-if="mapReady && heat"
      class="pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg border border-white/15 bg-slate-950/80 px-2.5 py-2 text-[10px] text-white/90 shadow-lg backdrop-blur"
    >
      <p class="mb-1.5 font-semibold uppercase tracking-wider text-white/70">Flood index heat</p>
      <div class="flex items-center gap-1.5">
        <span class="size-2.5 rounded-full" style="background: #16a34a" />
        <span>Low</span>
        <span class="size-2.5 rounded-full" style="background: #ca8a04" />
        <span>Mod</span>
        <span class="size-2.5 rounded-full" style="background: #ea580c" />
        <span>High</span>
        <span class="size-2.5 rounded-full" style="background: #b91c1c" />
        <span>Ext</span>
      </div>
      <div
        class="mt-1.5 h-1.5 w-full rounded-full"
        style="background: linear-gradient(90deg, #16a34a 0%, #ca8a04 40%, #ea580c 65%, #b91c1c 100%)"
      />
    </div>
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
