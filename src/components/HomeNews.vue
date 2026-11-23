<script setup lang="ts">
import { computed, ref } from 'vue'
import { homeEn, homeFa } from '../data/homeContent'
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()
const h = computed(() => (locale.value === 'fa' ? homeFa : homeEn))

const trackRef = ref<HTMLElement | null>(null)
let dragging = false
let startX = 0
let startScroll = 0

function slideBy(direction: -1 | 1) {
  const el = trackRef.value
  if (!el) return
  const step = Math.max(240, el.clientWidth * 0.65)
  el.scrollBy({ left: direction * step, behavior: 'smooth' })
}

function onPointerDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !trackRef.value) return
  dragging = true
  startX = e.clientX
  startScroll = trackRef.value.scrollLeft
  trackRef.value.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging || !trackRef.value) return
  trackRef.value.scrollLeft = startScroll - (e.clientX - startX)
}

function onPointerUp() {
  dragging = false
}
</script>

<template>
  <!-- شفاف: بک‌گراند همان شیدر هیرو ادامه دارد -->
  <section id="news" class="relative z-10 w-full">
    <!-- خط جداکننده با ستاره -->
    <div class="mx-auto flex max-w-[1400px] items-center gap-3 px-page">
      <span class="text-[#d4a373]/80" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.15 8.85L22 12l-8.85 1.15L12 22l-1.15-8.85L2 12l8.85-1.15L12 2z" />
        </svg>
      </span>
      <div class="h-px flex-1 bg-[#3d3426]/20" />
    </div>

    <!-- نوار سوییپری کوچک و جمع‌وجور در همه سایزها -->
    <div class="mx-auto max-w-[1400px] px-page py-5 sm:py-6">
      <div class="flex items-center gap-3 sm:gap-5">
        <!-- برچسب کوچک بخش -->
        <div class="flex shrink-0 items-center gap-2.5">
          <span class="h-1.5 w-1.5 rounded-full bg-[#d4a373]" />
          <p class="font-display text-[11px] font-bold tracking-[0.2em] text-[#3d3426] uppercase sm:text-[12px]">
            {{ h.news.eyebrow }}
          </p>
        </div>

        <!-- مسیر سوییپر افقی در همه سایزها -->
        <div ref="trackRef"
          class="no-scrollbar flex min-w-0 flex-1 cursor-grab select-none snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth py-1 active:cursor-grabbing"
          @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
          @pointerleave="onPointerUp">
          <article v-for="item in h.news.items" :key="item.title"
            class="flex w-[78%] shrink-0 snap-start flex-col justify-center rounded-xl border border-[#3d3426]/12 bg-white/60 px-3.5 py-2.5 shadow-[0_8px_20px_-18px_rgba(61,52,38,0.45)] backdrop-blur-xs transition-all duration-300 hover:border-[#d4a373]/55 hover:bg-white/80 sm:w-[46%] sm:px-4 sm:py-3 lg:w-[32%]">
            <div class="flex items-center gap-2 text-[10.5px] text-[#5c5346]">
              <time class="font-latin font-medium tracking-wide">
                {{ item.date }}
              </time>
              <span class="opacity-35">•</span>
              <span class="truncate rounded-full bg-[#ccd5ae]/80 px-2 py-0.5 text-[10px] font-semibold text-[#3d3426]">
                {{ item.tag }}
              </span>
            </div>

            <p class="mt-1 truncate text-[13.5px] font-bold text-[#3d3426] sm:text-[14.5px]">
              {{ item.title }}
            </p>
          </article>
        </div>

        <!-- دکمه‌های کوچک سوییپ در همه سایزها -->
        <div class="flex shrink-0 items-center gap-1.5">
          <button type="button" aria-label="خبر قبلی"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-[#3d3426]/15 bg-white/65 text-[#3d3426] transition-colors hover:border-[#d4a373] hover:bg-white"
            @click="slideBy(-1)">
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button type="button" aria-label="خبر بعدی"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-[#3d3426]/15 bg-white/65 text-[#3d3426] transition-colors hover:border-[#d4a373] hover:bg-white"
            @click="slideBy(1)">
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 rotate-180" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>