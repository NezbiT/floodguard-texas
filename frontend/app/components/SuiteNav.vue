<script setup lang="ts">
const hub = 'http://127.0.0.1:3015'
const products = [
  { id: 'map', label: 'Map Hub', href: hub },
  { id: 'flood', label: 'Flood', href: '/', current: true },
  { id: 'power', label: 'Power', href: 'http://127.0.0.1:3014' },
  { id: 'radar', label: 'Radar', href: 'http://127.0.0.1:3010' },
  { id: 'channel', label: 'Channel', href: 'http://127.0.0.1:3011' },
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <span class="mr-1 hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">Suite</span>
    <template v-for="p in products" :key="p.id">
      <span
        v-if="p.current"
        class="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
      >{{ p.label }}</span>
      <a
        v-else
        :href="p.href"
        :target="p.href.startsWith('http') ? '_blank' : undefined"
        rel="noopener noreferrer"
        class="rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >{{ p.label }}</a>
    </template>
  </div>
</template>
