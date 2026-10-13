<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'

const { t } = useLanguage()
</script>

<template>
  <section class="w-full max-w-[100vw] overflow-x-clip py-10 sm:py-14 md:py-space-xl">
    <div class="mx-auto max-w-[1400px] px-page">
      <div v-fade-up class="rounded-xl bg-surface-container-lowest p-4 shadow-md sm:p-space-lg md:p-space-xl">
        <div class="flex flex-col items-center gap-6 sm:gap-space-xl lg:flex-row">
          <div class="flex w-full min-w-0 flex-col gap-space-xs text-center lg:w-1/3 lg:text-start">
            <span class="font-latin text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{{
              t.testimonialsEyebrow
            }}</span>
            <h3 class="section-title text-on-surface">{{ t.testimonialsTitle }}</h3>
            <p class="mt-2 text-[14px] leading-6 text-on-surface-variant sm:text-[15px]">{{ t.testimonialsDesc }}</p>
            <div class="mt-4 flex items-center justify-center gap-1 text-amber-500 lg:justify-start">
              <span
                v-for="n in 5"
                :key="n"
                class="material-symbols-outlined text-[20px] sm:text-[22px]"
                style="font-variation-settings: 'FILL' 1"
              >star</span>
              <span class="ms-2 text-[16px] font-bold text-on-surface sm:text-[18px]">{{ t.ratingScore }}</span>
            </div>
          </div>

          <div class="grid w-full min-w-0 grid-cols-1 gap-space-md md:grid-cols-2 lg:w-2/3">
            <blockquote
              v-for="review in t.reviews"
              :key="review.name"
              v-fade-up
              class="flex h-full min-w-0 flex-col justify-between rounded-lg bg-surface-container-low p-4 sm:p-space-md"
            >
              <p class="text-[14px] italic leading-6 text-on-surface sm:text-[15px]">{{ review.text }}</p>
              <div class="mt-space-md flex items-center gap-space-sm border-t border-outline-variant/30 pt-space-sm">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed font-bold text-on-secondary-fixed"
                >
                  {{ review.initials }}
                </div>
                <div class="min-w-0">
                  <span class="block truncate text-[16px] font-semibold text-on-surface sm:text-[18px]">{{ review.name }}</span>
                  <span class="text-[10px] text-on-surface-variant">{{ review.role }}</span>
                </div>
              </div>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
