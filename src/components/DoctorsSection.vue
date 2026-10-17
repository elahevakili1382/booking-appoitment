<script setup lang="ts">
// import { computed } from 'vue'
import { motion } from 'motion-v'
import { usePreferredReducedMotion } from '@vueuse/core'
import { assets } from '../data/assets'
import { useLanguage } from '../i18n/useLanguage'

const { t } = useLanguage()
const reduce = usePreferredReducedMotion()
const rest = computed(() => t.value.doctorsList.slice(1))
</script>

<template>
  <section v-if="rest.length" class="w-full max-w-[100vw] overflow-x-clip bg-[#faedcd] py-14 sm:py-20">
    <div class="mx-auto max-w-[1400px] px-page">
      <div v-fade-up class="mb-10 max-w-2xl">
        <span class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{{
          t.doctorsEyebrow
        }}</span>
        <h2 class="mt-3 font-hero text-[clamp(1.6rem,3.5vw,2.4rem)] text-on-surface">
          {{ t.doctorsTitle }}
        </h2>
        <p class="mt-3 text-[15px] leading-7 text-on-surface-variant">{{ t.doctorsDesc }}</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.article v-for="(doc, i) in rest" :key="doc.name" v-fade-up
          class="flex overflow-hidden rounded-2xl bg-[#fefae0]" :while-hover="reduce ? undefined : { y: -3 }">
          <img :src="assets.doctors[i + 1]" :alt="doc.name" class="h-auto w-28 object-cover sm:w-36" loading="lazy" />
          <div class="flex flex-1 flex-col justify-center p-4">
            <h3 class="text-[16px] font-bold">{{ doc.name }}</h3>
            <p class="text-[12px] text-primary">{{ doc.specialty }}</p>
            <p class="mt-2 line-clamp-2 text-[12px] text-on-surface-variant">{{ doc.bio }}</p>
            <NuxtLink to="/book" class="mt-3 text-[12px] font-bold text-primary">{{ doc.cta }} →</NuxtLink>
          </div>
        </motion.article>
      </div>
    </div>
  </section>
</template>
