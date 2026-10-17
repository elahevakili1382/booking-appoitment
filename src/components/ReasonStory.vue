<script setup lang="ts">
// import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  const el = root.value // ✅ متغیر محلی بسازید
  if (!el) return

  const slides = Array.from(el.querySelectorAll<HTMLElement>('[data-slide]'))
  const n = slides.length

  mm = gsap.matchMedia()
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    // حالت اولیه: فقط اسلاید اول دیده بشه
    gsap.set(slides.slice(1), { opacity: 0, y: 50 })

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, // ✅ از el استفاده کنید
        start: 'top top',
        end: `+=${n * 60}%`,
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

      // چک کردن وجود اسلایدها
      if (currentSlide && nextSlide) {
        tl.to(currentSlide, { opacity: 0, y: -50, duration: 0.4 }, t - 0.2)
        tl.fromTo(
          nextSlide,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.4 },
          t - 0.2,
        )
      }
    }
    tl.to({}, { duration: 0.2 }, n - 0.2)

    st = tl.scrollTrigger ?? null
  }, el) // ✅ از el استفاده کنید
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
  <section ref="root" class="relative w-full overflow-hidden bg-[#fefae0] px-page py-16 lg:h-screen lg:py-0">
    <div class="mx-auto grid w-full max-w-[1200px] gap-14 lg:h-full lg:grid-cols-2 lg:items-center lg:gap-0 lg:pt-24">
      <!-- ستون اول (راست در فارسی): ثابت -->
      <div class="lg:pe-16">
        <p class="font-display text-sm tracking-[0.4em] text-muted">REASON</p>
        <div class="mt-3 h-px w-12 bg-ink/40"></div>
        <h2 class="mt-8 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-bold leading-[1.6] text-ink">
          دلیل انتخاب کلینیک لومینا
        </h2>
        <p class="mt-8 border-s border-ink/35 ps-4 text-[14px] leading-8 text-muted">
          پزشک و تیمی باتجربه در کنار هم هستند تا نگرانی‌های پوستی شما را با آرامش حل کنند.
        </p>
      </div>

      <!-- ستون دوم: اسلایدها روی هم -->
      <div class="relative lg:border-s lg:border-ink/30 lg:ps-16">
        <div class="space-y-16 lg:grid lg:space-y-0">
          <article v-for="r in reasons" :key="r.no" data-slide class="relative lg:col-start-1 lg:row-start-1">
            <!-- عدد بزرگ کم‌رنگ پشت متن -->
            <span aria-hidden="true"
              class="pointer-events-none absolute -bottom-6 end-0 -z-0 font-display text-[9rem] font-bold leading-none text-ink/[0.06] lg:text-[11rem]">
              {{ r.no }}
            </span>

            <div class="relative z-10 mx-auto w-full max-w-[26rem]">
              <!-- ✅ اصلاح شد: تگ بسته شد و ویژگی تکراری حذف شد -->
              <NuxtImg :src="r.img" :alt="r.title" class="aspect-[5/4] w-full rounded-t-full object-cover"
                loading="lazy" format="webp" />

              <!-- ✅ متن‌ها حالا خارج از تگ تصویر قرار دارند -->
              <h3 class="mt-6 text-center font-display text-lg font-bold leading-8 text-ink">
                {{ r.title }}
              </h3>
              <p class="mt-4 text-[13.5px] leading-8 text-muted">{{ r.text }}</p>
              <div class="mt-5 h-px w-full bg-ink/35"></div>
            </div>
          </article>
        </div>

        <!-- نقطه‌های پیشرفت (فقط دسکتاپ) -->
        <div class="absolute end-[-2.5rem] top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
          <button v-for="(r, i) in reasons" :key="r.no" type="button"
            class="h-2.5 w-2.5 rounded-full transition-colors duration-300"
            :class="i === active ? 'bg-[#d4a373]' : 'bg-ink/20 hover:bg-ink/40'" :aria-label="`مرحله ${i + 1}`"
            :aria-current="i === active ? 'true' : undefined" @click="goTo(i)" />
        </div>
      </div>
    </div>
  </section>
</template>