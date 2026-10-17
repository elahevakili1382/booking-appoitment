<script setup lang="ts">
// import { computed } from 'vue'
import { homeEn, homeFa } from '../data/homeContent'
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()
const h = computed(() => (locale.value === 'fa' ? homeFa : homeEn))
</script>

<template>
  <section class="w-full max-w-[100vw] overflow-x-clip pb-10 sm:pb-14 md:pb-space-xl">
    <div class="mx-auto max-w-[1400px] px-page">
      <div v-fade-up
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#d4a373] via-[#ccd5ae] to-[#a9845a] p-5 text-[#fefae0] shadow-xl sm:p-space-xl">
        <div class="relative z-10 flex max-w-2xl flex-col gap-4 sm:gap-space-md">
          <span
            class="w-fit rounded-full bg-[#fefae0]/15 px-3 py-1 font-latin text-[11px] font-semibold uppercase tracking-[0.06em]">
            {{ h.cta.eyebrow }}
          </span>
          <h2 class="section-title font-bold text-[#fefae0]">{{ h.cta.title }}</h2>
          <p class="text-[15px] leading-7 text-[#fefae0]/90 sm:text-[18px]">{{ h.cta.desc }}</p>
          <div class="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:flex-wrap">
            <RouterLink to="/book"
              class="flex min-h-12 w-full items-center justify-center rounded-full bg-[#fefae0] px-6 py-3 text-[15px] font-semibold text-primary hover:bg-[#faedcd] sm:w-auto sm:px-space-xl">
              {{ h.cta.primary }}
            </RouterLink>
            <RouterLink to="/services"
              class="flex min-h-12 w-full items-center justify-center rounded-full border border-[#fefae0]/45 px-5 py-3 text-[15px] font-semibold text-[#fefae0] hover:bg-[#fefae0]/10 sm:w-auto">
              {{ h.cta.secondary }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
