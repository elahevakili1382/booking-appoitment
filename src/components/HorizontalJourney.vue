<script setup lang="ts">
/**
 * Doctor + Promise — پگاسوس: pin + اسکرول افقی با GSAP
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePreferredReducedMotion, useMediaQuery } from '@vueuse/core'
import { assets } from '../data/assets'
import { homeEn, homeFa } from '../data/homeContent'
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()
const h = computed(() => (locale.value === 'fa' ? homeFa : homeEn))
const reduce = usePreferredReducedMotion()
const isDesktop = useMediaQuery('(min-width: 768px)')
const sectionRef = ref<HTMLElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)

let ctx: { revert: () => void } | null = null

async function setup() {
  ctx?.revert()
  ctx = null
  if (reduce.value || !isDesktop.value) return
  await nextTick()
  if (!sectionRef.value || !wrapRef.value) return

  const gsap = (await import('gsap')).default
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const wrap = wrapRef.value
  const section = sectionRef.value

  ctx = gsap.context(() => {
    const distance = () => Math.max(0, wrap.scrollWidth - section.clientWidth)
    gsap.to(wrap, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
  }, section)
}

onMounted(setup)
watch([isDesktop, reduce], setup)
onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <!-- موبایل / reduced: ستونی -->
  <section v-if="reduce || !isDesktop" id="doctors" class="w-full bg-pegasus-cream py-14 sm:py-20">
    <div class="mx-auto space-y-14 px-page">
      <article v-fade-up class="overflow-hidden rounded-2xl bg-pegasus-sand">
        <img :src="assets.doctors[0]" :alt="h.doctor.name" class="h-64 w-full object-cover" loading="lazy" />
        <div class="p-6">
          <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{{ h.doctor.eyebrow }}</p>
          <p class="mt-2 text-[13px] text-on-surface-variant">{{ h.doctor.kicker }}</p>
          <h2 class="mt-1 text-[24px] font-bold">{{ h.doctor.name }}</h2>
          <p class="font-latin text-[14px] text-on-surface-variant">{{ h.doctor.nameEn }}</p>
          <p class="mt-4 text-[15px] font-semibold">{{ h.doctor.highlight }}</p>
          <p class="mt-2 text-[14px] leading-7 text-on-surface-variant">{{ h.doctor.lead }}</p>
          <ul class="mt-4 space-y-2">
            <li v-for="p in h.doctor.points" :key="p" class="text-[14px] leading-7 text-on-surface-variant">· {{ p }}</li>
          </ul>
          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink to="/doctors" class="inline-flex h-11 items-center rounded-full bg-primary px-6 text-[13px] font-bold text-on-primary">
              {{ h.doctor.moreDoctor }}
            </NuxtLink>
            <NuxtLink to="/blog" class="inline-flex h-11 items-center rounded-full border border-outline-variant/40 px-6 text-[13px] font-bold text-primary">
              {{ h.doctor.moreColumn }}
            </NuxtLink>
          </div>
        </div>
      </article>

      <div v-fade-up>
        <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{{ h.promise.eyebrow }}</p>
        <h2 class="mt-2 font-hero text-[1.7rem]">{{ h.promise.title }}</h2>
        <div class="mt-8 grid gap-6 sm:grid-cols-2">
          <article v-for="p in h.promise.items" :key="p.title">
            <h3 class="text-[16px] font-bold">{{ p.title }}</h3>
            <p class="mt-2 text-[14px] leading-7 text-on-surface-variant">{{ p.desc }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>

  <!-- دسکتاپ: افقی پین‌شده -->
  <section v-else id="doctors" ref="sectionRef" class="relative w-full overflow-hidden" aria-label="Doctor Promise">
    <div class="h-dvh-screen">
      <div ref="wrapRef" class="flex h-full w-max will-change-transform" dir="ltr">
        <!-- Doctor panel -->
        <div class="flex h-full w-screen shrink-0 items-center bg-pegasus-sand px-page">
          <div class="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-12">
            <div class="relative min-h-[70vh] overflow-hidden rounded-3xl">
              <img :src="assets.doctors[0]" :alt="h.doctor.name" class="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div class="flex flex-col justify-center" :dir="locale === 'fa' ? 'rtl' : 'ltr'">
              <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{{ h.doctor.eyebrow }}</p>
              <p class="mt-3 text-[13px] text-on-surface-variant">{{ h.doctor.kicker }}</p>
              <h2 class="mt-1 font-hero text-[clamp(1.8rem,3.5vw,2.8rem)]">{{ h.doctor.name }}</h2>
              <p class="font-latin text-[15px] text-on-surface-variant">{{ h.doctor.nameEn }}</p>
              <p class="mt-5 text-[16px] font-semibold">{{ h.doctor.highlight }}</p>
              <p class="mt-2 max-w-md text-[14px] leading-7 text-on-surface-variant">{{ h.doctor.lead }}</p>
              <ul class="mt-5 max-w-md space-y-2">
                <li v-for="p in h.doctor.points" :key="p" class="text-[14px] leading-7 text-on-surface-variant">· {{ p }}</li>
              </ul>
              <div class="mt-8 flex flex-wrap gap-3">
                <NuxtLink to="/doctors" class="inline-flex h-12 items-center rounded-full bg-primary px-7 text-[14px] font-bold text-on-primary">
                  {{ h.doctor.moreDoctor }}
                </NuxtLink>
                <NuxtLink to="/blog" class="inline-flex h-12 items-center rounded-full border border-outline-variant/40 px-7 text-[14px] font-bold text-primary">
                  {{ h.doctor.moreColumn }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Promise panel -->
        <div class="flex h-full w-screen shrink-0 items-center bg-pegasus-cream px-page">
          <div class="mx-auto w-full max-w-[880px]" :dir="locale === 'fa' ? 'rtl' : 'ltr'">
            <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{{ h.promise.eyebrow }}</p>
            <h2 class="mt-3 font-hero text-[clamp(1.8rem,3.5vw,2.8rem)]">{{ h.promise.title }}</h2>
            <div class="mt-10 grid gap-8 sm:grid-cols-2">
              <article v-for="p in h.promise.items" :key="p.title" v-fade-up>
                <h3 class="text-[18px] font-bold">{{ p.title }}</h3>
                <p class="mt-2 text-[15px] leading-7 text-on-surface-variant">{{ p.desc }}</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
