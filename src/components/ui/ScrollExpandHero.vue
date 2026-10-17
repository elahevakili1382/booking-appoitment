<script setup lang="ts">
/**
 * Vue port of scroll-expansion-hero (Next/framer-motion → Nuxt/motion-v).
 * Hijacks wheel until media is fully expanded, then unlocks page scroll.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { usePreferredReducedMotion } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    mediaType?: 'video' | 'image'
    mediaSrc: string
    posterSrc?: string
    bgImageSrc: string
    title?: string
    date?: string
    scrollToExpand?: string
    textBlend?: boolean
  }>(),
  {
    mediaType: 'image',
    textBlend: false,
  },
)

const reduce = usePreferredReducedMotion()
const scrollProgress = ref(0)
const showContent = ref(false)
const mediaFullyExpanded = ref(false)
const touchStartY = ref(0)
const isMobile = ref(false)

const firstWord = computed(() => (props.title ? props.title.split(/\s+/)[0] ?? '' : ''))
const restOfTitle = computed(() =>
  props.title ? props.title.split(/\s+/).slice(1).join(' ') : '',
)

watch(
  () => props.mediaType,
  () => {
    scrollProgress.value = 0
    showContent.value = false
    mediaFullyExpanded.value = false
  },
)

function applyProgress(next: number) {
  const p = Math.min(Math.max(next, 0), 1)
  scrollProgress.value = p
  if (p >= 1) {
    mediaFullyExpanded.value = true
    showContent.value = true
  } else if (p < 0.75) {
    showContent.value = false
  }
}

function onWheel(e: WheelEvent) {
  if (reduce.value) return
  if (mediaFullyExpanded.value && e.deltaY < 0 && window.scrollY <= 5) {
    mediaFullyExpanded.value = false
    e.preventDefault()
    return
  }
  if (!mediaFullyExpanded.value) {
    e.preventDefault()
    applyProgress(scrollProgress.value + e.deltaY * 0.0009)
  }
}

function onTouchStart(e: TouchEvent) {
  touchStartY.value = e.touches[0]?.clientY ?? 0
}

function onTouchMove(e: TouchEvent) {
  if (reduce.value || !touchStartY.value) return
  const touchY = e.touches[0]?.clientY ?? 0
  const deltaY = touchStartY.value - touchY

  if (mediaFullyExpanded.value && deltaY < -20 && window.scrollY <= 5) {
    mediaFullyExpanded.value = false
    e.preventDefault()
    return
  }
  if (!mediaFullyExpanded.value) {
    e.preventDefault()
    const factor = deltaY < 0 ? 0.008 : 0.005
    applyProgress(scrollProgress.value + deltaY * factor)
    touchStartY.value = touchY
  }
}

function onTouchEnd() {
  touchStartY.value = 0
}

function onScroll() {
  if (!mediaFullyExpanded.value && !reduce.value) window.scrollTo(0, 0)
}

function onResize() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  onResize()
  if (reduce.value) {
    scrollProgress.value = 1
    mediaFullyExpanded.value = true
    showContent.value = true
  }
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('scroll', onScroll)
  window.addEventListener('touchstart', onTouchStart, { passive: false })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('resize', onResize)
})

const mediaWidth = computed(() => 300 + scrollProgress.value * (isMobile.value ? 650 : 1250))
const mediaHeight = computed(() => 400 + scrollProgress.value * (isMobile.value ? 200 : 400))
const textTranslateX = computed(() => scrollProgress.value * (isMobile.value ? 180 : 150))
</script>

<template>
  <div class="overflow-x-hidden transition-colors duration-700 ease-in-out">
    <section class="relative flex min-h-[100dvh] flex-col items-center justify-start">
      <div class="relative flex min-h-[100dvh] w-full flex-col items-center">
        <motion.div class="absolute inset-0 z-0 h-full" :animate="{ opacity: 1 - scrollProgress }"
          :transition="{ duration: 0.1 }">
          <img :src="bgImageSrc" alt="" class="h-screen w-screen object-cover object-center" fetchpriority="high" />
          <div class="absolute inset-0 bg-[#2a181c]/25" />
        </motion.div>

        <div class="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center justify-start">
          <div class="relative flex h-[100dvh] w-full flex-col items-center justify-center">
            <div
              class="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(42,24,28,0.35)]"
              :style="{
                width: `${mediaWidth}px`,
                height: `${mediaHeight}px`,
                maxWidth: '95vw',
                maxHeight: '85vh',
              }">
              <div v-if="mediaType === 'video'" class="pointer-events-none relative h-full w-full">
                <video :src="mediaSrc" :poster="posterSrc" autoplay muted loop playsinline preload="auto"
                  class="h-full w-full rounded-xl object-cover" :controls="false" />
                <motion.div class="absolute inset-0 rounded-xl bg-[#2a181c]/35"
                  :animate="{ opacity: 0.55 - scrollProgress * 0.35 }" :transition="{ duration: 0.2 }" />
              </div>
              <div v-else class="relative h-full w-full">
                <NuxtImg :src="mediaSrc" :alt="title || ''" class="h-full w-full rounded-xl object-cover" format="webp"
                  loading="lazy">
                  <motion.div class="absolute inset-0 rounded-xl bg-[#2a181c]/45"
                    :animate="{ opacity: 0.65 - scrollProgress * 0.35 }" :transition="{ duration: 0.2 }" />
              </div>
            </div>

            <div class="relative z-10 mt-[min(42vh,280px)] flex flex-col items-center text-center"
              :style="{ pointerEvents: mediaFullyExpanded ? 'auto' : 'none' }">
              <p v-if="date"
                class="font-latin text-[13px] font-semibold tracking-[0.12em] text-[#f4dde1] uppercase sm:text-[15px]"
                :style="{ transform: `translateX(-${textTranslateX}vw)` }">
                {{ date }}
              </p>
              <p v-if="scrollToExpand" class="mt-2 text-[13px] font-medium text-[#f4dde1]/90 sm:text-[14px]"
                :style="{ transform: `translateX(${textTranslateX}vw)` }">
                {{ scrollToExpand }}
              </p>
            </div>

            <div class="relative z-10 flex w-full flex-col items-center justify-center gap-2 text-center sm:gap-3"
              :class="textBlend ? 'mix-blend-difference' : ''">
              <h1 class="font-hero text-[clamp(2rem,6vw,4.5rem)] text-[#fff0f2]"
                :style="{ transform: `translateX(-${textTranslateX * 0.35}vw)` }">
                {{ firstWord }}
              </h1>
              <h1 v-if="restOfTitle" class="font-hero text-[clamp(2rem,6vw,4.5rem)] text-[#fff0f2]"
                :style="{ transform: `translateX(${textTranslateX * 0.35}vw)` }">
                {{ restOfTitle }}
              </h1>
            </div>
          </div>

          <motion.section class="flex w-full flex-col px-page py-10 md:py-16" :initial="{ opacity: 0 }"
            :animate="{ opacity: showContent ? 1 : 0 }" :transition="{ duration: 0.7 }">
            <slot />
          </motion.section>
        </div>
      </div>
    </section>
  </div>
</template>
