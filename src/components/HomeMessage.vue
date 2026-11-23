<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
    gsap.from('[data-reveal="start"]', {
      y: 45,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: root.value,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    })

    gsap.from('[data-reveal="end"]', {
      y: 35,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.09,
      delay: 0.12,
      scrollTrigger: {
        trigger: root.value,
        start: 'top 80%',
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
  <section id="message-intro" ref="root" class="relative z-10 w-full px-page py-14 text-start md:py-20 lg:py-24">
    <div class="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
      <!-- کارت شاخص پیام -->
      <div class="lg:col-span-4">
        <div data-reveal="start"
          class="flex h-full flex-col justify-between rounded-3xl border border-[#d4a373]/25 bg-linear-to-b from-white/80 to-white/50 p-6 shadow-[0_18px_42px_-28px_rgba(61,52,38,0.38)] backdrop-blur-md sm:p-8">
          <div>
            <div
              class="inline-flex items-center gap-2.5 rounded-full border border-[#d4a373]/30 bg-[#fefae0]/80 px-3 py-1">
              <span class="h-1.5 w-1.5 rounded-full bg-[#d4a373]" />
              <span class="text-[10px] font-bold tracking-[0.2em] text-[#5c5346] uppercase">
                LUMINA NOTE
              </span>
            </div>

            <h2
              class="mt-5 font-display text-[clamp(2.35rem,4.5vw,3.65rem)] font-extrabold leading-none tracking-[0.12em] text-ink">
              {{ h.message.eyebrow }}
            </h2>
          </div>

          <p class="mt-8 border-s-2 border-[#d4a373] ps-4 text-[13px] leading-[1.9] text-muted sm:text-[13.5px]">
            {{ h.message.lead }}
          </p>
        </div>
      </div>

      <!-- کارت روایت و پیام اصلی -->
      <div class="lg:col-span-8">
        <div data-reveal="end"
          class="flex h-full flex-col justify-center rounded-3xl border border-ink/12 bg-white/65 p-6 shadow-[0_18px_45px_-30px_rgba(61,52,38,0.32)] backdrop-blur-md sm:p-9">
          <div class="flex items-center gap-3">
            <span class="h-0.5 w-10 rounded-full bg-[#d4a373]" />
            <span class="text-[11px] font-semibold tracking-wider text-muted">
              {{ locale === 'fa' ? 'دیدگاه کلینیک لومینا' : 'Lumina Philosophy' }}
            </span>
          </div>

          <h3
            class="mt-3 font-display text-[clamp(1.45rem,2.8vw,2.1rem)] font-bold leading-[1.45] tracking-tight text-ink">
            {{ h.message.title }}
          </h3>

          <div class="mt-6 space-y-3.5">
            <template v-for="(line, i) in h.message.body" :key="i">
              <div v-if="i === highlightIndex" data-reveal="end"
                class="flex items-start gap-3 rounded-2xl border border-[#d4a373]/35 bg-linear-to-r from-[#fefae0]/90 to-white/80 px-4 py-3.5 text-[14px] font-semibold leading-7 text-ink sm:px-5 sm:text-[15px]">
                <span class="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#d4a373]" />
                <span>{{ line }}</span>
              </div>
              <p v-else data-reveal="end" class="text-[14px] leading-[1.95] text-muted sm:text-[15px]">
                {{ line }}
              </p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>