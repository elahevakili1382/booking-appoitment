<script setup lang="ts">
import { assets } from '../data/assets'
import { useLanguage } from '../i18n/useLanguage'

const { t } = useLanguage()
</script>

<template>
  <footer id="about"
    class="safe-bottom mt-8 w-full max-w-[100vw] overflow-x-clip border-t border-outline-variant/30 bg-surface-container-low sm:mt-space-xl">
    <div class="mx-auto max-w-[1400px] px-page py-8 sm:py-12">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-gutter">
        <div class="flex min-w-0 flex-col gap-3">
          <div class="flex min-w-0 items-center gap-space-sm">
            <img :src="assets.logo" alt="" class="h-7 w-auto shrink-0 object-contain" loading="lazy" />
            <span class="font-latin truncate text-[20px] text-primary">Lumina Clinic</span>
          </div>
          <p class="max-w-prose text-[13px] leading-6 text-on-surface-variant">{{ t.footerAbout }}</p>
        </div>

        <div class="flex min-w-0 flex-col gap-2">
          <h3 class="text-[13px] font-semibold text-on-surface">{{ t.footerTehran }}</h3>
          <p class="text-[13px] leading-6 text-on-surface-variant">{{ t.footerTehranAddr }}</p>
          <a href="tel:+982122000000"
            class="inline-flex min-h-11 w-fit cursor-pointer items-center text-[15px] font-semibold text-primary transition-colors hover:text-primary-container"
            dir="ltr">
            +98 (21) 2200-LUMINA
          </a>
        </div>

        <div class="flex min-w-0 flex-col gap-2">
          <h3 class="text-[13px] font-semibold text-on-surface">{{ t.footerHours }}</h3>
          <ul class="space-y-1 text-[13px] leading-6 text-on-surface-variant">
            <li v-for="line in t.footerHoursList.slice(0, 2)" :key="line">{{ line }}</li>
          </ul>
        </div>
      </div>

      <div
        class="mt-8 flex flex-col items-center justify-between gap-3 border-t border-outline-variant/30 pt-5 md:flex-row">
        <p class="text-center text-[12px] text-on-surface-variant md:text-start">{{ t.footerCopy }}</p>
        <nav class="flex items-center gap-space-lg">
          <RouterLink to="/dashboard"
            class="inline-flex min-h-11 items-center text-[12px] text-on-surface-variant transition-colors hover:text-primary">
            {{ t.dashEntry }}
          </RouterLink>
          <a href="#about"
            class="inline-flex min-h-11 items-center text-[12px] text-on-surface-variant transition-colors hover:text-primary">{{
              t.privacy }}</a>
          <a href="#about"
            class="inline-flex min-h-11 items-center text-[12px] text-on-surface-variant transition-colors hover:text-primary">{{
              t.terms }}</a>
        </nav>
      </div>
    </div>
  </footer>
</template>
