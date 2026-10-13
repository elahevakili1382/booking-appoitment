<script setup lang="ts">
import { assets } from '../data/assets'
import { useLanguage } from '../i18n/useLanguage'

const { t } = useLanguage()

const certs = [
  ['FDA & CE', 'تجهیزات مجاز'],
  ['AAD Member', 'بورد تخصصی'],
  ['ISO 9001', 'مدیریت کیفیت'],
]
</script>

<template>
  <footer id="about" class="safe-bottom mt-8 w-full max-w-[100vw] overflow-x-clip bg-surface-container-low sm:mt-space-xl">
    <div class="mx-auto max-w-[1400px] px-page py-10 sm:py-space-xl">
      <div class="mb-8 grid grid-cols-1 gap-8 sm:mb-space-xl sm:grid-cols-2 lg:grid-cols-4 lg:gap-gutter">
        <div class="flex min-w-0 flex-col gap-space-sm">
          <div class="mb-space-xs flex min-w-0 items-center gap-space-sm">
            <img :src="assets.logo" alt="" class="h-8 w-auto shrink-0 object-contain" />
            <span class="font-latin truncate text-[20px] text-primary sm:text-[22px]">Lumina Clinic</span>
          </div>
          <p class="text-[13px] leading-5 text-on-surface-variant">{{ t.footerAbout }}</p>
          <div class="mt-space-xs">
            <span
              class="inline-flex items-center rounded-full bg-secondary-fixed px-space-sm py-space-xs text-[10px] font-bold text-on-secondary-fixed"
            >
              VIP Concierge Active
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-space-sm">
          <h3 class="text-[18px] font-semibold text-on-surface">{{ t.footerBranches }}</h3>
          <div class="flex flex-col gap-space-xs">
            <span class="text-[12px] font-semibold text-primary">{{ t.footerTehran }}</span>
            <p class="text-[13px] text-on-surface-variant">{{ t.footerTehranAddr }}</p>
          </div>
          <div class="mt-space-xs flex flex-col gap-space-xs">
            <span class="text-[12px] font-semibold text-primary">{{ t.footerBh }}</span>
            <p class="text-[13px] text-on-surface-variant" dir="ltr">
              435 N Bedford Dr, Suite 300, Beverly Hills, CA 90210
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-space-sm">
          <h3 class="text-[18px] font-semibold text-on-surface">{{ t.footerHours }}</h3>
          <ul class="space-y-space-xs text-[13px] text-on-surface-variant">
            <li v-for="line in t.footerHoursList" :key="line">{{ line }}</li>
          </ul>
          <div class="mt-space-xs pt-space-xs">
            <span class="block text-[10px] uppercase tracking-wider text-on-surface-variant">{{
              t.footerHotline
            }}</span>
            <a
              href="tel:+982122000000"
              class="mt-space-xs inline-flex min-h-11 cursor-pointer items-center text-[17px] font-semibold text-primary transition-colors hover:text-primary-container sm:text-[18px]"
              dir="ltr"
            >
              +98 (21) 2200-LUMINA
            </a>
          </div>
        </div>

        <div class="flex flex-col gap-space-sm">
          <h3 class="text-[18px] font-semibold text-on-surface">{{ t.footerCerts }}</h3>
          <p class="text-[13px] text-on-surface-variant">{{ t.footerCertsDesc }}</p>
          <div class="mt-space-xs flex flex-wrap items-center gap-2 sm:gap-space-sm">
            <div
              v-for="[top, bottom] in certs"
              :key="top"
              class="min-w-[5.5rem] flex-1 rounded-lg bg-surface-container px-2 py-2 text-center sm:px-space-md sm:py-space-sm"
            >
              <span class="block text-[10px] font-bold text-on-secondary-container">{{ top }}</span>
              <span class="block text-[10px] text-on-surface-variant">{{ bottom }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col items-center justify-between gap-space-md border-t border-outline-variant/30 pt-space-lg md:flex-row"
      >
        <p class="text-center text-[13px] text-on-surface-variant md:text-start">{{ t.footerCopy }}</p>
        <div class="flex items-center gap-space-lg">
          <RouterLink
            to="/dashboard"
            class="text-[10px] text-on-surface-variant transition-colors hover:text-primary"
          >
            {{ t.dashEntry }}
          </RouterLink>
          <a href="#about" class="text-[10px] text-on-surface-variant transition-colors hover:text-primary">{{
            t.privacy
          }}</a>
          <a href="#about" class="text-[10px] text-on-surface-variant transition-colors hover:text-primary">{{
            t.terms
          }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>
