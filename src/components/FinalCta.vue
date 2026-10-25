<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'

const { locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')

const root = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!root.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer?.disconnect()
      }
    },
    { threshold: 0.3 },
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section ref="root" class="w-full px-page py-16 md:py-24">
    <div
      class="mx-auto max-w-5xl rounded-[2.5rem] bg-primary px-6 py-14 text-center text-on-primary transition-all duration-700 sm:px-12 sm:py-20"
      :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'">
      <p class="font-display text-sm tracking-[0.4em] opacity-80">{{ isFa ? 'LUMINA CLINIC' : 'LUMINA CLINIC' }}</p>

      <h2 class="mt-5 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.5]">
        {{ isFa ? 'اولین قدم برای زیبایی واقعی‌تان همین امروز' : 'Your first step to true beauty starts today' }}
      </h2>

      <p class="mx-auto mt-4 max-w-xl text-[14px] leading-8 opacity-90">
        {{
          isFa
            ? 'با یک مشاوره‌ی رایگان شروع کنید؛ تیم لومینا در کنار شماست تا بهترین تصمیم را برای پوست و زیبایی‌تان بگیرید.'
            : 'Start with a free consultation — the Lumina team is here to help you make the best choice for your skin.'
        }}
      </p>

      <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="/book"
          class="inline-flex min-w-56 items-center justify-center rounded-full bg-white px-8 py-3.5 text-[14px] font-bold text-primary transition-transform duration-300 hover:scale-[1.03]">
          {{ isFa ? 'رزرو وقت مشاوره' : 'Book a consultation' }}
        </a>
        <a href="tel:02100000000"
          class="inline-flex min-w-56 items-center justify-center gap-2 rounded-full border border-white/50 px-8 py-3.5 text-[14px] font-bold transition-colors duration-300 hover:bg-white/10">
          <Icon name="ph:phone" class="h-4 w-4" />
          021-0000-0000
        </a>
      </div>
    </div>
  </section>
</template>