<script setup lang="ts">
/**
 * هیرو پگاسوس: شیدر ابری · بیضی با سوایپر واقعی · متن چرخشی SCROLL · فارسی
 */
import { ref } from 'vue'
import { motion } from 'motion-v'
import { useIntervalFn, usePreferredReducedMotion } from '@vueuse/core'
import { useLanguage } from '../i18n/useLanguage'

import clinic01 from '~/assets/hero/clinic-01.jpg'
import clinic02 from '~/assets/hero/clinic-02.jpg'
import clinic03 from '~/assets/hero/clinic-03.jpg'
import clinic04 from '~/assets/hero/clinic-04.jpg'
import clinic05 from '~/assets/hero/clinic-05.jpg'

const { locale } = useLanguage()
const reduce = usePreferredReducedMotion()

const slides = [
  { src: clinic01, alt: 'فضای پذیرش کلینیک لومینا' },
  { src: clinic02, alt: 'مراقبت پوست و فیشیال' },
  { src: clinic03, alt: 'اتاق درمان زیبایی' },
  { src: clinic04, alt: 'خدمات تزریقی زیبایی' },
  { src: clinic05, alt: 'راهرو کلینیک زیبایی' },
]

const active = ref(0)

/** حروف دور دایرهٔ اسکرول — بدون textPath (در Chromium با CSS transform خراب می‌شد) */
const scrollChars = 'LUMINA CLINIC · LUMINA CLINIC · '.split('')
const scrollCharAngle = 360 / scrollChars.length

const { pause, resume } = useIntervalFn(
  () => {
    active.value = (active.value + 1) % slides.length
  },
  6000,
  { immediate: true, immediateCallback: false },
)

function go(i: number) {
  active.value = ((i % slides.length) + slides.length) % slides.length
  pause()
  resume()
}
</script>

<template>
  <section class="hero-peg relative z-10 min-h-dvh w-full overflow-x-clip bg-transparent" aria-label="Hero">
    <!-- شیدر در HomePage مشترک با NEWS است -->

    <!-- ستاره‌ها -->
    <span class="pointer-events-none absolute inset-s-[18%] top-[22%] z-5 text-[#d4a373]/45" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.15 8.85L22 12l-8.85 1.15L12 22l-1.15-8.85L2 12l8.85-1.15L12 2z" />
      </svg>
    </span>
    <span class="pointer-events-none absolute inset-s-[18%] top-[26%] z-5 text-[#d4a373]/30" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.15 8.85L22 12l-8.85 1.15L12 22l-1.15-8.85L2 12l8.85-1.15L12 2z" />
      </svg>
    </span>
    <span class="pointer-events-none absolute bottom-[24%] inset-s-[18%] z-5 text-[#d4a373]/35" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.15 8.85L22 12l-8.85 1.15L12 22l-1.15-8.85L2 12l8.85-1.15L12 2z" />
      </svg>
    </span>
    <span class="pointer-events-none absolute end-[30%] top-[38%] z-5 text-[#d4a373]/28" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.15 8.85L22 12l-8.85 1.15L12 22l-1.15-8.85L2 12l8.85-1.15L12 2z" />
      </svg>
    </span>

    <div
      class="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1500px] flex-col items-center justify-center px-page pb-20 pt-[calc(5.5rem+env(safe-area-inset-top))] lg:block lg:pb-0 lg:pt-0">

      <!-- بیضی + سوایپر -->
      <div
        class="relative z-10 mx-auto w-[min(78vw,340px)] shrink-0 sm:w-[min(62vw,400px)] lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[min(38vw,460px)] lg:-translate-x-1/2 lg:-translate-y-[46%]">

        <!--  -->
        <div class="relative">
          <div aria-hidden="true"
            class="pointer-events-none absolute -inset-4 rounded-[50%] border border-ink/25 sm:-inset-5"></div>
          <div aria-hidden="true"
            class="ring-line pointer-events-none absolute -inset-3 rounded-[50%] border border-[#3d3426]/30 lg:-inset-5">
          </div>
          <div aria-hidden="true"
            class="ring-line ring-line--slow pointer-events-none absolute -inset-6 rounded-[50%] border border-[#d4a373]/25 lg:-inset-9">
          </div>
          <div
            class="relative aspect-[3/4] w-full overflow-hidden rounded-[50%] bg-[#e9edc9] shadow-[0_28px_70px_-30px_rgba(61,52,38,0.38)] ring-1 ring-[#d4a373]/20">
            <img v-for="(slide, i) in slides" :key="i" :src="slide.src" :alt="slide.alt" class="hero-slide"
              :class="{ 'is-active': i === active }" :fetchpriority="i === 0 ? 'high' : 'low'" decoding="async" />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3d3426]/20 via-transparent to-[#fefae0]/12" />
          </div>
        </div>


        <!-- نقاط -->
        <div class="mt-4 flex justify-center gap-2 lg:absolute lg:-bottom-10 lg:start-1/2 lg:mt-0 lg:-translate-x-1/2">
          <button v-for="(_, i) in slides" :key="i" type="button" class="h-1.5 rounded-full transition-all duration-300"
            :class="i === active ? 'w-6 bg-[#d4a373]' : 'w-1.5 bg-[#ccd5ae] hover:bg-[#d4a373]/60'"
            :aria-label="`slide ${i + 1}`" :aria-current="i === active ? 'true' : undefined" @click="go(i)" />
        </div>

        <!-- SCROLL با متن چرخان (حروف جدا + rotate — پایدارتر از SVG textPath) -->
        <a href="#news"
          class="scroll-btn absolute -bottom-1 end-2 z-20 flex h-24 w-24 items-center justify-center overflow-visible lg:bottom-8 lg:end-[-1.5rem]"
          aria-label="Scroll">
          <div class="scroll-btn__ring pointer-events-none absolute inset-0" aria-hidden="true">
            <span v-for="(ch, i) in scrollChars" :key="i" class="scroll-btn__char"
              :style="{ transform: `rotate(${i * scrollCharAngle}deg)` }">{{ ch }}</span>
          </div>

          <span
            class="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fefae0] text-[#d4a373] shadow-[0_8px_24px_-8px_rgba(61,52,38,0.4)] ring-1 ring-[#d4a373]/30">
            <span class="material-symbols-outlined scroll-btn__arrow text-[18px]">south</span>
          </span>
        </a>
      </div>

      <!-- چپ -->
      <div
        class="relative z-20 mt-8 w-full max-w-md self-start lg:absolute lg:start-[4%] lg:top-[28%] lg:mt-0 lg:w-[min(36%,28rem)] xl:start-[6%]">
        <motion.h1
          class="font-display text-[clamp(2.75rem,7vw,5.85rem)] font-medium leading-[0.92] tracking-[0.04em] text-[#3d3426]"
          :initial="reduce ? false : { opacity: 0, y: 24 }" :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }">
          LUMINA<br />CLINIC
        </motion.h1>

        <motion.p class="mt-5 max-w-[17rem] text-[13.5px] leading-7 text-[#5c5346] sm:text-[14.5px] sm:leading-8"
          :initial="reduce ? false : { opacity: 0 }" :animate="{ opacity: 1 }"
          :transition="{ delay: 0.2, duration: 0.7 }">
          <template v-if="locale === 'fa'">
            زیبایی واقعی‌تان را در تهران تجربه کنید.
            <br />
            لومینا خواسته‌تان را می‌شنود و همان را، طبیعی و ظریف، بیرون می‌کشد.
          </template>
          <template v-else>
            Experience your true beauty in Tehran.
            <br />
            Lumina listens — and draws out what is already yours.
          </template>
        </motion.p>

        <motion.aside
          class="mt-7 flex max-w-[17.5rem] items-start gap-3 rounded-2xl bg-[#faedcd]/80 p-3.5 shadow-[0_12px_32px_-20px_rgba(61,52,38,0.3)] backdrop-blur-sm lg:mt-10"
          :initial="reduce ? false : { opacity: 0, y: 14 }" :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4, duration: 0.7 }">
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ccd5ae] text-[#3d3426]">
            <span class="material-symbols-outlined text-[16px]">person</span>
          </span>
          <p class="text-[11.5px] leading-5 text-[#5c5346]">
            <template v-if="locale === 'fa'">
              اولین مراجعه کمی استرس داشتم، ولی تیم لومینا با آرامش همه‌چیز را توضیح دادند؛ نتیجه طبیعی و دقیقاً همان
              چیزی بود که می‌خواستم.
            </template>
            <template v-else>
              I was nervous at first, but the Lumina team explained everything calmly — the result looks natural and
              exactly what I hoped for.
            </template>
          </p>
        </motion.aside>
      </div>

      <!-- راست -->
      <div
        class="relative z-20 mt-6 hidden w-full max-w-[15rem] self-end lg:absolute lg:end-[8%] lg:top-[34%] lg:mt-0 lg:block xl:end-[10%]">
        <motion.div :initial="reduce ? false : { opacity: 0, x: 16 }" :animate="{ opacity: 1, x: 0 }"
          :transition="{ delay: 0.3, duration: 0.8 }">
          <svg class="mb-5 h-[4.5rem] w-[7.5rem] text-[#3d3426]/75" viewBox="0 0 140 80" fill="none" aria-hidden="true">
            <path d="M12 52c22-8 34-28 40-46 10 16 26 34 58 42-26 4-48 10-62 22-8-10-20-14-36-18z" stroke="currentColor"
              stroke-width="1.35" stroke-linejoin="round" />
            <path d="M52 22c8 10 12 20 14 32" stroke="currentColor" stroke-width="1.2" />
            <path d="M68 28c14 6 28 14 38 26" stroke="currentColor" stroke-width="1.1" opacity="0.7" />
            <circle cx="48" cy="18" r="2.4" fill="currentColor" />
            <path d="M48 20c-4 8-6 16-4 26" stroke="currentColor" stroke-width="1.1" />
          </svg>
          <p
            class="border-s border-[#3d3426]/30 ps-4 font-display text-[12.5px] leading-6 tracking-[0.04em] text-[#3d3426]/85">
            Evoke your true beauty! LUMINA CLINIC is a “life-changing experience”. We are the clinic for your smile.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.06);
  transition: opacity 2s ease;
  pointer-events: none;
  z-index: 1;
}

.hero-slide.is-active {
  opacity: 1;
  z-index: 2;
  pointer-events: auto;
  animation: photo-drift 10s ease-out both;
}

@keyframes photo-drift {
  from {
    transform: scale(1.09) translateX(2%);
  }

  to {
    transform: scale(1) translateX(0);
  }
}

.ring-line {
  animation: ring-breathe 7s ease-in-out infinite;
}

.ring-line--slow {
  animation-duration: 10s;
  animation-delay: -3s;
}

@keyframes ring-breathe {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.015);
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ring-line {
    animation: none;
  }
}

.scroll-btn__ring {
  animation: scroll-spin 14s linear infinite;
}

.scroll-btn__char {
  position: absolute;
  left: 50%;
  top: 0;
  height: 50%;
  transform-origin: 0 100%;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #3d3426;
  text-transform: uppercase;
  line-height: 1;
}

.scroll-btn__arrow {
  animation: scroll-bob 2.2s ease-in-out infinite;
}

@keyframes scroll-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes scroll-bob {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(3px);
  }
}

@media (prefers-reduced-motion: reduce) {

  .hero-slide,
  .hero-slide.is-active {
    transition: none;
    animation: none;
    transform: none;
  }

  .scroll-btn__ring,
  .scroll-btn__arrow {
    animation: none;
  }
}
</style>
