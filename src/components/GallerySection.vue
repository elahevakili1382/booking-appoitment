<script setup lang="ts">
import { computed } from 'vue'
import { assets } from '../data/assets'
import { homeEn, homeFa } from '../data/homeContent'
import { useLanguage } from '../i18n/useLanguage'

const { t, locale } = useLanguage()
const h = computed(() => (locale.value === 'fa' ? homeFa : homeEn))

const notes = computed(() =>
  locale.value === 'fa'
    ? 'قرمزی · تورم خفیف · خشکی موقت: چند روز'
    : 'Redness · mild swelling · temporary dryness: a few days',
)
</script>

<template>
  <section id="gallery" class="w-full bg-pegasus-mist py-14 sm:py-20">
    <div class="mx-auto max-w-[1400px] px-page">
      <div v-fade-up class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{{ h.cases.eyebrow }}</p>
          <h2 class="mt-2 font-hero text-[clamp(1.6rem,3.5vw,2.4rem)]">{{ h.cases.title }}</h2>
          <p class="mt-3 text-[15px] leading-7 text-on-surface-variant">{{ h.cases.lead }}</p>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-11 shrink-0 items-center rounded-full border border-outline-variant/40 px-5 text-[13px] font-bold text-primary"
        >
          {{ h.cases.instagram }}
        </a>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(item, i) in t.gallery"
          :key="item.title"
          v-fade-up
          class="overflow-hidden rounded-2xl bg-pegasus-cream"
        >
          <div class="relative flex h-48 overflow-hidden sm:h-56">
            <div class="relative h-full w-1/2">
              <img :src="assets.gallery[i].before" alt="" class="h-full w-full object-cover" loading="lazy" />
              <span class="absolute bottom-2 end-2 rounded bg-[#3d3426]/75 px-2 py-0.5 text-[11px] text-[#fefae0]">{{ t.before }}</span>
            </div>
            <div class="relative h-full w-1/2">
              <img :src="assets.gallery[i].after" alt="" class="h-full w-full object-cover" loading="lazy" />
              <span class="absolute bottom-2 start-2 rounded bg-primary px-2 py-0.5 text-[11px] text-on-primary">{{ item.afterLabel }}</span>
            </div>
          </div>
          <div class="space-y-3 p-5 text-[13px]">
            <div class="flex justify-between gap-2">
              <h4 class="text-[16px] font-semibold">{{ item.title }}</h4>
              <span class="font-latin text-[11px] font-bold text-primary">No.{{ String(i + 1).padStart(2, '0') }}</span>
            </div>
            <p><span class="font-semibold">{{ h.cases.name }}:</span> {{ item.title }}</p>
            <p class="leading-6 text-on-surface-variant"><span class="font-semibold text-on-surface">{{ h.cases.desc }}:</span> {{ item.desc }}</p>
            <p class="leading-6 text-on-surface-variant"><span class="font-semibold text-on-surface">{{ h.cases.risk }}:</span> {{ notes }}</p>
            <p class="font-bold text-primary">{{ h.cases.price }} {{ t.services[i]?.price ?? '—' }} {{ t.toman }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
