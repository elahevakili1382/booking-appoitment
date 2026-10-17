<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'

const { t } = useLanguage()
</script>

<template>
  <section class="w-full max-w-[100vw] overflow-x-clip bg-surface-container-high py-10 sm:py-14 md:py-space-xl">
    <div class="mx-auto max-w-[1400px] px-page">
      <div v-fade-up class="mx-auto mb-8 max-w-3xl text-center sm:mb-space-xl">
        <span class="font-latin text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{{
          t.stepsEyebrow
        }}</span>
        <h2 class="section-title mt-1 text-on-surface">{{ t.stepsTitle }}</h2>
        <p class="mt-2 text-[14px] text-on-surface-variant sm:text-[15px]">{{ t.stepsDesc }}</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-gutter md:grid-cols-3">
        <article v-for="step in t.steps" :key="step.title" v-fade-up
          class="relative flex h-full min-w-0 flex-col justify-between rounded-xl bg-surface-container-lowest p-4 shadow-sm sm:p-space-lg">
          <div>
            <div class="mb-space-md flex items-center justify-between">
              <span
                class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[18px] font-bold text-on-primary">
                {{ step.n }}
              </span>
              <Icon name="ph:{{ step.icon }}" />
            </div>
            <h3 class="mb-2 text-[17px] font-semibold text-on-surface sm:text-[18px]">{{ step.title }}</h3>
            <p class="text-[13px] leading-5 text-on-surface-variant">{{ step.desc }}</p>
          </div>
          <div class="mt-space-md flex items-center gap-2 pt-space-sm text-[10px] font-semibold text-primary">
            {{ step.tip }}
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
