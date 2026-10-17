<script setup lang="ts">
// import { computed } from 'vue'
import { homeEn, homeFa } from '../data/homeContent'
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()
const h = computed(() => (locale.value === 'fa' ? homeFa : homeEn))
</script>

<template>
  <!-- شفاف: بک‌گراند همان شیدر هیرو ادامه دارد -->
  <section id="news" class="relative z-10 w-full">
    <!-- خط جداکننده با ستاره — مثل پگاسوس -->
    <div class="mx-auto flex max-w-[1400px] items-center gap-3 px-page">
      <span class="text-[#d4a373]/55" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.15 8.85L22 12l-8.85 1.15L12 22l-1.15-8.85L2 12l8.85-1.15L12 2z" />
        </svg>
      </span>
      <div class="h-px flex-1 bg-[#3d3426]/25" />
    </div>

    <div
      class="mx-auto flex max-w-[1400px] flex-col items-center justify-center gap-5 px-page py-8 sm:flex-row sm:items-center sm:gap-10 sm:py-10">
      <p class="shrink-0 font-display text-[13px] font-semibold tracking-[0.18em] text-[#3d3426] uppercase">
        {{ h.news.eyebrow }}
      </p>
      <ul class="flex min-w-0 flex-col gap-4 sm:flex-row sm:gap-14">
        <li v-for="item in h.news.items" :key="item.title"
          class="min-w-0 border-s border-[#3d3426]/20 ps-4 sm:border-s-0 sm:border-e sm:ps-0 sm:pe-8 last:sm:border-e-0">
          <p class="font-latin text-[12px] tracking-wide text-[#5c5346]">
            <span>{{ item.date }}</span>
            <span class="mx-2 opacity-40">|</span>
            <span class="rounded-full bg-[#ccd5ae]/70 px-2 py-0.5 text-[10px] font-semibold text-[#3d3426]">
              {{ item.tag }}
            </span>
          </p>
          <p class="mt-1.5 text-[16px] font-semibold leading-6 text-[#3d3426] sm:text-[17px]">{{ item.title }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
