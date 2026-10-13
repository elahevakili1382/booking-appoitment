<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { homeEn, homeFa } from '../data/homeContent'
import { useLanguage } from '../i18n/useLanguage'

gsap.registerPlugin(ScrollTrigger)


const { locale } = useLanguage()
const h = computed(() => (locale.value === 'fa' ? homeFa : homeEn))
const highlightIndex = computed(() => Math.max(0, h.value.message.body.length - 2))

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!root.value) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  ctx = gsap.context(() => {
    gsap.from('[data-reveal = "start"]', {
      y: 80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: root.value,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    })

    gsap.from('[data-reveal="end"]', {

      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.2,
      scrollTrigger: {
        trigger: root.value,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    })
  }, root.value)
})


onBeforeUnmount(() => {
  ctx?.revert()
})
</script>

<template>
  <section id="message-intro" ref="root" class="relative z-10 w-full px-page py-16 md:py-20 lg:py-28">

    <div class="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-x-20">
      <!-- راست (در فارسی): پیام + lead -->
      <div class="pt-1 lg:pt-2">
        <h2 data-reveal="start"
          class="font-display text-[clamp(2.75rem,6.5vw,4.75rem)] font-extrabold leading-none tracking-[0.2em] text-ink">
          {{ h.message.eyebrow }}
        </h2>

        <p data-reveal="start"
          class="mt-8 max-w-[15.5rem] border-s border-ink/35 ps-4 text-[12.5px] leading-[1.85] text-muted sm:mt-10 sm:text-[13px]">
          {{ h.message.lead }}
        </p>
      </div>

      <!-- چپ (در فارسی): عنوان + بدنه -->
      <div class="space-y-5 sm:space-y-6">
        <h3 data-reveal="end"
          class="font-display text-[clamp(1.65rem,3.2vw,2.35rem)] font-bold leading-[1.45] tracking-tight text-ink">
          {{ h.message.title }}
        </h3>

        <template v-for="(line, i) in h.message.body" :key="i">
          <p v-if="i === highlightIndex" data-reveal="end"
            class="inline-block rounded-sm border border-ink/20 bg-sand/60 px-4 py-2.5 text-[14px] leading-7 text-ink sm:text-[15px]">
            {{ line }}
          </p>
          <p v-else data-reveal="end" class="max-w-[36rem] text-[14px] leading-[2] text-muted sm:text-[15px]">
            {{ line }}
          </p>
        </template>
      </div>
    </div>
  </section>
</template>
