<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'

const { t } = useLanguage()
</script>

<template>
  <section class="w-full max-w-[100vw] overflow-x-clip bg-surface-container-low py-8 sm:py-space-lg">
    <div
      class="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-3 gap-y-6 px-page text-center sm:gap-gutter md:grid-cols-4">
      <div v-for="item in t.trust" :key="item.title" v-fade-up class="flex min-w-0 flex-col items-center gap-1">
        <Icon name="ph:{{ item.icon }}" />
        <span class="text-[14px] font-bold leading-snug text-on-surface sm:text-[18px]">{{ item.title }}</span>
        <span class="text-[11px] leading-snug text-on-surface-variant sm:text-[13px]">{{ item.desc }}</span>
      </div>
    </div>
  </section>
</template>
