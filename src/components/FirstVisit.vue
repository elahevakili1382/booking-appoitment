<script setup lang="ts">
const buttons = [
  { label: 'راهنمای اولین مراجعه', href: '#', primary: true },
  { label: 'منوی درمان‌ها', href: '#', primary: false },
  { label: 'رزرو مشاوره', href: '#', primary: false },
]
</script>

<template>
  <section id="first-visit" class="relative w-full px-page py-16 md:py-24">
    <div class="mx-auto w-full max-w-[1200px]">
      <!-- عکس عریض با گوشه‌های گرد -->
      <NuxtImg src="/first-visit/first-visit.jpg" alt="فضای آرام کلینیک لومینا"
        class="aspect-[16/9] w-full rounded-[2rem] object-cover md:aspect-[3/1] md:rounded-[3rem]" loading="lazy"
        format="webp" />

      <!-- ردیف سه‌ستونه -->
      <div class="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr_auto] lg:items-start lg:gap-12">
        <!-- ستون ۱: عنوان -->
        <div>
          <p class="font-display text-sm tracking-[0.4em] text-muted">FIRST VISIT</p>
          <h2 class="mt-4 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.6] text-ink">
            سه راه برای شروعی آرام
          </h2>
        </div>

        <!-- ستون ۲: متن با خط کناری -->
        <div class="border-s border-ink/35 ps-6 text-[14px] leading-8 text-muted">
          <p>«مراجعه به کلینیک زیبایی کمی نگران‌کننده است…»</p>
          <p>«کدام درمان برای من مناسب است؟»</p>
          <p class="mt-4">
            لومینا برای همین لحظه‌هاست. کافی است با یک مشاوره‌ی آرام شروع کنید.
          </p>
        </div>

        <!-- ستون ۳: کادر کوچیک + دکمه‌ها -->
        <div class="flex flex-col gap-3 lg:w-64">
          <p class="rounded-xl bg-white/60 px-4 py-3 text-[12px] leading-6 text-muted">
            درمان‌های پیشنهادی دیگر هم معرفی شده‌اند. اگر اولین بار است، از اینجا شروع کنید.
          </p>

          <a v-for="b in buttons" :key="b.label" :href="b.href"
            class="rounded-full px-6 py-3 text-center text-[14px] transition-colors duration-300" :class="b.primary
              ? 'bg-[#d4a373] text-white hover:bg-[#c08f5e]'
              : 'border border-[#d4a373]/60 text-ink hover:bg-[#d4a373]/10'
              ">
            {{ b.label }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>