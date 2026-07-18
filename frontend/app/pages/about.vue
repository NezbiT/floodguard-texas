<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  title: () => `${t('app.name')} — ${t('nav.about')}`,
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6 p-4 py-8 lg:p-8">
    <h1 class="text-2xl font-semibold">{{ t('about.title') }}</h1>
    <p class="text-muted-foreground leading-relaxed">{{ t('about.body') }}</p>
    <p class="text-sm text-muted-foreground leading-relaxed">{{ t('about.sources') }}</p>
    <p class="text-sm text-muted-foreground leading-relaxed">{{ t('about.suite') }}</p>
  </div>
</template>
