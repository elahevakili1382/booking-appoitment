<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onBeforeUnmount, onMounted, ref } from 'vue'

gsap.registerPlugin(ScrollTrigger)

const reasons = [
  {
    no: '01',
    title: 'پزشک باتجربه، مشاوره‌ی بدون عجله',
    text: 'پزشک کلینیک از مشاوره تا درمان و مراقبت بعد از آن مسئولیت کار را بر عهده دارد و برای هر سؤال شما وقت می‌گذارد.',
    img: '/reason/reason-01.jpg',
  },
  {
    no: '02',
    title: 'همه‌ی پرستاران، متخصص زیبایی',
    text: 'تیم ما در حوزه‌ی پزشکی زیبایی تجربه‌ی کافی دارد و با کمال میل به ریزترین پرسش‌های شما پاسخ می‌دهد.',
    img: '/reason/reason-02.jpg',
  },
  {
    no: '03',
    title: 'تجهیزات نسل جدید زیبایی',
    text: 'دستگاه‌های روز دنیا برای درمان لک و جوانسازی پوست، متناسب با نوع پوست شما انتخاب می‌شوند.',
    img: '/reason/reason-03.jpg',
  },
]

const root = ref<HTMLElement | null>(null)
const active = ref(0)
let mm: gsap.MatchMedia | null = null
let st: ScrollTrigger | null = null

onMounted(() => {
  const el = root.value
  if (!el) return

  const slides = Array.from(el.querySelectorAll<HTMLElement>('[data-slide]'))
  const n = slides.length

  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // حالت اولیه: فقط اسلاید اول دیده بشه
    gsap.set(slides.slice(1), { opacity: 0, y: 40 })

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: `+=${n * 65}%`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          active.value = Math.min(n - 1, Math.floor(self.progress * n))
        },
      },
    })

    for (let i = 0; i < n - 1; i++) {
      const t = i + 1
      const currentSlide = slides[i]
      const nextSlide = slides[i + 1]

      if (currentSlide && nextSlide) {
        tl.to(currentSlide, { opacity: 0, y: -40, duration: 0.4 }, t - 0.2)
        tl.fromTo(
          nextSlide,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.4 },
          t - 0.2,
        )
      }
    }
    tl.to({}, { duration: 0.2 }, n - 0.2)

    st = tl.scrollTrigger ?? null
  }, el)
})

onBeforeUnmount(() => {
  mm?.revert()
})

// کلیک روی نقطه‌ها: اسکرول به وسط همون مرحله
function goTo(i: number) {
  if (!st) return
  const y = st.start + (st.end - st.start) * ((i + 0.5) / reasons.length)
  window.scrollTo({ top: y, behavior: 'smooth' })
}
</script>

<template>
  <section ref="root" class="relative min-h-dvh w-full overflow-hidden bg-[#fefae0] px-page py-8 lg:h-dvh lg:py-0">
    <div
      class="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[1200px] grid-rows-[auto_1fr] items-center gap-6 lg:h-full lg:grid-cols-2 lg:grid-rows-1 lg:gap-0 lg:pt-24">
      <!-- ستون اول (راست در فارسی): عنوان و معرفی -->
      <div class="text-center lg:pe-16 lg:text-start">
        <p class="font-display text-xs tracking-[0.4em] text-muted sm:text-sm">REASON</p>
        <div class="mx-auto mt-2 h-px w-12 bg-ink/40 lg:mx-0 lg:mt-3"></div>
        <h2
          class="mt-3 font-display text-[clamp(1.4rem,5vw,2.5rem)] font-bold leading-[1.5] text-ink lg:mt-8 lg:leading-[1.6]">
          دلیل انتخاب کلینیک لومینا
        </h2>
        <p class="mt-3 hidden border-s border-ink/35 ps-4 text-[14px] leading-8 text-muted sm:block lg:mt-8">
          پزشک و تیمی باتجربه در کنار هم هستند تا نگرانی‌های پوستی شما را با آرامش حل کنند.
        </p>
      </div>

      <!-- ستون دوم: اسلایدها روی هم در همه سایزها -->
      <div class="relative flex items-center lg:block lg:border-s lg:border-ink/30 lg:ps-16">
        <div class="grid w-full">
          <article v-for="r in reasons" :key="r.no" data-slide class="relative col-start-1 row-start-1">
            <!-- عدد بزرگ کم‌رنگ پشت متن -->
            <span aria-hidden="true"
              class="pointer-events-none absolute -bottom-3 end-1 -z-0 font-display text-[6.5rem] font-bold leading-none text-ink/[0.06] sm:text-[9rem] lg:-bottom-6 lg:end-0 lg:text-[11rem]">
              {{ r.no }}
            </span>

            <div class="relative z-10 mx-auto w-full max-w-[20rem] sm:max-w-[24rem] lg:max-w-[26rem]">
              <NuxtImg :src="r.img" :alt="r.title"
                class="aspect-[16/10] w-full rounded-t-full object-cover sm:aspect-[5/4]" loading="lazy"
                format="webp" />

              <h3
                class="mt-4 text-center font-display text-base font-bold leading-7 text-ink sm:mt-6 sm:text-lg sm:leading-8">
                {{ r.title }}
              </h3>
              <p
                class="mt-2 text-center text-xs leading-6 text-muted sm:mt-4 sm:text-start sm:text-[13.5px] sm:leading-8">
                {{ r.text }}
              </p>
              <div class="mt-4 h-px w-full bg-ink/35 sm:mt-5"></div>
            </div>
          </article>
        </div>

        <!-- نقطه‌های پیشرفت: در موبایل پایین، در دسکتاپ کنار ستون -->
        <div
          class="ms-3 flex flex-col gap-2.5 lg:absolute lg:end-[-2.5rem] lg:top-1/2 lg:ms-0 lg:-translate-y-1/2 lg:gap-3">
          <button v-for="(r, i) in reasons" :key="r.no" type="button"
            class="h-2.5 w-2.5 rounded-full transition-colors duration-300"
            :class="i === active ? 'bg-[#d4a373]' : 'bg-ink/20 hover:bg-ink/40'" :aria-label="`مرحله ${i + 1}`"
            :aria-current="i === active ? 'true' : undefined" @click="goTo(i)" />
        </div>
      </div>
    </div>
  </section>
</template>